const createNode = require('../create-node')
const objectPath = require('object-path')
const sendNodesAndLinks = require('../send-nodes-and-links')

const clusterData = (websockets, ws, kubeItems, log) => {
  websockets.push(ws)
  ws.on('close', () => {
    const index = websockets.findIndex(websocket => {
      return websocket === ws
    })

    websockets.splice(index, 1)
  })

  sendNodesAndLinks(websockets, kubeItems, log)
}

module.exports = clusterData
