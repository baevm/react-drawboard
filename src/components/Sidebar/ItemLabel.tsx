import React from 'react'
import styles from './Sidebar.module.css'

const ItemLabel = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.settings_item_label}>{children}</div>
}

export default ItemLabel
