import {select} from 'd3'

const svg = select('svg')
const height = +svg.attr('height')
const width = +svg.attr('width')
let link = svg.append('g').attr('class', 'links').selectAll('line')
const links = []
let mouseIsDown = false
let node = svg.append('g').attr('class', 'nodes').selectAll('circle')
const nodes = []
let prevNodesLength = nodes.length
let renderTimeout

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
  height,
  link,
  links,
  mouseIsDown,
  node,
  nodes,
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