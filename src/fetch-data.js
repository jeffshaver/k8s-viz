/* global WebSocket */
// import fetch from 'isomorphic-fetch'
import mergeNodesAndLinks from './merge-nodes-and-links'
import render from './render'

let reconnectInterval
const websocketURI = `ws://${window.location.host}/namespaces`

createWebsocket(websocketURI)

function createWebsocket (uri) {
  const websocket = new WebSocket(uri)

  websocket.addEventListener('open', () => {
    clearInterval(reconnectInterval)

    console.log('websocket opened')
  })

  websocket.addEventListener('close', () => {
    console.log('websocket closed')

    reconnectInterval = setInterval(() => {
      console.log('re-connecting websocket')
      createWebsocket(websocketURI)
    }, 2000)
  })

  websocket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data)
    const shouldRerender = mergeNodesAndLinks(data)

    if (!shouldRerender) {
      return
    }

    console.log('data recieved, calling render')

    render(data)
  })

  return websocket
}