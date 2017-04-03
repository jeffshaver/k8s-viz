import mergeNodesAndLinks from './merge-nodes-and-links'
import ReconnectingWebSocket from 'reconnecting-websocket'
import render from './render'

const websocketURI = `ws://${window.location.host}/namespaces`

const websocket = new ReconnectingWebSocket(websocketURI)

websocket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data)
  const shouldRerender = mergeNodesAndLinks(data)

  console.log(data)

  if (!shouldRerender) {
    return
  }

  console.log('data recieved, calling render')

  render(data)
})