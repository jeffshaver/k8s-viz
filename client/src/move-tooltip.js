import { event as d3event } from 'd3'
import { svg, tooltip } from './constants'

const showTooltip = d => {
  if (
    !tooltip.attr('style') ||
    tooltip.attr('style').includes('display: none;')
  ) {
    tooltip.style('display', 'block')
  }

  const tooltipHeight = Number(tooltip.style('height').slice(0, -2))
  const tooltipWidth = Number(tooltip.style('width').slice(0, -2))
  const bottom = d3event.layerY + 10 + tooltipHeight
  const right = d3event.layerX + 10 + tooltipWidth

  tooltip
    .style(
      'top',
      bottom > window.innerHeight - 10
        ? window.innerHeight - tooltipHeight - 10
        : d3event.layerY + 10 + 'px'
    )
    .style(
      'left',
      right > window.innerWidth - 10
        ? window.innerWidth - tooltipWidth - 10
        : d3event.layerX + 10 + 'px'
    )
}

export default showTooltip
