import { useClickOutside } from '@/hooks/useClickOutside'
import { useRef, useState } from 'react'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import ItemLabel from '../ItemLabel'
import styles from './ColorPicker.module.css'
import { useDebouncyFn } from 'use-debouncy'
import { HEX } from '@/types'

type Props = {
  label: string
  initialColor: string
  onChange: (color: HEX) => void
}

export const ColorPicker = ({ label, onChange, initialColor }: Props) => {
  const colorPickerRef = useRef<HTMLDivElement | null>(null)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [color, setColor] = useState(initialColor)

  useClickOutside(colorPickerRef, () => setIsColorPickerOpen(false))

  const debouncedOnChange = useDebouncyFn((value) => {
    onChange(value)
  }, 250)

  const handleChangeColor = (color: string) => {
    setColor(color)
    debouncedOnChange(color)
  }

  return (
    <>
      <ItemLabel>{label}</ItemLabel>
      <div className={styles.color_settings}>
        <div
          style={{ backgroundColor: color }}
          onClick={() => setIsColorPickerOpen(true)}
          className={styles.item_swatch}
        />
        <HexColorInput color={color} onChange={setColor} className={styles.color_input} style={{ color }} />
      </div>
      {isColorPickerOpen && (
        <div ref={colorPickerRef} className={styles.color_popover}>
          <HexColorPicker color={color} onChange={handleChangeColor} />
        </div>
      )}
    </>
  )
}
