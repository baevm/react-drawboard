import React from 'react'
import styles from './Footer.module.css'
import { IoArrowUndoOutline, IoArrowRedoOutline } from 'react-icons/io5'
import { useDrawnings } from '@/hooks/useDrawings'

const Footer = () => {
  const { undoDrawing, redoDrawing } = useDrawnings()

  const handleUndo = () => {
    undoDrawing()
  }
  const handleRedo = () => {
    redoDrawing()
  }

  const handleZoomIn = () => {}
  const handleZoomOut = () => {}
  return (
    <div className={styles.footer_container}>
      <div className={styles.ToggleGroup} role='group'>
        <button onClick={handleUndo} className={styles.ToggleGroupItem}>
          <IoArrowUndoOutline />
        </button>
        <button onClick={handleRedo} className={styles.ToggleGroupItem}>
          <IoArrowRedoOutline />
        </button>
      </div>
      <div className={styles.ToggleGroup}>
        <button onClick={handleZoomOut} className={styles.ToggleGroupItem}>
          <IoArrowUndoOutline />
        </button>
        <button className={styles.ToggleGroupItem}>100%</button>
        <button onClick={handleZoomIn} className={styles.ToggleGroupItem}>
          <IoArrowRedoOutline />
        </button>
      </div>
    </div>
  )
}

export default Footer
