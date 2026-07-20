# PolicyNext — Architecture, Realtime & Scaling Plan

Senior-level reference for how the system is layered today, how realtime is
added without reloads, and how it scales to 1000+ users cheaply and portably.

---

## 1. Layered architecture (current)

```
Frontend (React + Vite, SPA — no full-page reloads)
  modules/<feature>/*Page.tsx        UI only
  services/http.ts                   ← single transport seam (envelope unwrap)
  services/*Service.ts               API layer, returns typed domain data
  services/queryKeys.ts              React Query cache-key registry
  store/*                            client state (zustand)

Backend (NestJS)
  <feature>/ controller→service→dto  request/response + business logic
  common/ guards|filters|interceptors cross-cutting (auth, envelope, errors)
  email/ + sms/  → *Provider behind DI token  swappable integrations
  prisma/  data access
```

**Separation of concerns is enforced at the seams:** the frontend never touches
the HTTP envelope (only `http.ts` does), features never build their own cache
keys, and provider integrations (email/SMS) sit behind interfaces + DI tokens so
swapping Nodemailer→SES or Twilio→MSG91 is a one-line module change.

---

## 2. Configuration — single source of truth

- **Root `.env`** is the only file you edit. Docker Compose auto-loads it and
  injects the right variables into each service via `${VAR:-default}`.
- `docker-compose.yml` (prod) and `docker-compose.override.yml` (dev) both read
  from it — no secrets are hardcoded in compose anymore.
- `.env.example` (root) is the one canonical template. Per-app `.env` files are
  only needed for running a service **standalone** (no Docker).
- **12-factor**: all config is environment-driven, so the same image runs in
  dev, staging, and any cloud unchanged — this is what makes it "easy to shift."

---

## 3. Realtime without page reloads (SSE)

The app is already a no-reload SPA. "Realtime" means the server **pushes**
changes so the UI updates itself. Chosen transport: **Server-Sent Events (SSE)**
— one-directional server→client over plain HTTP. Cheaper and simpler than
WebSockets, no sticky-session requirement, and ideal for notifications/dashboard.

### Backend (NestJS)
```ts
// events/events.controller.ts
@Sse('stream')
stream(@CurrentUser() user: User): Observable<MessageEvent> {
  // per-user channel; push { type, payload } messages
  return this.events.streamFor(user.id)
}
```
- An `EventsService` holds a per-user `Subject` (in-memory for single node).
- Domain services emit on write, e.g. after creating a notification:
  `this.events.emit(userId, { type: 'notification.created' })`.
- Auth reuses the existing JWT cookie — no new auth path.

### Frontend
```ts
// one EventSource per session; map event → cache invalidation
const es = new EventSource(`${API}/events/stream`, { withCredentials: true })
es.addEventListener('message', (e) => {
  const { type } = JSON.parse(e.data)
  if (type.startsWith('notification')) qc.invalidateQueries({ queryKey: queryKeys.notifications.all() })
  if (type === 'dashboard.changed')    qc.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
})
```
- Because data flows through `queryKeys` + React Query, a push just invalidates
  the relevant key and the already-mounted component refetches — **no layout or
  functionality changes, nothing re-renders the page shell.**
- Graceful fallback: EventSource auto-reconnects; if SSE is unavailable, the
  existing `refetchInterval` on the dashboard still keeps data fresh.

### At scale (multi-node)
In-memory subjects only fan out within one process. When you run >1 backend
replica, publish events through **Redis Pub/Sub** (Redis is already in the
stack): each node subscribes and forwards to its locally-connected clients. No
client change. SSE holds one long-lived connection per user; size `worker_connections`
in nginx and the Node `--max-http-header-size`/keep-alive accordingly.

---

## 4. Scaling to 1000+ concurrent users

The backend is **stateless** (JWT in HttpOnly cookies, sessions/refresh in
Redis, no in-process user state) — the precondition for horizontal scaling.

| Concern | ≤1000 users | Growth path |
|---|---|---|
| Backend | 1 container (2 vCPU) | `docker compose up --scale backend=N` behind nginx; round-robin |
| SSE fan-out | in-memory | Redis Pub/Sub adapter (§3) |
| Postgres | single instance, tuned | managed PG + read replica for reports |
| Redis | single, `maxmemory 256mb` `allkeys-lru` (already set) | managed Redis |
| Static frontend | nginx serving built assets | CDN in front of nginx |
| Uploads | local volume | S3 (email/SMS-style provider seam already exists to add it) |

**Concrete tuning for 1000 users on one node:**
- Postgres: `max_connections=100`, put a pooler (PgBouncer) in front if the
  backend opens many; Prisma connection limit ~10–20 per backend instance.
- Node: run under the Nest cluster or 2–4 replicas; each handles hundreds of
  mostly-idle SSE connections comfortably.
- nginx: `worker_connections 4096;` `proxy_read_timeout` high for `/events`.
- Add a real `/health` (liveness) + readiness check (compose already probes it).

---

## 5. Cost — cheap by default, scale when paid to

- **Single VPS (2 vCPU / 4 GB), all containers via `docker compose`** comfortably
  serves ~1000 users for insurance-portal traffic (bursty, not chat-heavy):
  roughly **$20–40/mo** (Hetzner/DigitalOcean/Linode). One box, one command.
- Keep Postgres/Redis **in-container** until traffic justifies managed services;
  moving to managed DB (~$15–50/mo each) buys backups/failover, not needed early.
- SSE over WebSockets saves cost: no sticky LB, fewer moving parts, lower memory
  per connection.
- Because everything is env-driven containers, "shifting" providers/hosts is a
  redeploy, not a rewrite — no lock-in.

---

## 6. Recommended sequence

1. ✅ Layered API/transport + provider abstraction (done)
2. ✅ Single-source config (done)
3. **SSE events module** (backend `events/` + frontend EventSource → invalidation)
4. `/health` readiness endpoint + nginx tuning
5. Redis Pub/Sub fan-out (only when running >1 backend replica)
6. S3 storage provider + CDN (only when uploads/traffic grow)
