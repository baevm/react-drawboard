import { useTools } from '@/hooks/useTools'
import { FontFamily } from '@/types'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { useTranslation } from 'react-i18next'
import { BiFont } from 'react-icons/bi'
import { IoBrushOutline } from 'react-icons/io5'
import ItemLabel from '../ItemLabel'
import styles from './ButtonGroup.module.css'

const FontFamilyButtonGroup = () => {
  const { options, setOptions } = useTools((state) => ({
    options: state.options,
    setOptions: state.setOptions,
  }))
  const { t } = useTranslation()

  const handleChange = (value: FontFamily) => {
    setOptions({ fontFamily: value })
  }

  return (
    <>
      <ItemLabel>{t('sidebar.fontFamily')}</ItemLabel>

      <ToggleGroup.Root
        className={styles.ToggleGroup}
        type='single'
        defaultValue={options.fontFamily}
        onValueChange={handleChange}
        aria-label={t('sidebar.fontFamily') as string}>
        <ToggleGroup.Item
          className={styles.ToggleGroupItem}
          value='SourceSansPro'
          aria-label='Default'
          title={t('sidebar.default') as string}>
          <BiFont />
        </ToggleGroup.Item>
        <ToggleGroup.Item
          className={styles.ToggleGroupItem}
          value='Caveat'
          aria-label='Hand written'
          title={t('sidebar.handWritten') as string}>
          <IoBrushOutline />
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </>
  )
}

export default FontFamilyButtonGroup
