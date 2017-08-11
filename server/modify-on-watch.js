const sendNodesAndLinks = require('./send-nodes-and-links')

const modifyOnWatch = array => {
  return function(data, websockets) {
    if (!['ADDED', 'MODIFIED', 'DELETED'].includes(data.type)) {
      return
    }

    const existingIndex = array.findIndex(item => {
      return item.metadata.uid === data.object.metadata.uid
    })

    if (data.type === 'ADDED' && existingIndex === -1) {
      array.push(data.object)
    }

    if (data.type === 'MODIFIED') {
      array[existingIndex] = data.object
    }

    if (data.type === 'DELETED') {
      array.splice(existingIndex, 1)
    }

    return sendNodesAndLinks(websockets, data)
  }
}

module.exports = modifyOnWatch
