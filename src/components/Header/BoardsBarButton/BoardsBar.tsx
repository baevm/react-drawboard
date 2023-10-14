import { createImage } from '@/helpers/canvas'
import { useBoardState } from '@/hooks/useBoardState'
import { useDrawings, useDrawingsActions } from '@/hooks/useDrawings'
import { useToggle } from '@/hooks/useToggle'
import { Drawings } from '@/types'
import ActionIcon from '@/ui/ActionIcon/ActionIcon'
import { clsx } from '@/utils/clsx'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IoAdd, IoClose, IoCreateOutline, IoFolderOutline, IoTrashOutline } from 'react-icons/io5'
import styles from './BoardsBar.module.css'

const BoardsBar = () => {
  const { createBoard, updateBoardName } = useDrawingsActions()
  const { currentBoard, setCurrentBoard } = useBoardState()
  const { boards } = useDrawings(currentBoard)
  const [isOpen, toggle] = useToggle()

  const boardNames = Object.keys(boards)

  const createNewBoard = () => {
    createBoard('hello world' + Date.now())
  }

  const changeBoard = (name: string) => {
    setCurrentBoard(name)
  }

  const handleUpdateName = (oldName: string, newName: string) => {
    if (oldName !== newName) {
      updateBoardName(oldName, newName)
      setCurrentBoard(newName)
    }
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
                {boardNames.map((board) => (
                  <BoardMiniature
                    key={board}
                    name={board}
                    isActive={board === currentBoard}
                    drawings={boards[board]}
                    onClick={() => changeBoard(board)}
                    onNameUpdate={handleUpdateName}
                  />
                ))}
              </div>
              <button onClick={createNewBoard} className={styles.bar_create_board_button}>
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

const BoardMiniature = ({
  drawings,
  name,
  isActive,
  onClick,
  onNameUpdate,
}: {
  drawings: Drawings
  name: string
  isActive: boolean
  onClick: () => void
  onNameUpdate: (oldName: string, newName: string) => void
}) => {
  const [src, setSrc] = useState<string | undefined>('')
  const [isEditMode, toggle] = useToggle()
  const [newName, setNewName] = useState<string | null>('')
  const inputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadImage = async () => {
      createImage(drawings).then((res) => setSrc(res))
    }

    loadImage()
  }, [])

  const handleEdit = () => {
    if (isEditMode) {
      if (!newName) {
        return
      }

      onNameUpdate(name, newName)
    }

    // https://stackoverflow.com/questions/2388164/set-focus-on-div-contenteditable-element/37162116#37162116
    if (!isEditMode) {
      setTimeout(() => inputRef.current && inputRef.current.focus(), 0)
    }

    toggle()
  }

  return (
    <div className={styles.miniboard_wrapper}>
      <div className={styles.miniboard} onClick={onClick}>
        <img src={src || './placeholder-image.jpg'} className={styles.miniboard_img} />
      </div>
      <div className={styles.miniboard_footer}>
        <div className={clsx(styles.miniboard_name, isActive && styles.miniboard_active)}>
          <div
            onBlur={(e) => setNewName(e.currentTarget.textContent)}
            className={clsx(isEditMode && styles.name_editable)}
            ref={inputRef}
            contentEditable={isEditMode}
            suppressContentEditableWarning={true}>
            {name}
          </div>
          <ActionIcon onClick={handleEdit}>
            <IoCreateOutline size='16px' />
          </ActionIcon>
        </div>
        <ActionIcon>
          <IoTrashOutline size='16px' />
        </ActionIcon>
      </div>
    </div>
  )
}
