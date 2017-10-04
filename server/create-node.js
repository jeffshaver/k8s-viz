const findAttachedKubeItems = require('./find-attached-kube-items')
const getGroup = require('./get-group')
const getKubeItemType = require('./get-kube-item-type')
const objectPath = require('object-path')
const parseFieldName = require('./parse-field-name')
const removeAttachedNodeFromPath = require('./utils/remove-attached-node-from-path')
const shouldUseAttachedNode = require('./utils/should-use-attached-node')
const tooltipFields = require('./utils/tooltip-fields')

const createNode = (kubeItem, kubeItems) => {
  const { name, uid } = kubeItem.metadata
  const { kind } = kubeItem
  let { namespace } = kubeItem.metadata

  if (kind === 'Namespace') {
    namespace = name
  } else if (kind === 'PersistentVolume') {
    ;({ claimRef: { namespace } = {} } = kubeItem.spec)
  }

  const group = getGroup(namespace)
  const attachedKubeItems = findAttachedKubeItems(kubeItem, kubeItems)
  const tooltip = {}
  const kubeItemType = getKubeItemType(kind)
  const tooltipFieldNames = tooltipFields[kubeItemType]

  Object.keys(tooltipFieldNames).forEach(fieldName => {
    const fieldNameValue = parseFieldName(
      fieldName,
      kubeItem,
      attachedKubeItems
    )
    let kubeItemToUse = kubeItem
    let fieldValuePath = tooltipFieldNames[fieldName]
    let fieldValue

    if (typeof fieldValuePath === 'function') {
      fieldValue = fieldValuePath(kubeItem, attachedKubeItems)
    } else {
      if (shouldUseAttachedNode(fieldValuePath)) {
        fieldValuePath = removeAttachedNodeFromPath(fieldValuePath)
        kubeItemToUse = attachedKubeItems[0]
      }

      fieldValue = objectPath.get(kubeItemToUse, fieldValuePath)
    }

    tooltip[fieldNameValue] = fieldValue
  })

  let attachedTo

  if (kubeItem.kind === 'Namespace') {
    attachedTo = ['master']
  }

  if (!attachedTo && attachedKubeItems) {
    attachedTo = attachedKubeItems
  }

  return {
    data: kubeItem,
    attachedTo,
    name,
    group,
    uid,
    tooltip
  }
}

module.exports = createNode
