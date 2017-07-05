const namespaces = (
  websockets,
  ws,
  namespaces,
  deployments,
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
      deployments,
      daemonsets,
      pods
    })
  )
}

module.exports = namespaces
