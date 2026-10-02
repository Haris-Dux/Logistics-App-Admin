import { useFormContext } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { depotsQueryOptions } from '@/api/depots'
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { SelectDropdown } from '@/components/select-dropdown'

/** Select value standing for "no depot" (head office sees every depot). */
export const HEAD_OFFICE = 'head-office'

/** Depot select for a form with a `depotId` field. */
export function DepotField({ allowHeadOffice }: { allowHeadOffice?: boolean }) {
  const { control } = useFormContext<{ depotId: string }>()
  const { data: depots, isPending } = useQuery(depotsQueryOptions())
  const items = [
    ...(allowHeadOffice
      ? [{ label: 'Head office (all depots)', value: HEAD_OFFICE }]
      : []),
    ...(depots ?? []).map((depot) => ({ label: depot.name, value: depot.id })),
  ]

  return (
    <FormField
      control={control}
      name='depotId'
      render={({ field }) => (
        <FormItem>
          <FormLabel>Depot</FormLabel>
          <SelectDropdown
            defaultValue={field.value}
            onValueChange={field.onChange}
            placeholder='Select a depot'
            isPending={isPending}
            items={items}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
