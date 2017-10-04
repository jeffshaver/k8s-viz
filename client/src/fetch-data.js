import appendToEventLog from './append-to-event-log'
import generateNodesAndLinks from './generate-nodes-and-links'
import mergeNodesAndLinks from './merge-nodes-and-links'
import ReconnectingWebSocket from 'reconnecting-websocket'
import render from './render'
import {
  daemonsets,
  height,
  jobs,
  namespaces,
  persistentvolumes,
  pods,
  replicasets,
  replicationcontrollers,
  services,
  statefulsets,
  width
} from './constants'

const eventTypes = ['ADDED', 'MODIFIED', 'DELETED']
const nodeTypes = {
  namespaces,
  daemonsets,
  jobs,
  replicasets,
  replicationcontrollers,
  statefulsets,
  pods,
  services,
  persistentvolumes
}
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
    const isInitialAddition = Object.keys(nodeTypes)
      .map(nodeType => nodeTypes[nodeType])
      .every(nodes => nodes.length === 0)

    if (isInitialAddition) {
      appendToEventLog(
        `initial addition of ${Object.keys(nodeTypes)
          .map(nodeType => {
            const number = eventData[nodeType].length
            return `${number} ${number === 1
              ? nodeType.substring(0, nodeType.length - 1)
              : nodeType}`
          })
          .join(', ')}`
      )
      Object.keys(nodeTypes).forEach(nodeType => {
        nodeTypes[nodeType].push(...eventData[nodeType])
      })
    }
  }

  const nodesAndLinks = generateNodesAndLinks(nodeTypes)
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
