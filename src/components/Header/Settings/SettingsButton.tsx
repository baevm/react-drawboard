import { LOCALSTORAGE_KEY } from '@/constants'
import { createElement } from '@/helpers/element'
import { openJsonFile, saveAsJson } from '@/helpers/files'
import { getImageFromDb, saveImageToDb } from '@/helpers/image'
import { useDrawingsActions } from '@/hooks/useDrawings'
import { useTheme } from '@/hooks/useTheme'
import { Drawings } from '@/types'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoEllipsisHorizontal, IoMoonOutline, IoSunnyOutline } from 'react-icons/io5'
import LanguageSelect from './LanguageSelect/LanguageSelect'
import styles from './SettingsButton.module.css'

export const SettingsButton = () => {
  const [error, setError] = useState(false)
  const { setDrawings } = useDrawingsActions()
  const { theme, changeTheme } = useTheme()
  const { t } = useTranslation()

  const createDrawings = (savedDrawings: Drawings) => {
    const createdDrawings = []

    for (const drawing of savedDrawings) {
      // we dont need to create new element for text and pen
      // because it already contains text and points needed for drawing on the board
      switch (drawing.tool) {
        case 'text':
        case 'pen': {
          createdDrawings.push(drawing)
          break
        }

        case 'image': {
          saveImageToDb({ id: drawing.id, dataURL: drawing.dataURL! })

          const newElement = createElement({
            x1: drawing.x1!,
            y1: drawing.y1!,
            x2: drawing.x2!,
            y2: drawing.y2!,
            tool: drawing.tool,
            id: drawing.id,
            options: drawing.options!,
          })
          createdDrawings.push(newElement)
          break
        }

        default: {
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
          break
        }
      }
    }

    return createdDrawings
  }

  // remove sets from polygon elements
  // add dataURL to image elements
  const formatDrawings = async (drawings: Drawings) => {
    let formattedDrawings = []

    for (const drawing of drawings) {
      const { sets, ...rest } = drawing

      if (drawing.tool === 'image') {
        const dataURL = await getImageFromDb(rest.id)
        if (dataURL) {
          rest.dataURL = dataURL
        }
      }

      formattedDrawings.push(rest)
    }

    return formattedDrawings
  }

  const handleOpenFile = async () => {
    const file = (await openJsonFile()) as string

    if (!file) return

    const parsedFile = JSON.parse(file)
    const savedDrawings = parsedFile.drawings as Drawings | null

    if (!savedDrawings) {
      setError(true)
      return
    }

    const createdDrawings = createDrawings(savedDrawings) as any
    setDrawings(createdDrawings)
  }

  const handleSaveToFile = async () => {
    const drawings = localStorage.getItem(LOCALSTORAGE_KEY)

    if (!drawings) return

    const parsedDrawings = JSON.parse(drawings) as Drawings
    const formattedDrawings = formatDrawings(parsedDrawings)

    const stringifiedDrawings = JSON.stringify({ drawings: formattedDrawings })
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
          <DropdownMenu.Arrow className={styles.DropdownMenuArrow} />

          <DropdownMenu.Item className={styles.DropdownMenuItem} onClick={handleOpenFile}>
            {t('settings.open')} <div className={styles.RightSlot}>⌘+O</div>
          </DropdownMenu.Item>

          <DropdownMenu.Item className={styles.DropdownMenuItem} onClick={handleSaveToFile}>
            {t('settings.saveTo')} <div className={styles.RightSlot}>⌘+S</div>
          </DropdownMenu.Item>

          <DropdownMenu.Item className={styles.DropdownMenuItem}>
            {t('settings.saveImage')} <div className={styles.RightSlot}>⌘+J</div>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className={styles.DropdownMenuSeparator} />

          <DropdownMenu.Item className={styles.DropdownMenuItem} disabled>
            {t('settings.collaboration')}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className={styles.DropdownMenuSeparator} />

          <DropdownMenu.Label className={styles.DropdownMenuLabel}>{t('settings.theme')}</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={theme} onValueChange={changeTheme}>
            <DropdownMenu.RadioItem className={styles.DropdownMenuRadioItem} value='dark'>
              <DropdownMenu.ItemIndicator className={styles.DropdownMenuItemIndicator}>
                <IoMoonOutline size={14} className={styles.item_icon} />
              </DropdownMenu.ItemIndicator>
              {t('settings.dark')}
            </DropdownMenu.RadioItem>

            <DropdownMenu.RadioItem className={styles.DropdownMenuRadioItem} value='light'>
              <DropdownMenu.ItemIndicator className={styles.DropdownMenuItemIndicator}>
                <IoSunnyOutline size={14} className={styles.item_icon} />
              </DropdownMenu.ItemIndicator>
              {t('settings.light')}
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>

          <DropdownMenu.Separator className={styles.DropdownMenuSeparator} />

          <DropdownMenu.Label className={styles.DropdownMenuLabel}>{t('settings.language')}</DropdownMenu.Label>
          <div style={{ maxWidth: '180px' }}>
            <LanguageSelect />
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
