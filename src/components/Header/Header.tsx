import { useDrawnings } from '@/hooks/useDrawings'
import { Tool, useTools } from '@/hooks/useTools'
import * as RadioGroup from '@radix-ui/react-radio-group'
import React from 'react'
import { BsDiamond } from 'react-icons/bs'
import { FiMousePointer } from 'react-icons/fi'
import {
  IoArrowForward,
  IoBrushOutline,
  IoEllipseOutline,
  IoEllipsisHorizontal,
  IoHandRightOutline,
  IoImageOutline,
  IoRemove,
  IoTabletLandscapeOutline,
  IoText,
  IoTriangleOutline,
} from 'react-icons/io5'
import { RiEraserLine } from 'react-icons/ri'
import { ClearCanvasButton } from './ClearCanvasButton'
import styles from './Header.module.css'

const TOOLS: { value: Tool; label: string; icon: React.ReactNode }[] = [
  { value: 'select', label: 'Select', icon: <FiMousePointer /> },
  { value: 'move', label: 'Move', icon: <IoHandRightOutline /> },
  { value: 'pen', label: 'Pen', icon: <IoBrushOutline /> },
  { value: 'line', label: 'Line', icon: <IoRemove /> },
  { value: 'circle', label: 'Circle', icon: <IoEllipseOutline /> },
  { value: 'rectangle', label: 'Rectangle', icon: <IoTabletLandscapeOutline /> },
  { value: 'triangle', label: 'Triangle', icon: <IoTriangleOutline /> },
  { value: 'rhombus', label: 'Rhombus', icon: <BsDiamond /> },
  { value: 'arrow', label: 'Arrow', icon: <IoArrowForward /> },
  { value: 'text', label: 'Text', icon: <IoText /> },
  { value: 'image', label: 'Image', icon: <IoImageOutline /> },
  { value: 'eraser', label: 'Eraser', icon: <RiEraserLine /> },
]

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
          <button>
            <IoEllipsisHorizontal />
          </button>
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
              className={`${styles.toggle_group_item} tool-${[value]}`}
              id={'govno'}
              value={value}
              aria-label={label}>
              {icon}
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
