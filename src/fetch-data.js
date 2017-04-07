import generateNodesAndLinks from './generate-nodes-and-links'
import mergeNodesAndLinks from './merge-nodes-and-links'
import ReconnectingWebSocket from 'reconnecting-websocket'
import render from './render'
import {
  deployments,
  height,
  namespaces,
  pods,
  width
} from './constants'

const nodeTypes = {deployments, namespaces, pods}
const websocketURI = `ws://${window.location.host}/namespaces`
const websocket = new ReconnectingWebSocket(websocketURI)

websocket.addEventListener('message', (event) => {
  const eventData = JSON.parse(event.data)

  if (eventData.type) {
    if (!['ADDED', 'MODIFIED', 'DELETED'].includes(eventData.type)) {
      return
    }

    const array = nodeTypes[`${eventData.nodeType}s`]
    const existingIndex = array.findIndex((item) => {
      return item.metadata.uid === eventData.object.metadata.uid
    })

    if (existingIndex === -1 && eventData.type === 'ADDED') {
      eventData.object.x = width / 2
      eventData.object.y = height / 2
      array.push(eventData.object)
    }

    if (eventData.type === 'MODIFIED') {
      array[existingIndex] = eventData.object
    }

    if (eventData.type === 'DELETED') {
      array.splice(existingIndex, 1)
    }
  } else {
    namespaces.push(...eventData.namespaces)
    deployments.push(...eventData.deployments)
    pods.push(...eventData.pods)
  }

  const nodesAndLinks = generateNodesAndLinks({deployments, namespaces, pods})
  const shouldRerender = mergeNodesAndLinks(nodesAndLinks)

  if (!shouldRerender) {
    return
  }

  render()
})