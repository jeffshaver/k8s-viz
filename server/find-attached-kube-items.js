const findAttachedKubeItems = (kubeItem, kubeItems) => {
  const attachedKubeItems = []
  let namespace
  const allKubeItems = Array.prototype.concat.apply(
    [],
    Object.keys(kubeItems)
      .filter(key => key !== kubeItem.kind.toLowerCase() + 's')
      .map(kubeItemType => {
        return kubeItems[kubeItemType]
      })
  )
  allKubeItems.forEach(currentKubeItem => {
    switch (currentKubeItem.kind) {
      case 'Job':
        const { labels = {} } = kubeItem.metadata

        if (labels['controller-uid'] === currentKubeItem.metadata.uid) {
          attachedKubeItems.push(currentKubeItem)
        }
      case 'DaemonSet':
      case 'ReplicaSet':
      case 'ReplicationController':
      case 'StatefulSet': {
        const { ownerReferences = [] } = kubeItem.metadata
        const ownerReference = ownerReferences[0]

        if (!ownerReference) {
          return false
        }

        if (
          kubeItem.metadata.ownerReferences[0].uid ===
          currentKubeItem.metadata.uid
        ) {
          attachedKubeItems.push(currentKubeItem)
        }
      }
      case 'Namespace':
        if (kubeItem.metadata.namespace === currentKubeItem.metadata.name) {
          namespace = currentKubeItem
        }
      case 'Pod':
        if (kubeItem.kind === 'PersistentVolumeClaim') {
          let isAttached = false
          const { volumes = [] } = currentKubeItem.spec
          const volumesWithClaims = volumes.filter(
            volume =>
              volume.persistentVolumeClaim &&
              volume.persistentVolumeClaim.claimName
          )

          if (volumesWithClaims.length === 0) {
            return false
          }

          volumesWithClaims.forEach(volume => {
            if (
              volume.persistentVolumeClaim.claimName === kubeItem.metadata.name
            ) {
              isAttached = true
            }
          })

          if (isAttached) {
            attachedKubeItems.push(currentKubeItem)
          }
        }

        if (kubeItem.kind === 'Service') {
          if (!kubeItem.spec.selector) {
            break
          }

          const { namespace } = kubeItem.metadata
          const selectorKey = Object.keys(kubeItem.spec.selector)[0]
          const selectorValue = kubeItem.spec.selector[selectorKey]
          const {
            labels = {},
            namespace: podNamespace
          } = currentKubeItem.metadata
          const hasNoLabels = Object.keys(labels).length === 0

          if (
            namespace !== podNamespace ||
            hasNoLabels ||
            labels[selectorKey] !== selectorValue
          ) {
            break
          }

          attachedKubeItems.push(currentKubeItem)
        }
    }
  })

  if (attachedKubeItems.length === 0 && kubeItem.kind !== 'Service') {
    attachedKubeItems.push(namespace)
  }

  return attachedKubeItems
}

module.exports = findAttachedKubeItems
