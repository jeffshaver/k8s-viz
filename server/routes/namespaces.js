const namespaces = (websockets, ws, kubeItems) => {
  websockets.push(ws)
  ws.on('close', () => {
    const index = websockets.findIndex(websocket => {
      return websocket === ws
    })

    websockets.splice(index, 1)
  })

  ws.send(JSON.stringify(kubeItems))
}

module.exports = namespaces
