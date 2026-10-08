type PageTitleProps = {
  title: React.ReactNode
  description?: React.ReactNode
  /** Primary actions or filters shown on the right. */
  children?: React.ReactNode
}

export function PageTitle({ title, description, children }: PageTitleProps) {
  return (
    <div className='flex flex-wrap items-end justify-between gap-2'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
        {description && <p className='text-muted-foreground'>{description}</p>}
      </div>
      {children && (
        <div className='flex flex-wrap items-center gap-2'>{children}</div>
      )}
    </div>
  )
}
