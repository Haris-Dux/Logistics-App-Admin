import { type Position } from '@/api/positions'

export type TimelineKind = 'checks' | 'driving' | 'stopped' | 'no_signal'

type TimelineSegment = { kind: TimelineKind; from: Date; to: Date }

/** Metres per second above which the van counts as moving. */
const MOVING_SPEED = 1

/**
 * Turns a GPS trail into the coloured stretches of the day timeline:
 * checks and loading until the van first moves, then driving or stopped,
 * and "no signal" where points were uploaded late.
 */
export function buildTimelineSegments(positions: Position[]) {
  const segments: TimelineSegment[] = []
  let departed = false
  for (let i = 1; i < positions.length; i++) {
    const from = positions[i - 1]
    const to = positions[i]
    const moving = from.speed > MOVING_SPEED || to.speed > MOVING_SPEED
    departed ||= moving
    const kind: TimelineKind =
      from.late || to.late
        ? 'no_signal'
        : !departed
          ? 'checks'
          : moving
            ? 'driving'
            : 'stopped'
    const last = segments[segments.length - 1]
    if (last?.kind === kind) last.to = to.recordedAt
    else segments.push({ kind, from: from.recordedAt, to: to.recordedAt })
  }
  return segments
}

/** Index of the last position recorded at or before `time` (0 if none). */
export function indexAtTime(positions: Position[], time: Date) {
  let index = 0
  while (
    index + 1 < positions.length &&
    positions[index + 1].recordedAt <= time
  ) {
    index++
  }
  return index
}
