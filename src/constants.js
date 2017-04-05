import {select} from 'd3'

const svg = select('svg')
const svgHeight = svg.style('height')
const svgWidth = svg.style('width')
const height = +svgHeight.substring(0, svgHeight.length - 2)
const width = +svgWidth.substring(0, svgWidth.length - 2)
let link = svg.append('g').attr('class', 'links').selectAll('line')
const links = []
let mouseIsDown = false
let node = svg.append('g').attr('class', 'nodes').selectAll('circle')
const nodes = []
let prevNodesLength = nodes.length
let renderTimeout
const namespaces = []
const deployments = []
const pods = []

const setLink = (newLink) => {
  link = newLink
}
const setMouseIsDown = (newMouseIsDown) => {
  mouseIsDown = newMouseIsDown
}
const setNode = (newNode) => {
  node = newNode
}
const setPrevNodesLength = (newNodesLength) => {
  prevNodesLength = newNodesLength
}
const setRenderTimeout = (newRenderTimeout) => {
  if (newRenderTimeout === null) {
    clearTimeout(renderTimeout)

    return
  }

  renderTimeout = newRenderTimeout
}

const tooltip = select('#chart').append('div').attr('class', 'tooltip')

tooltip.append('div').attr('class', 'name')

export {
  deployments,
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