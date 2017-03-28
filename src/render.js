import colorStatus from './color-status'
import dragEnded from './drag-ended'
import dragged from './dragged'
import dragStarted from './drag-started'
import hideTooltip from './hide-tooltip'
import moveTooltip from './move-tooltip'
import showTooltip from './show-tooltip'
import simulation from './simulation'
import {
  drag,
  scaleOrdinal,
  schemeCategory20
} from 'd3'
import {
  link,
  links,
  node,
  nodes,
  prevNodesLength,
  setLink,
  setNode,
  setRenderTimeout
} from './constants'

const color = scaleOrdinal(schemeCategory20)

const render = () => {
  setLink(link.data(links, (d) => d.source + '-' + d.target))
  link.exit().remove()
  setLink(link.enter().append('line').attr('stroke-width', (d) => Math.sqrt(d.value)).merge(link))

  setNode(node.data(nodes, (d) => d.id))
  node.exit().remove()
  setNode(
    node.enter()
      .append('circle')
      .attr('r', 5)
      .attr('fill', (d) => color(d.group))
      .on('mouseout', hideTooltip)
      .on('mousemove', moveTooltip)
      .call(
        drag()
          .filter((d) => d.id !== 'master')
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      )
      .merge(node)
  )
  node.attr('stroke', (d) => colorStatus(d.status))
    .on('mouseover', showTooltip)

  simulation.nodes(nodes)
  simulation.force('link').links(links)
  if (nodes.length !== prevNodesLength) {
    simulation.alphaTarget(0.3)
  }
  simulation.restart()

  setRenderTimeout(setTimeout(() => {
    simulation.alphaTarget(0)
  }, 2000))

  return Promise.resolve()
}

export default render