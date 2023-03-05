import { useFile } from '@/hooks/useFile'
import { useTools } from '@/hooks/useTools'
import { Tool } from '@/types'
import { generateId } from '@/utils/generateId'
import { db } from '@/utils/indexdb'
import IndexedDbRepository from '@/utils/indexDbRepository'
import * as RadioGroup from '@radix-ui/react-radio-group'
import React, { useState } from 'react'
import { BsDiamond } from 'react-icons/bs'
import { FiMousePointer } from 'react-icons/fi'
import {
  IoArrowForward,
  IoBrushOutline,
  IoEllipseOutline,
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
import { SettingsButton } from './SettingsButton'

export function readFileAsUrl(file: any) {
  return new Promise(function (resolve, reject) {
    let fr = new FileReader()

    fr.readAsDataURL(file)

    fr.onload = function () {
      resolve(fr.result)
    }

    fr.onerror = function () {
      reject(fr)
    }
  })
}

// TODO: tool label tooltip
const Header = () => {
  const { setFile } = useFile((state) => ({
    setFile: state.setFile,
  }))
  const { tool, setTool } = useTools((state) => ({
    setTool: state.setTool,
    tool: state.tool,
  }))

  const handleChangeTool = (value: Tool) => {
    setTool(value)

    if (value === 'image') {
      document.getElementById('fileLoad')?.click()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent) => {
    /* const dbRepo = new IndexedDbRepository('id') */

    const id = generateId()
    const file = document.getElementById('fileLoad')!.files[0]
    const base64Image = await readFileAsUrl(file)

    /*  await dbRepo.save({ id, file }) */

    const dbId = await db.files.add({
      id,
      file,
    })

    setFile(base64Image)
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
              {value === 'image' && <input id='fileLoad' hidden type='file' onChange={handleFileUpload} />}
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

const TOOLS: { value: Tool; label: string; icon: React.ReactNode }[] = [
  { value: 'select', label: 'Select', icon: <FiMousePointer /> },
  { value: 'pan', label: 'Move', icon: <IoHandRightOutline /> },
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
