import { select } from 'd3'
import getSvgDimensions from './get-svg-dimensions'
import { svg } from './svg'

// SVG things

const tooltip = select('#chart')
  .append('div')
  .attr('class', 'tooltip')
let link = svg
  .append('g')
  .attr('class', 'links')
  .selectAll('line')
let node = svg
  .append('g')
  .attr('class', 'nodes')
  .selectAll('circle')
let persistentVolumeNode = svg
  .select('.nodes')
  .selectAll('.persistent-volume-node')
let linkNode = svg.select('.nodes').selectAll('link-node')
let serviceNode = svg.select('.nodes').selectAll('.service-node')

// Arrays

const links = []
const linkNodes = []
const nodes = []
const persistentVolumeNodes = []
const serviceNodes = []
const services = []
const jobs = []
const namespaces = []
const daemonsets = []
const replicasets = []
const replicationcontrollers = []
const statefulsets = []
const pods = []
const persistentvolumes = []

// Other things

const groups = {}
const eventLogElement = document.querySelector('ul')
let nextGroupNumber = 0
let mouseIsDown = false
let prevNodesLength = nodes.length
let renderTimeout

// Setters

const setLink = newLink => {
  link = newLink
}
const setLinkNode = newLinkNode => {
  linkNode = newLinkNode
}
const setMouseIsDown = newMouseIsDown => {
  mouseIsDown = newMouseIsDown
}
const setNode = newNode => {
  node = newNode
}
const setPersistentVolumeNode = newPersistentVolumeNode => {
  persistentVolumeNode = newPersistentVolumeNode
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
const getGroupNumber = key => {
  if (groups[key] === undefined) {
    groups[key] = nextGroupNumber++
  }

  return groups[key]
}

tooltip.append('div').attr('class', 'name')

export {
  daemonsets,
  eventLogElement,
  getGroupNumber,
  jobs,
  link,
  linkNode,
  linkNodes,
  links,
  mouseIsDown,
  namespaces,
  node,
  nodes,
  persistentVolumeNode,
  persistentVolumeNodes,
  persistentvolumes,
  pods,
  prevNodesLength,
  renderTimeout,
  replicasets,
  replicationcontrollers,
  serviceNode,
  serviceNodes,
  services,
  setLink,
  setLinkNode,
  setMouseIsDown,
  setNode,
  setPersistentVolumeNode,
  setPrevNodesLength,
  setRenderTimeout,
  setServiceNode,
  statefulsets,
  svg,
  tooltip
}
