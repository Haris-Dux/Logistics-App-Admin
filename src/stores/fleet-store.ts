import { create } from 'zustand'
import { type Position } from '@/api/positions'
import { latestFix } from '@/lib/fleet'

interface FleetState {
  /** Latest live position per vehicle, pushed over the socket. */
  positions: Record<string, Position>
  updatePositions: (positions: Position[]) => void
}

export const useFleetStore = create<FleetState>()((set) => ({
  positions: {},
  updatePositions: (incoming) =>
    set((state) => {
      const positions = { ...state.positions }
      for (const position of incoming) {
        positions[position.vehicleId] =
          latestFix(positions[position.vehicleId], position) ?? position
      }
      return { positions }
    }),
}))
