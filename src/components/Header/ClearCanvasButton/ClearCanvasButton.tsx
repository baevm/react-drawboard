import { useDrawingsActions } from '@/hooks/useDrawings'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoTrashOutline } from 'react-icons/io5'
import styles from './ClearCanvasButton.module.css'

export const ClearCanvasButton = () => {
  const { clearDrawings } = useDrawingsActions()
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const handleClearCanvas = () => {
    clearDrawings()
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button title={t('header.reset') as string}>
          <IoTrashOutline />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={styles.AlertDialogOverlay} />
        <AlertDialog.Content className={styles.AlertDialogContent}>
          <AlertDialog.Title className={styles.AlertDialogTitle}>{t('ui.confirmTitle')}</AlertDialog.Title>
          <AlertDialog.Description className={styles.AlertDialogDescription}>
            {t('header.resetBoard')}
          </AlertDialog.Description>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <AlertDialog.Cancel asChild>
              <button className={`${styles.Button} ${styles.mauve}`}>{t('ui.cancel')}</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild onClick={handleClearCanvas}>
              <button className={`${styles.Button} ${styles.red}`}>{t('ui.yes')}</button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
