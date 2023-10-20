import { useBoardState } from '@/hooks/useBoardState'
import { useDrawingsActions } from '@/hooks/useDrawings'
import { useToggle } from '@/hooks/useToggle'
import Alert from '@/ui/Alert/Alert'
import { useTranslation } from 'react-i18next'
import { IoTrashOutline } from 'react-icons/io5'

export const ClearCanvasButton = () => {
  const { clearDrawings } = useDrawingsActions()
  const { currentBoard } = useBoardState()
  const [isOpen, setOpen] = useToggle(false)
  const { t } = useTranslation()

  const handleClearCanvas = () => {
    clearDrawings(currentBoard)
  }

  return (
    <Alert
      isOpen={isOpen}
      description={t('header.resetBoard')}
      title={t('ui.confirmTitle')}
      onOpenChange={setOpen}
      onConfirm={handleClearCanvas}>
      <button title={t('header.reset') as string}>
        <IoTrashOutline />
      </button>
    </Alert>
  )
}
