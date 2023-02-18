import { PointPosition } from '@/types'

export const eraserIcon =
  "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAARRJREFUOE/dlDFLxEAQhd+BVouFZ3vlQuwSyI+5a7PBRkk6k9KzTOwStJFsWv0xgaQzkNLWszim0kL2OOFc9oKRYHFTz37Lm/dmJhi5JiPzcBjAOYDz7WheADz3jalP8oIxds85P3Zd90RBqqpad133SUSXAJ5M4H3AhWVZd1EUzYQQP96VZYkkSV7btr02QY1Axtgqz/NTz/OM6qSUCMNwRURneoMJOLdt+7Gu643MfeU4zrppmgt9pibgjRBiWRRFb0R934eUcgngdrfxX4CjSwZj7C3Lsqnu8Lc05XQQBO9ENP2NKapnE5s4jme608rhNE2HxWb7qwr2A+f8SAv2BxFdDQ32rpLRVu9Pl+0wztcg6V/VPW4Vw1FsawAAAABJRU5ErkJggg==') 10 10, auto"

export const cursorForPosition = (position: PointPosition) => {
  switch (position) {
    case 'top-left':
    case 'bottom-right':
    case 'start':
    case 'end':
      return 'nwse-resize'
    case 'top-right':
    case 'bottom-left':
      return 'nesw-resize'
    default:
      return 'move'
  }
}
