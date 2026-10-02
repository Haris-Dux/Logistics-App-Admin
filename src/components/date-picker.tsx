import { parseISO } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { toDateParam } from '@/lib/dates'
import { formatDay } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerProps = {
  /** Selected day, `YYYY-MM-DD`. */
  value: string
  onChange: (value: string) => void
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const selected = parseISO(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='justify-start font-normal'>
          <CalendarIcon className='opacity-50' />
          {formatDay(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='end'>
        <Calendar
          mode='single'
          selected={selected}
          defaultMonth={selected}
          onSelect={(day) => day && onChange(toDateParam(day))}
          disabled={{ after: new Date() }}
        />
      </PopoverContent>
    </Popover>
  )
}
