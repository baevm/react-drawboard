import React from 'react'
import ItemLabel from '../ItemLabel'
import styles from './ButtonGroup.module.css'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { useTools } from '@/hooks/useTools'
import { IoBrushOutline } from 'react-icons/io5'
import { BiFont } from 'react-icons/bi'
import { FontFamily } from '@/types'

const FontFamilyButtonGroup = () => {
  const { options, setOptions } = useTools((state) => ({
    options: state.options,
    setOptions: state.setOptions,
  }))

  const handleChange = (value: FontFamily) => {
    setOptions({ fontFamily: value })
  }

  return (
    <>
      <ItemLabel>Font family</ItemLabel>

      <ToggleGroup.Root
        className={styles.ToggleGroup}
        type='single'
        defaultValue={options.fontFamily}
        onValueChange={handleChange}
        aria-label='Font family'>
        <ToggleGroup.Item className={styles.ToggleGroupItem} value='SourceSansPro' aria-label='Default' title='Default'>
          <BiFont />
        </ToggleGroup.Item>
        <ToggleGroup.Item
          className={styles.ToggleGroupItem}
          value='Caveat'
          aria-label='Hand written'
          title='Hand written'>
          <IoBrushOutline />
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </>
  )
}

export default FontFamilyButtonGroup
