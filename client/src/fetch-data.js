import appendToEventLog from './append-to-event-log'
import generateNodesAndLinks from './generate-nodes-and-links'
import mergeNodesAndLinks from './merge-nodes-and-links'
import ReconnectingWebSocket from 'reconnecting-websocket'
import render from './render'
import {
  daemonsets,
  deployments,
  height,
  namespaces,
  pods,
  width
} from './constants'

const eventTypes = ['ADDED', 'MODIFIED', 'DELETED']
const nodeTypes = { daemonsets, deployments, namespaces, pods }
const websocketURI = `wss://${window.location.host}/namespaces`
const websocket = new ReconnectingWebSocket(websocketURI)

websocket.addEventListener('message', event => {
  const eventData = JSON.parse(event.data)
  const isUpdate = !!eventData.type

  if (isUpdate) {
    if (!eventTypes.includes(eventData.type)) {
      return
    }

    const array = nodeTypes[`${eventData.nodeType}s`]
    const existingIndex = array.findIndex(item => {
      return item.metadata.uid === eventData.object.metadata.uid
    })

    if (existingIndex === -1 && eventData.type === 'ADDED') {
      eventData.object.x = width / 2
      eventData.object.y = height / 2
      array.push(eventData.object)
      appendModificationToEventLog(eventData)
    }

    if (eventData.type === 'MODIFIED') {
      array[existingIndex] = eventData.object
      appendModificationToEventLog(eventData)
    }

    if (eventData.type === 'DELETED') {
      array.splice(existingIndex, 1)
      appendModificationToEventLog(eventData)
    }
  } else {
    const isInitialAddition =
      namespaces.length === 0 && deployments.length === 0 && pods.length === 0

    if (isInitialAddition) {
      Object.keys(nodeTypes).forEach(nodeType => {
        appendToEventLog(
          `initial addition of ${eventData[nodeType].length} ${nodeType}`
        )
        nodeTypes[nodeType].push(...eventData[nodeType])
      })
    }
  }

  const nodesAndLinks = generateNodesAndLinks({
    daemonsets,
    deployments,
    namespaces,
    pods
  })
  const shouldRerender = mergeNodesAndLinks(nodesAndLinks)

  if (!shouldRerender) {
    return
  }

  render()
})

function appendModificationToEventLog(eventData) {
  appendToEventLog(
    `${eventData.type} ${eventData.object.metadata.name} in ${eventData.object
      .metadata.namespace}`
  )
}
