const sendNodesAndLinks = require('./send-nodes-and-links')
const MAX_LOG_LENGTH = 100

const modifyOnWatch = (array, kubeItems, log) => {
  return function(data, websockets) {
    const existingIndex = array.findIndex(item => {
      return item.metadata.uid === data.object.metadata.uid
    })
    const isAdded = data.type === 'ADDED' && existingIndex === -1
    const isModified = data.type === 'MODIFIED'
    const isDeleted = data.type === 'DELETED'

    if (!isAdded && !isModified && !isDeleted) {
      return
    }

    if (isAdded) {
      log.push(`${data.type} ${data.object.kind} ${data.object.metadata.name}`)
      log.splice(
        0,
        log.length < MAX_LOG_LENGTH ? 0 : log.length - MAX_LOG_LENGTH
      )
      array.push(data.object)
    }

    if (isModified) {
      log.push(`${data.type} ${data.object.kind} ${data.object.metadata.name}`)
      log.splice(
        0,
        log.length < MAX_LOG_LENGTH ? 0 : log.length - MAX_LOG_LENGTH
      )
      array[existingIndex] = data.object
    }

    if (isDeleted) {
      log.push(`${data.type} ${data.object.kind} ${data.object.metadata.name}`)
      log.splice(
        0,
        log.length < MAX_LOG_LENGTH ? 0 : log.length - MAX_LOG_LENGTH
      )
      array.splice(existingIndex, 1)
    }

    return sendNodesAndLinks(websockets, kubeItems, log)
  }
}

module.exports = modifyOnWatch
