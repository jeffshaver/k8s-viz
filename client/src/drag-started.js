import { event as d3event } from 'd3'
import hideTooltip from './hide-tooltip'
import simulation from './simulation'
import { setMouseIsDown, setRenderTimeout } from './constants'

const dragStarted = d => {
  hideTooltip()
  setMouseIsDown(true)
  setRenderTimeout(null)
  if (!d3event.active) simulation.alphaTarget(0.3).restart()
  d.fx = d.x
  d.fy = d.y
}

export default dragStarted
