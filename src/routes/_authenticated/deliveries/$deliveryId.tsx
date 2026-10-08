import { createFileRoute } from '@tanstack/react-router'
import { DeliveryDetail } from '@/features/deliveries/detail'

export const Route = createFileRoute('/_authenticated/deliveries/$deliveryId')({
  component: DeliveryDetail,
})
