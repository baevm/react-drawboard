import { DrawingOptions, Tool } from '@/types'

export const getToolOptions = (tool: Tool, options: DrawingOptions) => {
  switch (tool) {
    case 'line':
    case 'arrow':
      return {
        stroke: options.stroke,
        strokeWidth: +options.strokeWidth,
      }

    case 'text':
      return {
        stroke: options.stroke,
        fontSize: options.fontSize,
        fontFamily: options.fontFamily,
      }

    case 'pen':
      return {
        stroke: options.stroke,
        strokeWidth: +options.strokeWidth,
      }

    default:
      return {
        stroke: options.stroke,
        strokeWidth: +options.strokeWidth,
        fill: options.fillStyle !== 'none' ? options.fill : undefined,
        fillStyle: options.fillStyle !== 'none' ? options.fillStyle : undefined,
      }
  }
}

export const isDrawableTool = (tool: Tool) => {
  return (
    tool === 'pen' ||
    tool === 'arrow' ||
    tool === 'circle' ||
    tool === 'line' ||
    tool === 'triangle' ||
    tool === 'rectangle' ||
    tool === 'rhombus' ||
    tool === 'text'
  )
}

export const isPolygonTool = (tool: Tool | undefined) =>
  tool === 'circle' ||
  tool === 'triangle' ||
  tool === 'rectangle' ||
  tool === 'rhombus' ||
  tool === 'text' ||
  tool === 'image'

export const isLinearTool = (tool: Tool | undefined) => tool === 'arrow' || tool === 'line'

export const isAdjustableTool = (tool: Tool | undefined) => isPolygonTool(tool) || isLinearTool(tool)
