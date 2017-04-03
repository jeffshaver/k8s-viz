import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY
} from 'd3'
import {
  height,
  link,
  node,
  nodes,
  width
} from './constants'

const simulation = forceSimulation()
  .force('link', forceLink().id((d) => d.id))
  .force('charge', forceManyBody().strength(-150))
  .force('x', forceX())
  .force('y', forceY())
  .force('center', forceCenter(width / 2, height / 2))
  .alphaTarget(0)
  .alphaDecay(0.05)
  .on('tick', onTick)
  // .on('end', onEnd)

function onTick () {
  link
    .attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y)
  node
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
}

// function onEnd () {
//   nodes.forEach((node) => {
//     node.fx = node.x
//     node.fy = node.y
//   })
// }

export default simulation