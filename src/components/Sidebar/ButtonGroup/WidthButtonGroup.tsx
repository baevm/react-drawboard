import { useTools } from '@/hooks/useTools'
import { StrokeWidth } from '@/types'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { IoRemove, IoReorderThree, IoReorderTwo } from 'react-icons/io5'
import ItemLabel from '../ItemLabel'
import styles from './ButtonGroup.module.css'

const WidthButtonGroup = () => {
  const { options, setOptions } = useTools((state) => ({
    options: state.options,
    setOptions: state.setOptions,
  }))

  const handleChange = (value: StrokeWidth) => {
    setOptions({ strokeWidth: value })
  }

  return (
    <>
      <ItemLabel>Line width</ItemLabel>

      <ToggleGroup.Root
        className={styles.ToggleGroup}
        onValueChange={handleChange}
        type='single'
        defaultValue={options.strokeWidth}
        aria-label='Line width'>
        <ToggleGroup.Item className={styles.ToggleGroupItem} value='1' aria-label='Light' title='Light'>
          <IoRemove />
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.ToggleGroupItem} value='3' aria-label='Regular' title='Regular'>
          <IoReorderTwo />
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.ToggleGroupItem} value='5' aria-label='Thick' title='Thick'>
          <IoReorderThree />
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </>
  )
}

export default WidthButtonGroup
