import { event as d3event } from 'd3'
import simulation from './simulation'

const dragged = d => {
  d.fx = d3event.x
  d.fy = d3event.y
}

export default dragged
