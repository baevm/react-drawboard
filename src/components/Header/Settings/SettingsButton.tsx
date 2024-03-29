import { BOARDS_LS_KEY } from '@/constants'
import { createElement } from '@/helpers/element'
import { openJsonFile, saveAsJson } from '@/helpers/files'
import { getImageFromDb, saveImageToDb } from '@/helpers/image'
import { useDrawingsActions } from '@/hooks/useDrawings'
import { useTheme } from '@/hooks/useTheme'
import { Drawings, TwoPoints } from '@/types'
import { getCanvas } from '@/helpers/canvas'
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

          const twoPoints: TwoPoints = {
            x1: drawing.x1!,
            y1: drawing.y1!,
            x2: drawing.x2!,
            y2: drawing.y2!,
          }

          const newElement = createElement({
            tp: twoPoints,
            tool: drawing.tool,
            id: drawing.id,
            options: drawing.options!,
          })
          createdDrawings.push(newElement)
          break
        }

        default: {
          const twoPoints: TwoPoints = {
            x1: drawing.x1!,
            y1: drawing.y1!,
            x2: drawing.x2!,
            y2: drawing.y2!,
          }

          const newElement = createElement({
            tp: twoPoints,
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

    const drawings = createDrawings(savedDrawings) as Drawings
    setDrawings('default', drawings)
  }

  const handleSaveToFile = async () => {
    const drawings = localStorage.getItem(BOARDS_LS_KEY)

    if (!drawings) return

    const parsedDrawings = JSON.parse(drawings) as Drawings
    const formattedDrawings = formatDrawings(parsedDrawings)

    const stringifiedDrawings = JSON.stringify({ drawings: formattedDrawings })
    saveAsJson(stringifiedDrawings)
  }

  const handleCreateScreenshot = async () => {
    const { canvas } = getCanvas()
    let link = document.createElement('a')
    const str = new Date().toISOString().slice(0, 16).replace('T', ' ')

    link.download = `drawboard-${str}.png`

    // create a dummy canvas
    // to set background color later
    let destinationCanvas = document.createElement('canvas')
    destinationCanvas.width = canvas.width
    destinationCanvas.height = canvas.height

    let destCtx = destinationCanvas.getContext('2d') as CanvasRenderingContext2D

    //create a rectangle with the desired color
    destCtx.fillStyle = '#FFFFFF'
    destCtx.fillRect(0, 0, canvas.width, canvas.height)

    //draw the original canvas onto the destination canvas
    destCtx.drawImage(canvas, 0, 0)

    // save image from dummy canvas
    link.href = destinationCanvas.toDataURL('image/png')
    link.click()
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

          <DropdownMenu.Item className={styles.DropdownMenuItem} onClick={handleCreateScreenshot}>
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
