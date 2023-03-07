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
  IoTriangleOutline,
} from 'react-icons/io5'
import { RiEraserLine, RiText } from 'react-icons/ri'

export const TOOLS: { value: Tool; label: string; icon: React.ReactNode; key: string }[] = [
  { value: 'select', label: 'Select', icon: <FiMousePointer />, key: 'S' },
  { value: 'pan', label: 'Move', icon: <IoHandRightOutline />, key: 'H' },
  { value: 'pen', label: 'Pen', icon: <IoBrushOutline />, key: '1' },
  { value: 'line', label: 'Line', icon: <IoRemove />, key: '2' },
  { value: 'circle', label: 'Circle', icon: <IoEllipseOutline />, key: '3' },
  { value: 'rectangle', label: 'Rectangle', icon: <IoTabletLandscapeOutline />, key: '4' },
  { value: 'triangle', label: 'Triangle', icon: <IoTriangleOutline />, key: '5' },
  { value: 'rhombus', label: 'Rhombus', icon: <BsDiamond />, key: '6' },
  { value: 'arrow', label: 'Arrow', icon: <IoArrowForward />, key: '7' },
  { value: 'text', label: 'Text', icon: <RiText />, key: 'T' },
  { value: 'image', label: 'Image', icon: <IoImageOutline />, key: '8' },
  { value: 'eraser', label: 'Eraser', icon: <RiEraserLine />, key: '9' },
]
