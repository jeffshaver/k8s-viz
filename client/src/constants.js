import { select } from 'd3'
import getSvgDimensions from './get-svg-dimensions'

// SVG things

const svg = select('svg')
const { height, width } = getSvgDimensions(svg)
const tooltip = select('#chart').append('div').attr('class', 'tooltip')
let link = svg.append('g').attr('class', 'links').selectAll('line')
let node = svg.append('g').attr('class', 'nodes').selectAll('circle')

// Arrays

const links = []
const nodes = []
const namespaces = []
const daemonsets = []
const deployments = []
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
  deployments,
  eventLogElement,
  height,
  link,
  links,
  mouseIsDown,
  namespaces,
  node,
  nodes,
  pods,
  prevNodesLength,
  renderTimeout,
  setLink,
  setMouseIsDown,
  setNode,
  setPrevNodesLength,
  setRenderTimeout,
  svg,
  tooltip,
  width
}
