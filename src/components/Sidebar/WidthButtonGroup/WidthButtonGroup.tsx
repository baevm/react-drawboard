import React from 'react'
import ItemLabel from '../ItemLabel'
import styles from './WidthButtonGroup.module.css'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { IoRemove, IoReorderThree, IoReorderTwo } from 'react-icons/io5'

const WidthButtonGroup = () => {
  return (
    <>
      <ItemLabel>Line width</ItemLabel>

      <ToggleGroup.Root className={styles.ToggleGroup} type='single' defaultValue='center' aria-label='Line width'>
        <ToggleGroup.Item className={styles.ToggleGroupItem} value='light' aria-label='Light line'>
          <IoRemove />
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.ToggleGroupItem} value='regular' aria-label='Regular line'>
          <IoReorderTwo />
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.ToggleGroupItem} value='thick' aria-label='Thick line'>
          <IoReorderThree />
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </>
  )
}

export default WidthButtonGroup
