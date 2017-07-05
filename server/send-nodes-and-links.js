const sendNodesAndLinks = (websockets, data) => {
  websockets.forEach(ws => {
    ws.send(JSON.stringify(data))
  })
}

module.exports = sendNodesAndLinks
