type DetailListProps = {
  /** Label and value pairs; empty values show as a dash. */
  items: [label: string, value: React.ReactNode][]
}

export function DetailList({ items }: DetailListProps) {
  return (
    <dl className='divide-y text-sm'>
      {items.map(([label, value]) => (
        <div key={label} className='grid grid-cols-2 gap-2 py-2'>
          <dt className='text-muted-foreground'>{label}</dt>
          <dd>{value || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}
