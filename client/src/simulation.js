import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY
} from 'd3'
import {
  link,
  linkNode,
  node,
  persistentVolumeNode,
  serviceNode
} from './constants'
import { cx, cy } from './svg'

const simulation = forceSimulation()
  .force('link', forceLink().id(d => d.id))
  .force('charge', forceManyBody().strength(-30))
  .force('collision', forceCollide().radius(d => d.radius))
  .force('x', forceX())
  .force('y', forceY())
  .on('tick', onTick)
// .on('end', onEnd)

function onTick() {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y)
  node.attr('cx', d => d.x).attr('cy', d => d.y)
  serviceNode.attr('transform', d => {
    return 'translate(' + d.x + ',' + d.y + ')'
  })
  persistentVolumeNode.attr('transform', d => {
    return 'translate(' + d.x + ',' + d.y + ')'
  })
  linkNode
    .attr('cx', d => (d.x = (d.source.x + d.target.x) * 0.5))
    .attr('cy', d => (d.y = (d.source.y + d.target.y) * 0.5))
}

// function onEnd () {
//   console.log('simulation ended')
// }

export default simulation
