import { DEFAULT_BOARD_KEY } from '@/constants'
import { useBoardState } from '@/hooks/useBoardState'
import { useDrawings, useDrawingsActions } from '@/hooks/useDrawings'
import ActionIcon from '@/ui/ActionIcon/ActionIcon'
import { IoAdd, IoClose } from 'react-icons/io5'
import styles from './BoardsBar.module.css'
import { createImage } from '@/helpers/canvas'
import { useToggle } from '@/hooks/useToggle'
import { Drawings } from '@/types'
import { clsx } from '@/utils/clsx'
import React, { useEffect, useRef, useState } from 'react'
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5'
import Alert from '@/ui/Alert/Alert'

type Props = {
  onClose: () => void
}

const BoardsBar = ({ onClose }: Props) => {
  const { createBoard, updateBoardName, deleteBoard } = useDrawingsActions()
  const { currentBoard, setCurrentBoard } = useBoardState()
  const { boards } = useDrawings(currentBoard)

  const boardNames = Object.keys(boards)

  const createNewBoard = () => {
    createBoard('' + Date.now())
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

  const handleDelete = (key: string) => {
    deleteBoard(key)

    // If there more than 1 board
    // switch to this board
    // else create new board
    if (boardNames.length > 1) {
      setCurrentBoard(key !== boardNames[0] ? boardNames[0] : boardNames[1])
    } else {
      createBoard(DEFAULT_BOARD_KEY)
      setCurrentBoard(DEFAULT_BOARD_KEY)
    }
  }

  return (
    <section className={styles.bar_wrapper}>
      <div className={styles.bar}>
        <div className={styles.bar_header}>
          <h3>Your boards</h3>
          <ActionIcon onClick={onClose}>
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
              onDelete={handleDelete}
            />
          ))}
        </div>
        <button onClick={createNewBoard} className={styles.bar_create_board_button}>
          <IoAdd />
        </button>
      </div>
    </section>
  )
}

export default BoardsBar

const BoardMiniature = ({
  drawings,
  name,
  isActive,
  onClick,
  onNameUpdate,
  onDelete,
}: {
  drawings: Drawings
  name: string
  isActive: boolean
  onClick: () => void
  onNameUpdate: (oldName: string, newName: string) => void
  onDelete: (key: string) => void
}) => {
  const [src, setSrc] = useState<string | undefined>('')
  const [isEditMode, toggle] = useToggle()
  const [isAlertOpen, setIsAlertOpen] = useToggle()
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
      } else {
        onNameUpdate(name, newName)
        setNewName("")
      }
    }

    // https://stackoverflow.com/questions/2388164/set-focus-on-div-contenteditable-element/37162116#37162116
    if (!isEditMode) {
      setTimeout(() => inputRef.current && inputRef.current.focus(), 0)
    }

    toggle()
  }

  const handleEnterPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleEdit()
    }
  }

  return (
    <div className={styles.miniboard_wrapper}>
      <div className={styles.miniboard} onClick={onClick}>
        <img src={src || './placeholder-image.jpg'} className={styles.miniboard_img} />
      </div>
      <div className={styles.miniboard_footer}>
        <div className={clsx(styles.miniboard_name, isActive && styles.miniboard_active)}>
          <div
            ref={inputRef}
            onInput={(e) => setNewName(e.currentTarget.textContent)}
            onKeyDown={handleEnterPress}
            className={clsx(isEditMode && styles.name_editable)}
            contentEditable={isEditMode}
            suppressContentEditableWarning={true}>
            {name}
          </div>
          <ActionIcon onClick={handleEdit}>
            <IoCreateOutline size='16px' />
          </ActionIcon>
        </div>
        <Alert
          isOpen={isAlertOpen}
          onOpenChange={setIsAlertOpen}
          onConfirm={() => onDelete(name)}
          title={'Are you absolutely sure?'}
          description={'This action will delete your board. Are you sure?'}>
          <ActionIcon>
            <IoTrashOutline size='16px' />
          </ActionIcon>
        </Alert>
      </div>
    </div>
  )
}
