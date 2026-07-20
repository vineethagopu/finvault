import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { API_BASE_URL } from '@/constants'
import { queryKeys } from '@/services/queryKeys'
import { useAuthStore } from '@/store/authStore'

/**
 * Opens one Server-Sent Events connection for the authenticated session and
 * turns server pushes into React Query cache invalidations — the mounted
 * components refetch and update live, with no page reload.
 *
 * EventSource sends the JWT cookie (withCredentials) and auto-reconnects, so
 * there's no polling and no manual reconnect logic. Mount once in the app shell.
 */
export function useServerEvents(): void {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return

    const source = new EventSource(`${API_BASE_URL}/events/stream`, { withCredentials: true })

    source.onmessage = (event) => {
      let type = ''
      try {
        // Tolerate both the raw event ({ type }) and the API envelope
        // ({ success, data: { type } }) in case the global interceptor wraps it.
        const parsed = JSON.parse(event.data) as { type?: string; data?: { type?: string } }
        type = parsed.type ?? parsed.data?.type ?? ''
      } catch {
        return
      }
      if (type.startsWith('notification')) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() })
      }
    }

    // EventSource reconnects on its own; nothing to do on error.
    return () => source.close()
  }, [isAuthenticated, queryClient])
}
