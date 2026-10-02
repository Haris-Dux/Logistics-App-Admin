import { type Socket, io } from 'socket.io-client'

/** Resources whose REST queries a `changed` event refreshes. */
export const liveResources = [
  'shifts',
  'deliveries',
  'messages',
  'alerts',
  'vehicle-checks',
] as const
export type LiveResource = (typeof liveResources)[number]

/** Events the server pushes. Payloads are validated by the handlers. */
interface ServerToClientEvents {
  /** Batches of GPS fixes, including late uploads after signal loss. */
  positions: (positions: unknown) => void
  /** A resource changed; refetch it over REST. */
  changed: (event: { resource: LiveResource }) => void
}

type FleetSocket = Socket<ServerToClientEvents>

export const isLiveUpdatesEnabled = () => !!import.meta.env.VITE_SOCKET_URL

export const createFleetSocket = (token: string): FleetSocket =>
  io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: false,
    auth: { token },
    transports: ['websocket'],
  })
