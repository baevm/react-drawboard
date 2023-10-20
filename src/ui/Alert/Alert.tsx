import React from 'react'
import styles from './Alert.module.css'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { useTranslation } from 'react-i18next'

type Props = {
  children: React.ReactNode
  title: string
  description: string
  isOpen: boolean
  onOpenChange: () => void
  onConfirm: () => void
}

const Alert = ({ children, description, isOpen, onConfirm, onOpenChange, title }: Props) => {
  const { t } = useTranslation()

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={styles.AlertDialogOverlay} />
        <AlertDialog.Content className={styles.AlertDialogContent}>
          <AlertDialog.Title className={styles.AlertDialogTitle}>{title}</AlertDialog.Title>
          <AlertDialog.Description className={styles.AlertDialogDescription}>{description}</AlertDialog.Description>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <AlertDialog.Cancel asChild>
              <button className={`${styles.Button} ${styles.mauve}`}>{t('ui.cancel')}</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild onClick={onConfirm}>
              <button className={`${styles.Button} ${styles.red}`}>{t('ui.yes')}</button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export default Alert
