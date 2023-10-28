import { useClickOutside } from '@/hooks/useClickOutside'
import { useDebouncedFn } from '@/hooks/useDebouncedFn'
import { HEX } from '@/types'
import { useRef, useState } from 'react'
import { HexAlphaColorPicker, HexColorInput } from 'react-colorful'
import ItemLabel from '../ItemLabel'
import styles from './ColorPicker.module.css'

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

  const debouncedOnChange = useDebouncedFn((value) => {
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
        <HexColorInput
          color={color}
          onChange={setColor}
          className={styles.color_input}
          alpha={true}
          style={{ color, fontWeight: 600 }}
        />
      </div>
      {isColorPickerOpen && (
        <div ref={colorPickerRef} className={styles.color_popover}>
          <HexAlphaColorPicker color={color} onChange={handleChangeColor} />
        </div>
      )}
    </>
  )
}
