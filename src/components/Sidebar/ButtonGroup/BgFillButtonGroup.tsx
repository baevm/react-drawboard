import { useBoardState } from '@/hooks/useBoardState'
import { FillStyle } from '@/types'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { useTranslation } from 'react-i18next'
import { IoSquare } from 'react-icons/io5'
import { TbSquare, TbSquaresFilled } from 'react-icons/tb'
import ItemLabel from '../ItemLabel'
import styles from './ButtonGroup.module.css'

const BgFillButtonGroup = () => {
  const { options, setOptions } = useBoardState((state) => ({
    options: state.options,
    setOptions: state.setOptions,
  }))
  const { t } = useTranslation()

  const handleChange = (value: FillStyle) => {
    setOptions({ fillStyle: value })
  }

  return (
    <>
      <ItemLabel>{t('sidebar.bgFillStyle')}</ItemLabel>

      <ToggleGroup.Root
        className={styles.ToggleGroup}
        type='single'
        defaultValue={options.fillStyle}
        onValueChange={handleChange}
        aria-label={t('sidebar.bgFillStyle') as string}>
        <ToggleGroup.Item
          className={styles.ToggleGroupItem}
          value='none'
          aria-label='none'
          title={t('sidebar.noFill') as string}>
          <TbSquare />
        </ToggleGroup.Item>
        <ToggleGroup.Item
          className={styles.ToggleGroupItem}
          value='solid'
          aria-label='solid'
          title={t('sidebar.fill') as string}>
          <IoSquare />
        </ToggleGroup.Item>
        <ToggleGroup.Item
          className={styles.ToggleGroupItem}
          value='hachure'
          aria-label='hachure'
          title={t('sidebar.hachure') as string}>
          <TbSquaresFilled />
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </>
  )
}

export default BgFillButtonGroup
