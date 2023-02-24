import { useDrawnings } from '@/hooks/useDrawings'
import { useZoom } from '@/hooks/useZoom'
import { IoArrowRedoOutline, IoArrowUndoOutline } from 'react-icons/io5'
import { RxZoomIn, RxZoomOut } from 'react-icons/rx'
import styles from './Footer.module.css'

const Footer = () => {
  const { undoDraw, redoDraw } = useDrawnings()
  const { canvasScale, handleZoom, resetZoom } = useZoom()

  const handleZoomIn = () => {
    handleZoom(-100, 'click')
  }
  const handleZoomOut = () => {
    handleZoom(100, 'click')
  }

  return (
    <div className={styles.footer_container}>
      <div className={styles.ToggleGroup} role='group'>
        <button onClick={undoDraw} className={styles.ToggleGroupItem}>
          <IoArrowUndoOutline />
        </button>
        <button onClick={redoDraw} className={styles.ToggleGroupItem}>
          <IoArrowRedoOutline />
        </button>
      </div>
      <div className={styles.ToggleGroup}>
        <button onClick={handleZoomOut} className={styles.ToggleGroupItem}>
          <RxZoomOut />
        </button>
        <button className={styles.ToggleGroupItem} onClick={resetZoom}>
          {Math.floor(100 * canvasScale)}%
        </button>
        <button onClick={handleZoomIn} className={styles.ToggleGroupItem}>
          <RxZoomIn />
        </button>
      </div>
    </div>
  )
}

export default Footer
