import { type ContainerCounts } from '@/api/common'
import { type Delivery } from '@/api/deliveries'
import { formatPence } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const CONTAINER_TYPES: (keyof ContainerCounts)[] = ['cages', 'pallets', 'totes']

export function InvoicesCard({ delivery }: { delivery: Delivery }) {
  const containerRows: [string, ContainerCounts][] = delivery.containers
    ? [
        ['Delivered', delivery.containers.delivered],
        ['Collected', delivery.containers.collected],
      ]
    : [['Outstanding', delivery.outstanding]]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className='text-end'>Qty</TableHead>
              <TableHead className='text-end'>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {delivery.invoices.map((invoice) => (
              <TableRow key={invoice.invoiceNumber}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.orderNumber}</TableCell>
                <TableCell className='text-end tabular-nums'>
                  {invoice.quantity}
                </TableCell>
                <TableCell className='text-end tabular-nums'>
                  {formatPence(invoice.value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className='space-y-2'>
          <h4 className='font-semibold'>
            Containers {delivery.containers && '(from POD)'}
          </h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                {CONTAINER_TYPES.map((type) => (
                  <TableHead key={type} className='text-end capitalize'>
                    {type}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {containerRows.map(([label, counts]) => (
                <TableRow key={label}>
                  <TableCell>{label}</TableCell>
                  {CONTAINER_TYPES.map((type) => (
                    <TableCell key={type} className='text-end tabular-nums'>
                      {counts[type]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {delivery.itemsNotInDelivery && (
          <p className='rounded-md border border-dashed p-3 text-sm'>
            <span className='font-semibold'>Not delivered: </span>
            {delivery.itemsNotInDelivery}
          </p>
        )}
        {delivery.notes && (
          <p className='rounded-md border border-dashed p-3 text-sm'>
            <span className='font-semibold'>Driver note: </span>
            {delivery.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
