import { useBoardState } from '@/hooks/useBoardState'
import { HEX } from '@/types'
import { IoMenu } from 'react-icons/io5'
import { ColorPicker } from './ColorPicker'
import styles from './Sidebar.module.css'
import WidthButtonGroup from './ButtonGroup/WidthButtonGroup'
import BgFillButtonGroup from './ButtonGroup/BgFillButtonGroup'
import FontSizeButtonGroup from './ButtonGroup/FontSizeButtonGroup'
import FontFamilyButtonGroup from './ButtonGroup/FontFamilyButtonGroup'
import { useTranslation } from 'react-i18next'

const Sidebar = () => {
  const { tool, options, setOptions } = useBoardState((state) => ({
    tool: state.tool,
    options: state.options,
    setOptions: state.setOptions,
  }))
  const { t } = useTranslation()

  const isPolygonSettings = tool === 'circle' || tool === 'rectangle' || tool === 'triangle' || tool === 'rhombus'
  const isStrokeWidth = isPolygonSettings || tool === 'pen' || tool === 'line' || tool === 'arrow'
  const isTextSettings = tool === 'text'
  const isSidebarVisible = tool !== 'pan' && tool !== 'select' && tool !== 'eraser' && tool !== 'image'

  const handleLineColorChange = (color: HEX) => {
    setOptions({ stroke: color })
  }

  const handleBgColorChange = (color: HEX) => {
    setOptions({ fill: color })
  }

  if (!isSidebarVisible) {
    return null
  }

  return (
    <>
      {/* Hidden burger button, only visible for mobile */}
      <input type='checkbox' id='settings-menu' className={styles.settings_menu_checkbox} />
      <label htmlFor='settings-menu' className={styles.settings_menu_label}>
        <IoMenu />
      </label>

      <div className={styles.sidebar_container}>
        <div className={styles.sidebar_wrapper}>
          <div className={styles.settings_item}>
            <ColorPicker label={t('sidebar.stroke')} initialColor={options.stroke} onChange={handleLineColorChange} />
          </div>

          {isStrokeWidth && (
            <div className={styles.settings_item}>
              <WidthButtonGroup />
            </div>
          )}

          {isTextSettings && (
            <>
              <div className={styles.settings_item}>
                <FontSizeButtonGroup />
              </div>
              <div className={styles.settings_item}>
                <FontFamilyButtonGroup />
              </div>
            </>
          )}

          {isPolygonSettings && (
            <>
              <div className={styles.settings_item}>
                <BgFillButtonGroup />
              </div>
              <div className={styles.settings_item}>
                <ColorPicker label={t('sidebar.bgColor')} initialColor={options.fill!} onChange={handleBgColorChange} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Sidebar
