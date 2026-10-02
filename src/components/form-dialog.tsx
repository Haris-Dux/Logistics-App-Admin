import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type FormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** `id` of the form rendered in `children`; the submit button targets it. */
  formId: string
  submitLabel: string
  isPending?: boolean
  children: React.ReactNode
}

/** Dialog shell for a single form with a submit button in the footer. */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  formId,
  submitLabel,
  isPending,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button type='submit' form={formId} disabled={isPending}>
            {isPending && <Loader2 className='animate-spin' />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
