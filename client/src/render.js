import colorByStatus from './color-by-status'
import createAlphaTargetTimeout from './create-alpha-target-timeout'
import dragEnded from './drag-ended'
import dragged from './dragged'
import dragStarted from './drag-started'
import hideTooltip from './hide-tooltip'
import moveTooltip from './move-tooltip'
import showTooltip from './show-tooltip'
import simulation from './simulation'
import {
  drag,
  forceCenter,
  scaleOrdinal,
  schemeCategory20,
  symbol,
  symbolDiamond,
  symbolSquare
} from 'd3'
import {
  link,
  linkNode,
  linkNodes,
  links,
  node,
  nodes,
  persistentVolumeNode,
  persistentVolumeNodes,
  persistentvolumes,
  prevNodesLength,
  serviceNode,
  serviceNodes,
  setLink,
  setLinkNode,
  setNode,
  setPersistentVolumeNode,
  setServiceNode
} from './constants'
import { cx, cy } from './svg'

const changeAlphaTarget = createAlphaTargetTimeout()
const color = scaleOrdinal(schemeCategory20)

const render = () => {
  setLink(link.data(links, d => d.source + '-' + d.target))
  link.exit().remove()
  setLink(
    link
      .enter()
      .append('line')
      .attr('stroke', d => color(d.group))
      .attr('stroke-width', d => d.value)
      .merge(link)
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
          .filter(d => {
            return !d.fx && !d.fy
          })
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      )
      .merge(node)
  )
  node.attr('stroke', d => colorByStatus(d.status)).on('mouseover', showTooltip)

  setServiceNode(serviceNode.data(serviceNodes, d => d.id))
  serviceNode.exit().remove()
  setServiceNode(
    serviceNode
      .enter()
      .append('path')
      .on('mouseout', hideTooltip)
      .on('mousemove', moveTooltip)
      .attr(
        'd',
        symbol()
          .size(100)
          .type(symbolDiamond)
      )
      .style('fill', d => color(d.group))
      .call(
        drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      )
      .merge(serviceNode)
  )
  serviceNode.attr('stroke', colorByStatus()).on('mouseover', showTooltip)

  setPersistentVolumeNode(
    persistentVolumeNode.data(persistentVolumeNodes, d => d.id)
  )
  persistentVolumeNode.exit().remove()
  setPersistentVolumeNode(
    persistentVolumeNode
      .enter()
      .append('path')
      .on('mouseout', hideTooltip)
      .on('mousemove', moveTooltip)
      .attr(
        'd',
        symbol()
          .size(100)
          .type(symbolSquare)
      )
      .style('fill', d => color(d.group))
      .call(
        drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      )
      .merge(persistentVolumeNode)
  )
  persistentVolumeNode
    .attr('stroke', colorByStatus())
    .on('mouseover', showTooltip)

  setLinkNode(
    linkNode.data(linkNodes, d => d.source.id + '-' + d.target.id + '-node')
  )
  linkNode.exit().remove()
  setLinkNode(
    linkNode
      .enter()
      .append('circle')
      .attr('class', 'link-node')
      .attr('r', 1)
      .merge(linkNode)
  )

  const allNodes = nodes
    .concat(serviceNodes)
    .concat(persistentVolumeNodes)
    .concat(linkNodes)

  simulation.nodes(allNodes)
  simulation.force('center', forceCenter(cx, cy))
  simulation.force('link').links(links)
  if (allNodes.length > prevNodesLength) {
    changeAlphaTarget()
  } else {
    simulation.restart()
  }

  return Promise.resolve()
}

export default render
