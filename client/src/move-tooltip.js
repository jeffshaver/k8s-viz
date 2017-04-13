import {event as d3event} from 'd3'
import {tooltip} from './constants'

const showTooltip = (d) => {
  if (!tooltip.attr('style') || tooltip.attr('style').includes('display: none;')) {
    tooltip.style('display', 'block')
  }

  tooltip.style('top', (d3event.layerY + 10) + 'px')
    .style('left', (d3event.layerX + 10) + 'px')
}

export default showTooltip