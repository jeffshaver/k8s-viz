import { select } from 'd3'
import getSvgDimensions from './get-svg-dimensions'
import { svg } from './svg'

// SVG things

const tooltip = select('#chart').append('div').attr('class', 'tooltip')
let link = svg.append('g').attr('class', 'links').selectAll('line')
let node = svg.append('g').attr('class', 'nodes').selectAll('circle')
let serviceNode = svg.select('.nodes').selectAll('path')

// Arrays

const links = []
const nodes = []
const serviceNodes = []
const services = []
const jobs = []
const namespaces = []
const daemonsets = []
const replicasets = []
const replicationcontrollers = []
const statefulsets = []
const pods = []

// Other things

const eventLogElement = document.querySelector('ul')
let mouseIsDown = false
let prevNodesLength = nodes.length
let renderTimeout

// Setters

const setLink = newLink => {
  link = newLink
}
const setMouseIsDown = newMouseIsDown => {
  mouseIsDown = newMouseIsDown
}
const setNode = newNode => {
  node = newNode
}
const setServiceNode = newServiceNode => {
  serviceNode = newServiceNode
}
const setPrevNodesLength = newNodesLength => {
  prevNodesLength = newNodesLength
}
const setRenderTimeout = newRenderTimeout => {
  if (newRenderTimeout === null) {
    clearTimeout(renderTimeout)

    return
  }

  renderTimeout = newRenderTimeout
}

tooltip.append('div').attr('class', 'name')

export {
  daemonsets,
  eventLogElement,
  jobs,
  link,
  links,
  mouseIsDown,
  namespaces,
  node,
  nodes,
  pods,
  prevNodesLength,
  renderTimeout,
  replicasets,
  replicationcontrollers,
  serviceNode,
  serviceNodes,
  services,
  setLink,
  setMouseIsDown,
  setNode,
  setPrevNodesLength,
  setRenderTimeout,
  setServiceNode,
  statefulsets,
  svg,
  tooltip
}
