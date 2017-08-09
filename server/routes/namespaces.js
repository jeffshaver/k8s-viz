const namespaces = (
  websockets,
  ws,
  namespaces,
  replicasets,
  replicationcontrollers,
  daemonsets,
  pods
) => {
  websockets.push(ws)
  ws.on('close', () => {
    const index = websockets.findIndex(websocket => {
      return websocket === ws
    })

    websockets.splice(index, 1)
  })

  ws.send(
    JSON.stringify({
      namespaces,
      replicasets,
      replicationcontrollers,
      daemonsets,
      pods
    })
  )
}

module.exports = namespaces
