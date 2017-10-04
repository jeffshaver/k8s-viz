import { event as d3event } from 'd3'
import { setMouseIsDown } from './constants'
import simulation from './simulation'

const dragEnded = d => {
  setMouseIsDown(false)
  simulation.alphaDecay(0.0228)
  d.fx = null
  d.fy = null
}

export default dragEnded
