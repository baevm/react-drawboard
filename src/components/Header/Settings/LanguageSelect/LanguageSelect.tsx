import React from 'react'
import * as Select from '@radix-ui/react-select'
import { IoCheckmark, IoChevronDown, IoChevronUp } from 'react-icons/io5'
import styles from './LanguageSelect.module.css'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/constants'

const LanguageSelect = () => {
  const {
    t,
    i18n: { changeLanguage, language },
  } = useTranslation()

  return (
    <Select.Root>
      <Select.Trigger className={styles.SelectTrigger} aria-label='Language'>
        <Select.Value placeholder='Select language' />
        <Select.Icon className={styles.SelectIcon}>
          <IoChevronDown size='14px' />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className={styles.SelectContent}>
          <Select.ScrollUpButton className={styles.SelectScrollButton}>
            <IoChevronUp />
          </Select.ScrollUpButton>

          <Select.Viewport className={styles.SelectViewport}>
            <Select.Group>
              {LANGUAGES.map((language) => (
                <SelectItem value={language.value} key={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </Select.Group>
          </Select.Viewport>

          <Select.ScrollDownButton className={styles.SelectScrollButton}>
            <IoChevronDown />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

const SelectItem = React.forwardRef(({ children, className, ...props }: any, forwardedRef) => {
  return (
    <Select.Item className={classNames(styles.SelectItem, className)} {...props} ref={forwardedRef}>
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className={styles.SelectItemIndicator}>
        <IoCheckmark />
      </Select.ItemIndicator>
    </Select.Item>
  )
})

export default LanguageSelect
