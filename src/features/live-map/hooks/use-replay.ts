import { useEffect, useState } from 'react'

const STEP_MS = 300

type ReplayState = {
  shiftId: string | undefined
  /** Position being replayed; `null` follows the latest one. */
  index: number | null
  playing: boolean
}

/** Day replay over a shift's trail; resets when another shift is selected. */
export function useReplay(shiftId: string | undefined, length: number) {
  const [state, setState] = useState<ReplayState>({
    shiftId,
    index: null,
    playing: false,
  })
  const current: ReplayState =
    state.shiftId === shiftId ? state : { shiftId, index: null, playing: false }
  const { index, playing } = current

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => {
      setState((previous) => {
        const next = (previous.index ?? 0) + 1
        return next >= length - 1
          ? { ...previous, index: null, playing: false }
          : { ...previous, index: next }
      })
    }, STEP_MS)
    return () => clearInterval(timer)
  }, [playing, length])

  return {
    index,
    playing,
    seek: (to: number) =>
      setState({
        shiftId,
        index: to >= length - 1 ? null : to,
        playing: false,
      }),
    play: () => setState({ shiftId, index: index ?? 0, playing: true }),
    pause: () => setState({ ...current, playing: false }),
    restart: () => setState({ shiftId, index: 0, playing: true }),
  }
}
