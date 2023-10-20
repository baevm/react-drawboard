import React, { HTMLAttributes } from 'react'
import styles from './ActionIcon.module.css'

interface ActionIconProps extends HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const ActionIcon = React.forwardRef((props: ActionIconProps, ref: React.LegacyRef<HTMLButtonElement> | undefined) => {
  return (
    <button className={styles.actionicon} ref={ref} {...props}>
      {props.children}
    </button>
  )
})

export default ActionIcon
