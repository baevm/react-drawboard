import { useDrawings, useDrawingsActions } from '@/hooks/useDrawings'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { useState } from 'react'
import { IoTrashOutline } from 'react-icons/io5'
import styles from './ClearCanvasButton.module.css'

export const ClearCanvasButton = () => {
  const { setDrawings, clearDrawings } = useDrawingsActions()
  const [open, setOpen] = useState(false)

  const handleClearCanvas = () => {
    clearDrawings()
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button title='Reset board'>
          <IoTrashOutline />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={styles.AlertDialogOverlay} />
        <AlertDialog.Content className={styles.AlertDialogContent}>
          <AlertDialog.Title className={styles.AlertDialogTitle}>Are you absolutely sure?</AlertDialog.Title>
          <AlertDialog.Description className={styles.AlertDialogDescription}>
            This action will clear your board. Are you sure?
          </AlertDialog.Description>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <AlertDialog.Cancel asChild>
              <button className={`${styles.Button} ${styles.mauve}`}>Cancel</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild onClick={handleClearCanvas}>
              <button className={`${styles.Button} ${styles.red}`}>Yes</button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
