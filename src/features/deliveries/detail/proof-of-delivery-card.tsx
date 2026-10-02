import { type Delivery } from '@/api/deliveries'
import { formatTime } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type SignatureProps = {
  title: string
  image: string
  caption: string
}

function Signature({ title, image, caption }: SignatureProps) {
  return (
    <figure className='space-y-2'>
      <figcaption className='text-sm text-muted-foreground'>{title}</figcaption>
      <img
        src={image}
        alt={title}
        className='h-28 w-full rounded-md border bg-white object-contain p-2'
      />
      <p className='text-sm'>{caption}</p>
    </figure>
  )
}

export function ProofOfDeliveryCard({ delivery }: { delivery: Delivery }) {
  const { pod, skipReason } = delivery

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proof of delivery</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {pod ? (
          <>
            <Signature
              title='Customer signature'
              image={pod.customerSignature}
              caption={`${pod.customerName} · ${pod.customerPosition} · ${formatTime(pod.customerSignedAt)}`}
            />
            <Signature
              title='Driver signature'
              image={pod.driverSignature}
              caption={`${pod.driverName} · Driver · ${formatTime(pod.driverSignedAt)}`}
            />
          </>
        ) : (
          <p className='text-sm text-muted-foreground'>
            {skipReason
              ? `Not delivered: ${skipReason}.`
              : 'Available once the stop is delivered.'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
