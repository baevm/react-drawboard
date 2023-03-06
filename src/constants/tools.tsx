import { Tool } from '@/types'
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

export const TOOLS: { value: Tool; label: string; icon: React.ReactNode }[] = [
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
