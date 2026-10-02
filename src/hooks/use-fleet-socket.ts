import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { positionsSchema } from '@/api/positions'
import { useAuthStore } from '@/stores/auth-store'
import { useFleetStore } from '@/stores/fleet-store'
import {
  type LiveResource,
  createFleetSocket,
  isLiveUpdatesEnabled,
  liveResources,
} from '@/lib/socket'

/**
 * Keeps one live connection open while signed in. Positions go to the fleet
 * store; every other change refetches the affected REST queries.
 */
export function useFleetSocket() {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.auth.accessToken)
  const updatePositions = useFleetStore((state) => state.updatePositions)

  useEffect(() => {
    if (!accessToken || !isLiveUpdatesEnabled()) return

    const socket = createFleetSocket(accessToken)
    const refetch = (resource: LiveResource) =>
      queryClient.invalidateQueries({ queryKey: [resource] })

    // After a reconnect, refetch everything to fill the gap we missed
    let hasConnected = false
    socket.on('connect', () => {
      if (hasConnected) liveResources.forEach(refetch)
      hasConnected = true
    })

    socket.on('positions', (payload) => {
      const positions = positionsSchema.parse(payload)
      updatePositions(positions)
      // Trails are refetched so late batches land in recorded order
      for (const shiftId of new Set(positions.map((p) => p.shiftId))) {
        queryClient.invalidateQueries({ queryKey: ['positions', shiftId] })
      }
    })

    socket.on('changed', ({ resource }) => refetch(resource))

    // Browsers pause background tabs and drop sockets on network changes
    const reconnectIfNeeded = () => {
      if (!document.hidden && socket.disconnected) socket.connect()
    }
    window.addEventListener('online', reconnectIfNeeded)
    document.addEventListener('visibilitychange', reconnectIfNeeded)
    socket.connect()

    return () => {
      window.removeEventListener('online', reconnectIfNeeded)
      document.removeEventListener('visibilitychange', reconnectIfNeeded)
      socket.disconnect()
    }
  }, [accessToken, queryClient, updatePositions])
}
