import React from 'react'
import ItemLabel from '../ItemLabel'
import styles from './ButtonGroup.module.css'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { useTools } from '@/hooks/useTools'
import { FontSize } from '@/types'
import { useTranslation } from 'react-i18next'

const FontSizeButtonGroup = () => {
  const { options, setOptions } = useTools((state) => ({
    options: state.options,
    setOptions: state.setOptions,
  }))
  const { t } = useTranslation()

  const handleChange = (value: FontSize) => {
    setOptions({ fontSize: value })
  }

  return (
    <>
      <ItemLabel>{t('sidebar.fontSize')}</ItemLabel>

      <ToggleGroup.Root
        className={styles.ToggleGroup}
        type='single'
        defaultValue={options.fontSize}
        onValueChange={handleChange}
        aria-label='Font size'>
        <ToggleGroup.Item
          className={styles.ToggleGroupItem}
          value='14'
          aria-label='small'
          title={t('sidebar.small') as string}>
          S
        </ToggleGroup.Item>
        <ToggleGroup.Item
          className={styles.ToggleGroupItem}
          value='24'
          aria-label='medium'
          title={t('sidebar.medium') as string}>
          M
        </ToggleGroup.Item>
        <ToggleGroup.Item
          className={styles.ToggleGroupItem}
          value='32'
          aria-label='large'
          title={t('sidebar.large') as string}>
          L
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </>
  )
}

export default FontSizeButtonGroup
