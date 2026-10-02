import { create } from 'zustand'
import { getCookie, removeCookie, setCookie } from '@/lib/cookies'
import { useAuthStore } from './auth-store'

const SELECTED_DEPOT = 'logisticapp_depot'

interface DepotState {
  /** Depot picked by a head-office admin; `null` = all depots. */
  selectedDepotId: string | null
  setSelectedDepotId: (depotId: string | null) => void
}

export const useDepotStore = create<DepotState>()((set) => ({
  selectedDepotId: getCookie(SELECTED_DEPOT) ?? null,
  setSelectedDepotId: (depotId) => {
    if (depotId) setCookie(SELECTED_DEPOT, depotId)
    else removeCookie(SELECTED_DEPOT)
    set({ selectedDepotId: depotId })
  },
}))

/**
 * Depot the signed-in admin is working in: their own depot, or the one a
 * head-office admin picked. `undefined` means every depot.
 */
export function useDepotId(): string | undefined {
  const ownDepotId = useAuthStore((state) => state.auth.user?.depotId)
  const selectedDepotId = useDepotStore((state) => state.selectedDepotId)
  return ownDepotId ?? selectedDepotId ?? undefined
}
