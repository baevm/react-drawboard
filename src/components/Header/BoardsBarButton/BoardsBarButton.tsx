import { useToggle } from '@/hooks/useToggle'
import { createPortal } from 'react-dom'
import { IoFolderOutline } from 'react-icons/io5'
import BoardsBar from '../BoardsBar/BoardsBar'
import styles from './BoardsBarButton.module.css'

const BoardsBarButton = () => {
  const [isOpen, toggle] = useToggle()
  
  return (
    <div>
      <button onClick={toggle} className={`${styles.toggle_group_item} ${styles.toggle_group_aside}`}>
        <IoFolderOutline />
      </button>

      {isOpen && createPortal(<BoardsBar onClose={toggle} />, document.body)}
    </div>
  )
}

export default BoardsBarButton
