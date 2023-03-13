import { LOCALSTORAGE_KEY } from '@/constants'
import { createElement } from '@/helpers/element'
import { openJsonFile, saveAsJson } from '@/helpers/files'
import { useDrawingsActions } from '@/hooks/useDrawings'
import { useTheme } from '@/hooks/useTheme'
import { Drawings } from '@/types'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { IoEllipsisHorizontal, IoMoonOutline, IoSunnyOutline } from 'react-icons/io5'
import styles from './SettingsButton.module.css'

export const SettingsButton = () => {
  const { setDrawings } = useDrawingsActions()
  const { theme, changeTheme } = useTheme()

  async function handleOpenFile() {
    const file = await openJsonFile()
    const savedDrawings = JSON.parse(file as any).drawings as Drawings
    const createdDrawings = []

    for (const drawing of savedDrawings) {
      // we dont need to create new element for text and pen
      // because it already contains text and points needed for drawing on the board
      if (drawing.tool === 'text' || drawing.tool === 'pen') {
        createdDrawings.push(drawing)
      }
      const newElement = createElement({
        x1: drawing.x1!,
        y1: drawing.y1!,
        x2: drawing.x2!,
        y2: drawing.y2!,
        tool: drawing.tool,
        id: drawing.id,
        options: drawing.options as any,
      })
      createdDrawings.push(newElement)
    }

    setDrawings(createdDrawings)
  }

  const handleSaveToFile = async () => {
    const drawings = localStorage.getItem(LOCALSTORAGE_KEY)

    if (!drawings) return

    const parsedDrawings = JSON.parse(drawings) as Drawings

    // remove sets array from object
    // as it takes too much memory
    const noSetsDrawings = parsedDrawings.map((item) => {
      const { sets, ...rest } = item
      return rest
    })

    const jsonDrawings = { drawings: noSetsDrawings }

    const stringifiedDrawings = JSON.stringify(jsonDrawings)
    saveAsJson(stringifiedDrawings)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button title='Settings' aria-label='Settings'>
          <IoEllipsisHorizontal />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.DropdownMenuContent} sideOffset={5}>
          <DropdownMenu.Item className={styles.DropdownMenuItem} onClick={handleOpenFile}>
            Open <div className={styles.RightSlot}>⌘+O</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item className={styles.DropdownMenuItem} onClick={handleSaveToFile}>
            Save to <div className={styles.RightSlot}>⌘+S</div>
          </DropdownMenu.Item>

          <DropdownMenu.Item className={styles.DropdownMenuItem}>
            Save image <div className={styles.RightSlot}>⌘+J</div>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className={styles.DropdownMenuSeparator} />

          <DropdownMenu.Item className={styles.DropdownMenuItem} disabled>
            Collaboration
          </DropdownMenu.Item>

          <DropdownMenu.Separator className={styles.DropdownMenuSeparator} />

          <DropdownMenu.Label className={styles.DropdownMenuLabel}>Theme</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={theme} onValueChange={changeTheme}>
            <DropdownMenu.RadioItem className={styles.DropdownMenuRadioItem} value='dark'>
              <DropdownMenu.ItemIndicator className={styles.DropdownMenuItemIndicator}>
                <IoMoonOutline size={14} className={styles.item_icon} />
              </DropdownMenu.ItemIndicator>
              Dark
            </DropdownMenu.RadioItem>

            <DropdownMenu.RadioItem className={styles.DropdownMenuRadioItem} value='light'>
              <DropdownMenu.ItemIndicator className={styles.DropdownMenuItemIndicator}>
                <IoSunnyOutline size={14} className={styles.item_icon} />
              </DropdownMenu.ItemIndicator>
              Light
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Arrow className={styles.DropdownMenuArrow} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
