import { useState } from 'react'
import { IoEllipsisHorizontal, IoMoonOutline, IoSunnyOutline } from 'react-icons/io5'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import styles from './SettingsButton.module.css'

export const SettingsButton = () => {
  const [theme, setTheme] = useState('dark')
  const [open, setOpen] = useState(false)

  const handleClearCanvas = () => {}

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button title='Settings' aria-label='Settings'>
          <IoEllipsisHorizontal />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.DropdownMenuContent} sideOffset={5}>
          <DropdownMenu.Item className={styles.DropdownMenuItem}>
            Open <div className={styles.RightSlot}>⌘+O</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item className={styles.DropdownMenuItem}>
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
          <DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenu.RadioItem className={styles.DropdownMenuRadioItem} value='pedro'>
              <DropdownMenu.ItemIndicator className={styles.DropdownMenuItemIndicator}>
                <IoMoonOutline size={14} className={styles.item_icon} />
              </DropdownMenu.ItemIndicator>
              Light
            </DropdownMenu.RadioItem>

            <DropdownMenu.RadioItem className={styles.DropdownMenuRadioItem} value='colm'>
              <DropdownMenu.ItemIndicator className={styles.DropdownMenuItemIndicator}>
                <IoSunnyOutline size={14} className={styles.item_icon} />
              </DropdownMenu.ItemIndicator>
              Dark
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Arrow className={styles.DropdownMenuArrow} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
