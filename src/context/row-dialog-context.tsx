import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'

type RowDialogContextType<TRow, TDialog extends string> = {
  open: TDialog | null
  setOpen: (dialog: TDialog | null) => void
  /** Row whose action opened the dialog. */
  currentRow: TRow | null
  setCurrentRow: React.Dispatch<React.SetStateAction<TRow | null>>
}

/**
 * Provider and hook that let table row actions open a page's dialogs
 * (the pattern used by every list page with row actions).
 */
export function createRowDialogContext<TRow, TDialog extends string>(
  name: string
) {
  const Context = React.createContext<RowDialogContextType<
    TRow,
    TDialog
  > | null>(null)

  function Provider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useDialogState<TDialog>(null)
    const [currentRow, setCurrentRow] = useState<TRow | null>(null)

    return (
      <Context value={{ open, setOpen, currentRow, setCurrentRow }}>
        {children}
      </Context>
    )
  }

  function useRowDialog() {
    const context = React.useContext(Context)
    if (!context) {
      throw new Error(`use${name} has to be used within <${name}Provider>`)
    }
    return context
  }

  return [Provider, useRowDialog] as const
}
