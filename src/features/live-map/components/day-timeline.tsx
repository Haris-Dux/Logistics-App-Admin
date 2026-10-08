import { useMemo } from 'react'
import { statusColors, stopStates } from '@/config/statuses'
import { Pause, Play } from 'lucide-react'
import { type Delivery } from '@/api/deliveries'
import { type Position } from '@/api/positions'
import { formatTime } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  type TimelineKind,
  buildTimelineSegments,
  indexAtTime,
} from '../utils/timeline'

const SEGMENT_STYLES: Record<
  TimelineKind,
  { label: string; background: string }
> = {
  checks: { label: 'Checks & loading', background: statusColors.lightSlate },
  driving: { label: 'Driving', background: statusColors.green },
  no_signal: {
    label: 'No signal (filled in later)',
    background: `repeating-linear-gradient(90deg, ${statusColors.green} 0 6px, #86efac 6px 10px)`,
  },
  stopped: { label: 'Stopped', background: 'transparent' },
}
const LEGEND: TimelineKind[] = ['checks', 'driving', 'no_signal']
const AXIS_TICKS = 5

type DayTimelineProps = {
  title: string
  positions: Position[]
  stops: Delivery[]
  start: Date
  end: Date
  /** Shown when the day is still running. */
  now?: Date
  index: number
  playing: boolean
  onSeek: (index: number) => void
  onPlay: () => void
  onPause: () => void
}

export function DayTimeline({
  title,
  positions,
  stops,
  start,
  end,
  now,
  index,
  playing,
  onSeek,
  onPlay,
  onPause,
}: DayTimelineProps) {
  const span = Math.max(1, end.getTime() - start.getTime())
  const offset = (time: Date) =>
    `${Math.min(100, Math.max(0, ((time.getTime() - start.getTime()) / span) * 100))}%`
  const segments = useMemo(() => buildTimelineSegments(positions), [positions])
  const current = positions[index]
  const minutes = (time: Date) =>
    Math.round((time.getTime() - start.getTime()) / 60_000)

  return (
    <div className='space-y-3 border-t p-4'>
      <div className='flex items-center gap-3'>
        <Button
          size='icon'
          variant='outline'
          className='size-8'
          disabled={positions.length < 2}
          onClick={playing ? onPause : onPlay}
          aria-label={playing ? 'Pause replay' : 'Replay'}
        >
          {playing ? <Pause /> : <Play />}
        </Button>
        <p className='font-semibold'>Day timeline: {title}</p>
        {current && (
          <span className='ms-auto text-sm text-muted-foreground tabular-nums'>
            {formatTime(current.recordedAt)}
          </span>
        )}
      </div>

      <div className='relative h-6 overflow-hidden rounded bg-muted'>
        {segments.map((segment) => (
          <div
            key={segment.from.toISOString()}
            className='absolute inset-y-0'
            style={{
              left: offset(segment.from),
              width: `calc(${offset(segment.to)} - ${offset(segment.from)})`,
              background: SEGMENT_STYLES[segment.kind].background,
            }}
          />
        ))}
        {stops
          .filter((stop) => stop.actualArrival)
          .map((stop) => (
            <div
              key={stop.id}
              className='absolute inset-y-0 w-0.5'
              style={{
                left: offset(stop.actualArrival!),
                backgroundColor:
                  stop.status === 'skipped'
                    ? stopStates.skipped.color
                    : '#14532d',
              }}
            />
          ))}
        {now && (
          <div
            className='absolute inset-y-0 w-0.5 bg-foreground'
            style={{ left: offset(now) }}
          />
        )}
      </div>

      <Slider
        min={0}
        max={minutes(end)}
        value={[current ? minutes(current.recordedAt) : 0]}
        onValueChange={([value]) =>
          onSeek(
            indexAtTime(positions, new Date(start.getTime() + value * 60_000))
          )
        }
        aria-label='Replay time'
      />

      <div className='flex justify-between text-xs text-muted-foreground tabular-nums'>
        {Array.from({ length: AXIS_TICKS }, (_, tick) => (
          <span key={tick}>
            {formatTime(
              new Date(start.getTime() + (span * tick) / (AXIS_TICKS - 1))
            )}
          </span>
        ))}
      </div>

      <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
        {LEGEND.map((kind) => (
          <span key={kind} className='flex items-center gap-1.5'>
            <span
              className='h-2.5 w-4 rounded-sm'
              style={{ background: SEGMENT_STYLES[kind].background }}
            />
            {SEGMENT_STYLES[kind].label}
          </span>
        ))}
        <span className='flex items-center gap-1.5'>
          <span className='h-2.5 w-0.5 bg-green-900' /> Stop
        </span>
        {now && (
          <span className='flex items-center gap-1.5'>
            <span className='h-2.5 w-0.5 bg-foreground' /> Now
          </span>
        )}
      </div>
    </div>
  )
}
