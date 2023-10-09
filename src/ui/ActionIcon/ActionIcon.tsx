import React, { HTMLAttributes } from 'react'
import styles from './ActionIcon.module.css'

interface ActionIconProps extends HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const ActionIcon = ({ children, ...props }: ActionIconProps) => {
  return (
    <button className={styles.actionicon} {...props}>
      {children}
    </button>
  )
}

export default ActionIcon
