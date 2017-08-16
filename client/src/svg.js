import createAlphaTargetTimeout from './create-alpha-target-timeout'
import getSvgDimensions from './get-svg-dimensions'
import { nodes } from './constants'
import simulation from './simulation'
import { forceCenter, select } from 'd3'

const changeAlphaTarget = createAlphaTargetTimeout()
const svg = select('svg')
let height = window.innerHeight
let width = window.innerWidth
let cx = width / 2
let cy = height / 2

svg.attr('width', width)
svg.attr('height', height)

const setSize = (newWidth, newHeight) => {
  width = newWidth
  newHeight = newHeight
  cx = width / 2
  cy = height / 2

  svg.attr('width', width)
  svg.attr('height', height)

  nodes[0].fx = cx
  nodes[0].fy = cy

  simulation.force('center', forceCenter(cx, cy))

  changeAlphaTarget()
}

export { cx, cy, height, setSize, svg, width }
