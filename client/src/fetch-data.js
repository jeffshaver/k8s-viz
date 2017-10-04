import ReconnectingWebSocket from 'reconnecting-websocket'
import differenceBy from 'lodash.differenceby'
import {
  drag,
  event as d3event,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  scaleOrdinal,
  select,
  symbol,
  symbolDiamond,
  symbolSquare
} from 'd3'
import { schemeSet2 } from 'd3-scale-chromatic'

const color = scaleOrdinal(schemeSet2)
const chart = select('#chart')
const tooltip = chart.append('div').attr('class', 'tooltip')
const svg = select('svg')
let link = svg
  .append('g')
  .attr('class', 'links')
  .selectAll('line')
let node = svg
  .append('g')
  .attr('class', 'nodes')
  .selectAll('circle')
const simulation = forceSimulation()
  .force('link', forceLink().id(d => d.uid))
  .force('charge', forceManyBody().strength(-100))
  .force('collision', forceCollide().radius(10))
  .force('x', forceX())
  .force('y', forceY())
  .on('tick', onTick)
const circleOrPath = kind => {
  switch (kind) {
    case 'PersistentVolume':
    case 'Service':
      return 'path'
    default:
      return 'circle'
  }
}
const getShapeByKubeItemKind = kind => {
  switch (kind) {
    case 'PersistentVolume':
      return symbolSquare
    case 'Service':
      return symbolDiamond
    default:
      return undefined
  }
}
let mouseIsDown = false

const websocketURI = `wss://${window.location.host}/cluster-data`
const websocket = new ReconnectingWebSocket(websocketURI)
let nodes = []
let links = []
const getLinkId = d => {
  if (typeof d.source === 'string') {
    return d.source + d.target
  }

  return d.source.uid + d.target.uid
}

websocket.addEventListener('message', event => {
  const eventData = JSON.parse(event.data)
  const boundingRect = chart.node().getBoundingClientRect()
  const cx = boundingRect.right / 2
  const cy = boundingRect.bottom / 2

  document.querySelector('ul').innerHTML =
    '<li>' + eventData.log.join('</li><li>') + '</li>'
  document.querySelector('ul').scrollTop = document.querySelector(
    'ul'
  ).scrollHeight

  const removedNodes = differenceBy(nodes, eventData.nodes, 'uid').map(
    node => node.uid
  )
  const addedNodes = differenceBy(eventData.nodes, nodes, 'uid')

  nodes = nodes.filter(node => !removedNodes.includes(node.uid))
  nodes = Array.prototype.concat.apply(nodes, addedNodes)

  const removedLinks = differenceBy(links, eventData.links, getLinkId).map(
    getLinkId
  )
  const addedLinks = differenceBy(eventData.links, links, getLinkId)

  links = links.filter(link => {
    const id = getLinkId(link)

    return !removedLinks.includes(id)
  })
  links = Array.prototype.concat.apply(links, addedLinks)

  if (nodes.length > 0) {
    const boundingRect = chart.node().getBoundingClientRect()
    nodes[0].fx = cx
    nodes[0].fy = cy
  }

  node = node.data(nodes, d => d.uid)

  node.exit().remove()

  node = node
    .enter()
    .append(d => {
      const { data: { kind } = {} } = d

      return document.createElementNS(
        'http://www.w3.org/2000/svg',
        circleOrPath(kind)
      )
    })
    .attr('r', 5)
    .attr('fill', d => color(d.group))
    .attr('stroke', d => {
      const { tooltip: { Status: status = '' } = {} } = d
      const reasonStart = status.indexOf(':')
      const hasReason = reasonStart !== -1

      return colorStatus(
        status.substring(0, hasReason ? reasonStart : undefined)
      )
    })
    .attr('d', d => {
      const { data: { kind } = {} } = d
      const symbolType = getShapeByKubeItemKind(kind)

      if (!symbolType) {
        return undefined
      }

      return symbol()
        .size(100)
        .type(symbolType)()
    })
    .on('mouseout', hideTooltip)
    .on('mousemove', moveTooltip)
    .on('mouseover', showTooltip)
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

  link = link.data(links, getLinkId)

  link.exit().remove()

  link = link
    .enter()
    .append('line')
    .attr('stroke', d => color(d.group))
    .merge(link)

  simulation
    .nodes(nodes)
    .force('center', forceCenter(cx, cy))
    .force('link')
    .links(links)

  if (addedNodes.length > 0) {
    simulation.alpha(0.4)
  }

  simulation.restart()
})

function onTick() {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y)
  node
    .attr('cx', d => {
      const { data: { kind } = {} } = d
      const isNotCircle = circleOrPath(kind) !== 'circle'

      if (isNotCircle) {
        return undefined
      }

      return d.x
    })
    .attr('cy', d => {
      const { data: { kind } = {} } = d
      const isNotCircle = circleOrPath(kind) !== 'circle'

      if (isNotCircle) {
        return undefined
      }

      return d.y
    })
    .attr('transform', d => {
      const { data: { kind } = {} } = d
      const isNotPath = circleOrPath(kind) !== 'path'

      if (isNotPath) {
        return undefined
      }

      return 'translate(' + d.x + ',' + d.y + ')'
    })
}

function colorStatus(status = '') {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'blue' // '#7ac2ff'
    case 'running':
      return 'green' //'#62ff62'
    case 'waiting':
      return 'yellow' //'#ffff71'
    case 'terminating':
    case 'terminated':
      return 'red' //'#ff6b6b'
    default:
      return '#222222'
  }
}

function showTooltip(d) {
  if (mouseIsDown) return
  tooltip.html(
    d.tooltip
      ? `<h2>${d.name}</h2>` +
        Object.keys(d.tooltip)
          .map(key => {
            return `<p><span>${key}:</span> ${d.tooltip[key]}</p>`
          })
          .join('')
      : `<h2>${d.name}</h2>`
  )
  tooltip.style('display', 'block')
}

function moveTooltip(d) {
  if (
    !tooltip.attr('style') ||
    tooltip.attr('style').includes('display: none;')
  ) {
    tooltip.style('display', 'block')
  }

  const tooltipHeight = Number(tooltip.style('height').slice(0, -2))
  const tooltipWidth = Number(tooltip.style('width').slice(0, -2))
  const bottom = d3event.layerY + 10 + tooltipHeight
  const right = d3event.layerX + 10 + tooltipWidth

  tooltip
    .style(
      'top',
      bottom > window.innerHeight - 10
        ? window.innerHeight - tooltipHeight - 10
        : d3event.layerY + 10 + 'px'
    )
    .style(
      'left',
      right > window.innerWidth - 10
        ? window.innerWidth - tooltipWidth - 10
        : d3event.layerX + 10 + 'px'
    )
}

function hideTooltip() {
  tooltip.style('display', 'none')
}

function dragStarted(d) {
  hideTooltip()
  mouseIsDown = true
  // setRenderTimeout(null)
  if (!d3event.active)
    simulation
      .alpha(0.1)
      .alphaDecay(0)
      .restart()
  d.fx = d.x
  d.fy = d.y
}

function dragEnded(d) {
  mouseIsDown = false
  simulation.alphaDecay(0.0228)
  d.fx = null
  d.fy = null
}

function dragged(d) {
  d.fx = d3event.x
  d.fy = d3event.y
}
