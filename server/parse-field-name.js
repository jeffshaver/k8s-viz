const objectPath = require('object-path')
const removeAttachedNodeFromPath = require('./utils/remove-attached-node-from-path')
const shouldUseAttachedNode = require('./utils/should-use-attached-node')

const parseFieldName = (fieldName, kubeItem, attachedKubeItems) => {
  if (!fieldName.includes('.')) {
    return fieldName
  }

  if (!shouldUseAttachedNode(fieldName)) {
    return objectPath.get(kubeItem, fieldName)
  }

  return objectPath.get(
    attachedKubeItems[0],
    removeAttachedNodeFromPath(fieldName)
  )
}

module.exports = parseFieldName
