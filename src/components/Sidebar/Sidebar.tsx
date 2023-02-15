import { useTools } from '@/hooks/useTools'
import { HEX } from '@/types'
import { IoMenu } from 'react-icons/io5'
import ColorPicker from './ColorPicker/ColorPicker'
import { OpacitySlider } from './OpacitySlider'
import styles from './Sidebar.module.css'
import WidthButtonGroup from './WidthButtonGroup/WidthButtonGroup'

const Sidebar = () => {
  const { tool, options, setOptions } = useTools((state) => ({
    tool: state.tool,
    options: state.options,
    setOptions: state.setOptions,
  }))

  const isBgPickerVisible = tool === 'circle' || tool === 'rectangle' || tool === 'triangle' || tool === 'rhombus'

  const handleLineColorChange = (color: HEX) => {
    setOptions({ ...options, lineColor: color })
  }

  const handleBgColorChange = (color: HEX) => {
    setOptions({ ...options, backgroundFillColor: color })
  }

  return (
    <>
      <input
        type='checkbox'
        id='settings-menu'
        className={styles.settings_menu_checkbox}
        onChange={(e) => console.log(e.target.checked)}
      />
      <label htmlFor='settings-menu' className={styles.settings_menu_label}>
        <IoMenu />
      </label>
      
      <div className={styles.sidebar_container}>
        <div className={styles.sidebar_wrapper}>
          <div className={styles.settings_item}>
            <ColorPicker label='Line color' initialColor={options.lineColor} onChange={handleLineColorChange} />
          </div>

          {isBgPickerVisible && (
            <div className={styles.settings_item}>
              <ColorPicker
                label='Background color'
                initialColor={options.backgroundFillColor}
                onChange={handleBgColorChange}
              />
            </div>
          )}

          <div className={styles.settings_item}>
            <WidthButtonGroup />
          </div>

          <div className={styles.settings_item}>
            <OpacitySlider />
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
