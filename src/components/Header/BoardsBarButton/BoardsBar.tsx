import { IoFolderOutline, IoClose, IoAdd } from 'react-icons/io5'
import styles from './BoardsBar.module.css'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import ActionIcon from '@/ui/ActionIcon/ActionIcon'
import { getCanvas } from '@/utils/getCanvas'

const BoardsBar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div>
      <button onClick={toggle} className={`${styles.toggle_group_item} ${styles.toggle_group_aside}`}>
        <IoFolderOutline />
      </button>

      {isOpen &&
        createPortal(
          <section className={styles.bar_wrapper}>
            <div className={styles.bar}>
              <div className={styles.bar_header}>
                <h3>Your boards</h3>
                <ActionIcon onClick={toggle}>
                  <IoClose />
                </ActionIcon>
              </div>

              <div className={styles.bar_content}>
                <BoardMiniature src={getCanvas().canvas.toDataURL()} name={'Hello world board'} />
                <BoardMiniature src={getCanvas().canvas.toDataURL()} name={'Hello world board'} />
                <BoardMiniature src={getCanvas().canvas.toDataURL()} name={'Hello world board'} />
              </div>
              <button className={styles.bar_create_board_button}>
                <IoAdd />
              </button>
            </div>
          </section>,
          document.body
        )}
    </div>
  )
}

export default BoardsBar

const BoardMiniature = ({ src, name }: { src: string; name: string }) => {
  return (
    <div className={styles.miniboard_wrapper}>
      <div className={styles.miniboard}>
        <img src={src} className={styles.miniboard_img} />
      </div>
      <div className={styles.miniboard_name}>{name}</div>
    </div>
  )
}
