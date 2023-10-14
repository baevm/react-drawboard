import { useDrawingsActions } from '@/hooks/useDrawings'
import { ZOOM_TYPE, useZoom } from '@/hooks/useZoom'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { IoArrowRedoOutline, IoArrowUndoOutline } from 'react-icons/io5'
import { RxZoomIn, RxZoomOut } from 'react-icons/rx'
import styles from './Footer.module.css'
import { useBoardState } from '@/hooks/useBoardState'

const ZOOMIN_VALUE = -100
const ZOOMOUT_VALUE = 100

const Footer = () => {
  const { t } = useTranslation()
  const { undoDraw, redoDraw } = useDrawingsActions()
  const { canvasScale, handleZoom, resetZoom } = useZoom()
  const { currentBoard } = useBoardState()

  const undo = () => undoDraw(currentBoard)
  const redo = () => redoDraw(currentBoard)

  useHotkeys('ctrl+z', undo)
  useHotkeys('ctrl+y', redo)

  const handleZoomIn = () => {
    handleZoom(ZOOMIN_VALUE, ZOOM_TYPE.click)
  }
  const handleZoomOut = () => {
    handleZoom(ZOOMOUT_VALUE, ZOOM_TYPE.click)
  }

  return (
    <div className={styles.footer_container}>
      <div className={styles.ToggleGroup} role='group'>
        <button
          onClick={undo}
          className={styles.ToggleGroupItem}
          title={t('footer.undo') as string}>
          <IoArrowUndoOutline />
        </button>
        <button
          onClick={redo}
          className={styles.ToggleGroupItem}
          title={t('footer.redo') as string}>
          <IoArrowRedoOutline />
        </button>
      </div>
      <div className={styles.ToggleGroup}>
        <button onClick={handleZoomOut} className={styles.ToggleGroupItem} title={t('footer.zoomOut') as string}>
          <RxZoomOut />
        </button>
        <button className={styles.ToggleGroupItem} onClick={resetZoom} title={t('footer.resetZoom') as string}>
          {Math.floor(100 * canvasScale)}%
        </button>
        <button onClick={handleZoomIn} className={styles.ToggleGroupItem} title={t('footer.zoomIn') as string}>
          <RxZoomIn />
        </button>
      </div>
    </div>
  )
}

export default Footer
