import { TOOLS } from '@/constants/tools'
import { useTools } from '@/hooks/useTools'
import { Tool } from '@/types'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { ClearCanvasButton } from './ClearCanvasButton'
import styles from './Header.module.css'
import { SettingsButton } from './Settings'
import { IoCloseSharp, IoFolderOutline } from 'react-icons/io5'
import BoardsBar from './BoardsBarButton/BoardsBar'

const Header = () => {
  const { tool, setTool } = useTools((state) => ({
    setTool: state.setTool,
    tool: state.tool,
  }))
  const { t } = useTranslation()

  const handleChangeTool = (value: Tool) => {
    setTool(value)
  }

  return (
    <div className={styles.header_container}>
      <div style={{ marginLeft: '0.5rem' }}></div>

      <section className={styles.header_settings}>
        <div className={`${styles.toggle_group_item} ${styles.toggle_group_aside}`}>
          <SettingsButton />
        </div>
        <RadioGroup.Root
          className={styles.toggle_group}
          value={tool}
          defaultValue='line'
          onValueChange={handleChangeTool}
          aria-label='Text alignment'>
          {TOOLS.map(({ value, label, icon, key }) => (
            <ToolButton
              key={value}
              value={value}
              label={t('header.' + value)}
              icon={icon}
              toolKey={key}
              handleChangeTool={() => handleChangeTool(value)}
            />
          ))}
        </RadioGroup.Root>
        <div className={`${styles.toggle_group_item} ${styles.toggle_group_aside}`}>
          <ClearCanvasButton />
        </div>
      </section>

      <BoardsBar />
    </div>
  )
}

export default Header

const ToolButton = ({
  value,
  label,
  icon,
  toolKey,
  handleChangeTool,
}: {
  value: string
  label: string
  toolKey: string
  icon: React.ReactNode
  handleChangeTool: () => void
}) => {
  useHotkeys(toolKey, handleChangeTool)
  return (
    <RadioGroup.Item
      key={value}
      className={`${styles.toggle_group_item} tool_${[value]}`}
      value={value}
      title={label}
      aria-label={label}>
      {icon} <span className={styles.toggle_group_item_key}>{toolKey}</span>
    </RadioGroup.Item>
  )
}
