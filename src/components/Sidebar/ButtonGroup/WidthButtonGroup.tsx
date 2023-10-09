import { useBoardState } from '@/hooks/useBoardState'
import { StrokeWidth } from '@/types'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { useTranslation } from 'react-i18next'
import { IoRemove, IoReorderThree, IoReorderTwo } from 'react-icons/io5'
import ItemLabel from '../ItemLabel'
import styles from './ButtonGroup.module.css'

const WidthButtonGroup = () => {
  const { options, setOptions } = useBoardState((state) => ({
    options: state.options,
    setOptions: state.setOptions,
  }))
  const { t } = useTranslation()

  const handleChange = (value: StrokeWidth) => {
    setOptions({ strokeWidth: value })
  }

  return (
    <>
      <ItemLabel>{t('sidebar.lineWidth')}</ItemLabel>

      <ToggleGroup.Root
        className={styles.ToggleGroup}
        onValueChange={handleChange}
        type='single'
        defaultValue={options.strokeWidth}
        aria-label='Line width'>
        <ToggleGroup.Item
          className={styles.ToggleGroupItem}
          value='1'
          aria-label='Light'
          title={t('sidebar.thin') as string}>
          <IoRemove />
        </ToggleGroup.Item>
        <ToggleGroup.Item
          className={styles.ToggleGroupItem}
          value='3'
          aria-label='Regular'
          title={t('sidebar.regular') as string}>
          <IoReorderTwo />
        </ToggleGroup.Item>
        <ToggleGroup.Item
          className={styles.ToggleGroupItem}
          value='5'
          aria-label='Thick'
          title={t('sidebar.bold') as string}>
          <IoReorderThree />
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </>
  )
}

export default WidthButtonGroup
