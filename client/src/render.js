import colorStatus from './color-status'
import dragEnded from './drag-ended'
import dragged from './dragged'
import dragStarted from './drag-started'
import hideTooltip from './hide-tooltip'
import moveTooltip from './move-tooltip'
import showTooltip from './show-tooltip'
import simulation from './simulation'
import { drag, scaleOrdinal, schemeCategory20, symbol, symbolDiamond } from 'd3'
import {
  link,
  links,
  node,
  nodes,
  prevNodesLength,
  serviceNode,
  serviceNodes,
  setLink,
  setNode,
  setRenderTimeout,
  setServiceNode
} from './constants'

const color = scaleOrdinal(schemeCategory20)

const render = () => {
  setLink(link.data(links, d => d.source + '-' + d.target))
  link.exit().remove()
  setLink(
    link.enter().append('line').attr('stroke-width', d => d.value).merge(link)
  )

  setNode(node.data(nodes, d => d.id))
  node.exit().remove()
  setNode(
    node
      .enter()
      .append('circle')
      .attr('r', 5)
      .attr('fill', d => color(d.group))
      .on('mouseout', hideTooltip)
      .on('mousemove', moveTooltip)
      .call(
        drag()
          .filter(d => d.id !== 'master')
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      )
      .merge(node)
  )
  node.attr('stroke', d => colorStatus(d.status)).on('mouseover', showTooltip)

  setServiceNode(serviceNode.data(serviceNodes, d => d.id))
  serviceNode.exit().remove()
  setServiceNode(
    serviceNode
      .enter()
      .append('path')
      .on('mouseout', hideTooltip)
      .on('mousemove', moveTooltip)
      .attr('d', symbol().size(100).type(symbolDiamond))
      .style('fill', d => color(d.group))
      .call(
        drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded)
      )
      .merge(serviceNode)
  )
  serviceNode.on('mouseover', showTooltip)

  const allNodes = nodes.concat(serviceNodes)

  simulation.nodes(allNodes)
  simulation.force('link').links(links)
  if (allNodes.length > prevNodesLength) {
    simulation.alphaTarget(0.1)

    setRenderTimeout(
      setTimeout(() => {
        simulation.alphaTarget(0)
      }, 4000)
    )
  }
  simulation.restart()

  return Promise.resolve()
}

export default render
