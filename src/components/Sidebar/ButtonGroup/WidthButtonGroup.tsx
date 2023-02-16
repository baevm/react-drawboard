import { useTools } from '@/hooks/useTools'
import { LineWidth } from '@/types'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { IoRemove, IoReorderThree, IoReorderTwo } from 'react-icons/io5'
import ItemLabel from '../ItemLabel'
import styles from './ButtonGroup.module.css'

const WidthButtonGroup = () => {
  const { options, setOptions } = useTools((state) => ({
    options: state.options,
    setOptions: state.setOptions,
  }))

  const handleChange = (value: LineWidth) => {
    setOptions({ lineWidth: value })
  }

  return (
    <>
      <ItemLabel>Line width</ItemLabel>

      <ToggleGroup.Root
        className={styles.ToggleGroup}
        onValueChange={handleChange}
        type='single'
        defaultValue={options.lineWidth}
        aria-label='Line width'>
        <ToggleGroup.Item className={styles.ToggleGroupItem} value='1' aria-label='Light line'>
          <IoRemove />
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.ToggleGroupItem} value='3' aria-label='Regular line'>
          <IoReorderTwo />
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.ToggleGroupItem} value='5' aria-label='Thick line'>
          <IoReorderThree />
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </>
  )
}

export default WidthButtonGroup
