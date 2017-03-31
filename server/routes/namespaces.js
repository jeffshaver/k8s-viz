const sendNodesAndLinks = require('../send-nodes-and-links')

const namespaces = (websockets, ws, namespaces, deployments, pods) => {
  websockets.push(ws)
  ws.on('close', () => {
    const index = websockets.findIndex((websocket) => {
      return websocket === ws
    })

    websockets.splice(index, 1)
  })

  sendNodesAndLinks([ws], namespaces, deployments, pods)
}

module.exports = namespaces