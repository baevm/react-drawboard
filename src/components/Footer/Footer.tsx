import { useDrawingsActions } from '@/hooks/useDrawings'
import { useZoom } from '@/hooks/useZoom'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { IoArrowRedoOutline, IoArrowUndoOutline } from 'react-icons/io5'
import { RxZoomIn, RxZoomOut } from 'react-icons/rx'
import styles from './Footer.module.css'

const ZOOMIN_VALUE = -100
const ZOOMOUT_VALUE = 100

const Footer = () => {
  const { t } = useTranslation()
  const { undoDraw, redoDraw } = useDrawingsActions()
  const { canvasScale, handleZoom, resetZoom } = useZoom()
  useHotkeys('ctrl+z', undoDraw)
  useHotkeys('ctrl+y', redoDraw)

  const handleZoomIn = () => {
    handleZoom(ZOOMIN_VALUE, 'click')
  }
  const handleZoomOut = () => {
    handleZoom(ZOOMOUT_VALUE, 'click')
  }

  return (
    <div className={styles.footer_container}>
      <div className={styles.ToggleGroup} role='group'>
        <button onClick={undoDraw} className={styles.ToggleGroupItem} title={t('footer.undo') as string}>
          <IoArrowUndoOutline />
        </button>
        <button onClick={redoDraw} className={styles.ToggleGroupItem} title={t('footer.redo') as string}>
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
