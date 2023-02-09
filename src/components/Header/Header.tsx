import React from 'react'
import styles from './Header.module.css'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { IoBrushOutline, IoEllipseOutline, IoTabletLandscapeOutline } from 'react-icons/io5'

const Header = () => {
 
  return (
    <div className={styles.header_container}>
      <div className={styles.header_settings}>
        <ToggleGroup.Root
          className={styles.ToggleGroup}
          type='single'
          defaultValue='center'
          aria-label='Text alignment'>
          <ToggleGroup.Item className={styles.ToggleGroupItem} value='left' aria-label='Left aligned'>
            <IoBrushOutline />
          </ToggleGroup.Item>
          <ToggleGroup.Item className={styles.ToggleGroupItem} value='center' aria-label='Center aligned'>
            <IoEllipseOutline />
          </ToggleGroup.Item>
          <ToggleGroup.Item className={styles.ToggleGroupItem} value='right' aria-label='Right aligned'>
            <IoTabletLandscapeOutline />
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>
    </div>
  )
}

export default Header
