import { useTools } from '@/hooks/useTools'
import { BackgroundFillStyle } from '@/types'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { IoSquare } from 'react-icons/io5'
import { TbSquare, TbSquaresFilled } from 'react-icons/tb'
import ItemLabel from '../ItemLabel'
import styles from './ButtonGroup.module.css'

const BgFillButtonGroup = () => {
  const { options, setOptions } = useTools((state) => ({
    options: state.options,
    setOptions: state.setOptions,
  }))

  const handleChange = (value: BackgroundFillStyle) => {
    setOptions({ backgroundFillStyle: value })
  }

  return (
    <>
      <ItemLabel>Background fill style</ItemLabel>

      <ToggleGroup.Root
        className={styles.ToggleGroup}
        type='single'
        defaultValue={options.backgroundFillStyle}
        onValueChange={handleChange}
        aria-label='Background fill style'>
        <ToggleGroup.Item className={styles.ToggleGroupItem} value='none' aria-label='none'>
          <TbSquare />
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.ToggleGroupItem} value='solid' aria-label='solid'>
          <IoSquare />
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.ToggleGroupItem} value='hachure' aria-label='hachure'>
          <TbSquaresFilled />
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </>
  )
}

export default BgFillButtonGroup
