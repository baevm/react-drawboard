export const getCanvas = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const context = canvas.getContext('2d')!

  return { canvas, context }
}
