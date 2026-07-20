import { Injectable } from '@nestjs/common'
import { Observable, Subject } from 'rxjs'
import { filter, map } from 'rxjs/operators'

export interface AppEvent {
  /** Dotted event name, e.g. 'notification.created' | 'dashboard.changed'. */
  type: string
  payload?: unknown
}

interface UserEvent extends AppEvent {
  userId: string
}

/**
 * In-memory realtime event bus for Server-Sent Events.
 *
 * Domain services call `emit(userId, event)` after a write; the SSE controller
 * subscribes per-user via `streamFor(userId)`. Single-node only — to scale to
 * multiple backend replicas, back this Subject with Redis Pub/Sub (each node
 * publishes/subscribes) without changing callers or the controller.
 */
@Injectable()
export class EventsService {
  private readonly stream$ = new Subject<UserEvent>()

  /** Push an event to a specific user's live SSE connections. */
  emit(userId: string, event: AppEvent): void {
    this.stream$.next({ userId, ...event })
  }

  /** Observable of SSE messages scoped to one user. */
  streamFor(userId: string): Observable<{ data: AppEvent }> {
    return this.stream$.pipe(
      filter((e) => e.userId === userId),
      map(({ userId: _uid, ...event }) => ({ data: event })),
    )
  }
}
