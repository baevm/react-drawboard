import { TOOLS } from '@/constants/tools'
import { useTools } from '@/hooks/useTools'
import { Tool } from '@/types'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { ClearCanvasButton } from './ClearCanvasButton'
import styles from './Header.module.css'
import { SettingsButton } from './SettingsButton'



// TODO: tool label tooltip
const Header = () => {
  const { tool, setTool } = useTools((state) => ({
    setTool: state.setTool,
    tool: state.tool,
  }))

  const handleChangeTool = (value: Tool) => {
    setTool(value)


  }

  return (
    <div className={styles.header_container}>
      <div className={styles.header_settings}>
        <div className={`${styles.toggle_group_item} ${styles.toggle_group_aside}`}>
          <SettingsButton />
        </div>
        <RadioGroup.Root
          className={styles.toggle_group}
          value={tool}
          defaultValue='line'
          onValueChange={handleChangeTool}
          aria-label='Text alignment'>
          {TOOLS.map(({ value, label, icon }) => (
            <RadioGroup.Item
              key={value}
              className={`${styles.toggle_group_item} tool_${[value]}`}
              value={value}
              title={label}
              aria-label={label}>
              {icon}
              {value === 'image' && <input id='fileLoad' hidden type='file' /* onChange={handleFileUpload} */ />}
            </RadioGroup.Item>
          ))}
        </RadioGroup.Root>
        <div className={`${styles.toggle_group_item} ${styles.toggle_group_aside}`}>
          <ClearCanvasButton />
        </div>
      </div>
    </div>
  )
}

export default Header
