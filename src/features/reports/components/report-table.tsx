import { type ReportRow } from '@/api/reports'
import { formatDuration, formatPercent } from '@/lib/format'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const NUMERIC = 'text-end tabular-nums'

type ReportTableProps = {
  /** Heading of the first column, e.g. "Driver". */
  label: string
  rows: ReportRow[]
}

export function ReportTable({ label, rows }: ReportTableProps) {
  return (
    <div className='overflow-hidden rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{label}</TableHead>
            <TableHead className='text-end'>Trips</TableHead>
            <TableHead className='text-end'>Stops</TableHead>
            <TableHead className='text-end'>Delivered</TableHead>
            <TableHead className='text-end'>Skipped</TableHead>
            <TableHead className='text-end'>On time</TableHead>
            <TableHead className='text-end'>Miles (planned → actual)</TableHead>
            <TableHead className='text-end'>Time (planned → actual)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className='h-24 text-center'>
                No trips in this period.
              </TableCell>
            </TableRow>
          )}
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className='font-medium'>{row.name}</TableCell>
              <TableCell className={NUMERIC}>{row.trips}</TableCell>
              <TableCell className={NUMERIC}>{row.deliveries}</TableCell>
              <TableCell className={NUMERIC}>{row.delivered}</TableCell>
              <TableCell className={NUMERIC}>{row.skipped}</TableCell>
              <TableCell className={NUMERIC}>
                {formatPercent(row.onTime, row.delivered)}
              </TableCell>
              <TableCell className={NUMERIC}>
                {row.plannedMiles} → {row.actualMiles}
              </TableCell>
              <TableCell className={NUMERIC}>
                {formatDuration(row.plannedMinutes)} →{' '}
                {formatDuration(row.actualMinutes)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
