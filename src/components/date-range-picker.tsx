import { parseISO } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { type DateRange } from '@/api/common'
import { toDateParam } from '@/lib/dates'
import { formatDay } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DateRangePickerProps = {
  value: DateRange
  onChange: (value: DateRange) => void
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const from = parseISO(value.from)
  const to = parseISO(value.to)
  const label =
    value.from === value.to
      ? formatDay(value.from)
      : `${formatDay(value.from)} – ${formatDay(value.to)}`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='justify-start font-normal'>
          <CalendarIcon className='opacity-50' />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='end'>
        <Calendar
          mode='range'
          numberOfMonths={2}
          defaultMonth={from}
          selected={{ from, to }}
          onSelect={(range) => {
            if (!range?.from) return
            onChange({
              from: toDateParam(range.from),
              to: toDateParam(range.to ?? range.from),
            })
          }}
          disabled={{ after: new Date() }}
        />
      </PopoverContent>
    </Popover>
  )
}
