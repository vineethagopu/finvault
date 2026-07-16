<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## PolicyNext — local dev setup (read this first)

Context for whoever (human, Claude, or Codex) picks this up next.

### Database

- Postgres runs in Docker: `docker run -d --name finvault-pg -e POSTGRES_USER=policynext -e POSTGRES_PASSWORD=dev_password -e POSTGRES_DB=policynext -p 5432:5432 postgres:16-alpine` (or `docker start finvault-pg` if it already exists).
- `backend/.env` → `DATABASE_URL="postgresql://policynext:dev_password@localhost:5432/policynext?schema=public"`. The Prisma-init default (`prisma+postgres://…`, for the `prisma dev` local server) is kept commented above it — don't uncomment it, `prisma.service.ts` uses the `PrismaPg` driver adapter which requires a plain `postgres://` URL, not `prisma+postgres://`.
- Schema changes go through **real migrations**, not `db push`: `npm run db:migrate` (dev, prompts for a migration name), `npm run db:migrate:deploy` (CI/prod, non-interactive), `npm run db:reset` (drops and replays all migrations — dev only).
- Seed data: `npm run db:seed` (wired via `prisma.config.ts` → `migrations.seed`, runs `backend/prisma/seed.ts`). Creates demo user **rajat.sharma / Rajat@123** (matches the "Skip login (dev only)" button in `frontend/src/modules/auth/LoginPage.tsx`) plus one sample policy/investment/loan/beneficiary/notification so the dashboard isn't empty.

### Email

- `backend/src/email/` is a `@Global()` NestJS module (`EmailService`) using `nodemailer`.
- If `SMTP_HOST` is **not** set in `.env`, it auto-provisions a free [Ethereal](https://ethereal.email) test inbox on boot (no signup, no real credentials) — mail never actually leaves Ethereal. Every send logs a preview URL (`nodemailer.getTestMessageUrl`) to view the rendered email in a browser.
- To use real SMTP (e.g. Gmail app password), set `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` in `.env` (see `.env.example`) — the service switches automatically, no code change needed.
- `sendMail()` always catches its own errors and logs rather than throwing — email delivery must never break register/login/OTP flows. Callers (see `auth.service.ts`) fire-and-forget it (`void this.emailService.sendMail(...)`), they don't `await` it on the critical path.

### Auth / registration — OTP is not gating entry right now

- `POST /auth/register` creates and returns a user directly; it has never actually required a verified-OTP proof (the `emailVerified/mobileVerified: true` on create was just hardcoded). `sendOtp`/`verifyOtp` endpoints still exist and still work (and `sendOtp` really emails a code via `EmailService` now) — they're just not wired into the signup gate.
- `frontend/src/modules/auth/CreateAccountPage.tsx` (`/register/:planType`) is a single-step form: fill in → `POST /auth/register` → `POST /auth/login` (to actually get session cookies, since `/auth/register` itself doesn't set any) → done. The multi-step OTP UI (steps "Verify Email"/"Verify Mobile") was removed because it was already broken — `handleStep1` advanced `step` to `2`/`3` but the JSX only ever rendered `step === 1` and `step === 4`, so the OTP screens were unreachable dead code before this cleanup.
- Because the app's `RequireGuest` route guard (`frontend/src/routes/index.tsx`) redirects any authenticated user away from `/register/*` and `/login`, a successful register/login flips `isAuthenticated` in the Zustand store and the router immediately bounces to `/app/dashboard` — the "Account Created!" success screen is functionally a flash/toast, not a page you linger on. That's expected, not a bug.
- If real OTP-gated signup is wanted later, re-add the check inside `AuthService.register()` (require a recent `verifyOtp` result for the given email/mobile before creating the user) rather than only gating in the frontend.

### Sandbox networking gotcha

- Bash-tool commands run sandboxed and **cannot reach Docker's published ports** (e.g. `localhost:5432`) even though the container is listening. Run anything that talks to Postgres (`prisma migrate`, `prisma db seed`, `prisma studio`, etc.) from a host-level shell (PowerShell on this machine), not the sandboxed Bash tool.
- `npm run dev` (root) must also run from the host for the same reason — under the sandbox it'll hang forever in `PrismaService.onModuleInit()`'s `$connect()`.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
