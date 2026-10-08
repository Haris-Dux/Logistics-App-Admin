import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StatCardProps = {
  title: string
  value: React.ReactNode
  /** Shown after the value as `/ total`. */
  total?: React.ReactNode
  /** Colour of the value, e.g. red for problems. */
  color?: string
  children?: React.ReactNode
}

export function StatCard({
  title,
  value,
  total,
  color,
  children,
}: StatCardProps) {
  return (
    <Card className='gap-2 py-4'>
      <CardHeader className='px-4'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2 px-4'>
        <p className='text-3xl font-bold tabular-nums' style={{ color }}>
          {value}
          {total !== undefined && (
            <span className='text-base font-semibold text-muted-foreground'>
              {' '}
              / {total}
            </span>
          )}
        </p>
        {children}
      </CardContent>
    </Card>
  )
}
