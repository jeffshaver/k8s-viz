const findAttachedNode = (nodes, kubeItem) => {
  let namespaceNode
  let attachedNode = nodes.find(node => {
    switch (node.type) {
      case 'Job':
        return kubeItem.metadata.labels['controller-uid'] === node.id
      case 'DaemonSet':
      case 'ReplicaSet':
      case 'ReplicationController':
      case 'StatefulSet': {
        const { ownerReferences = [] } = kubeItem.metadata
        const ownerReference = ownerReferences[0]

        if (!ownerReference) {
          return false
        }

        return kubeItem.metadata.ownerReferences[0].uid === node.id
      }
      case 'Namespace':
        namespaceNode = node
        return false
      case 'Pod':
        let isAttached = false
        const { volumes } = node.data.spec
        const volumesWithClaims = volumes.filter(
          volume =>
            volume.persistentVolumeClaim &&
            volume.persistentVolumeClaim.claimName
        )

        if (volumesWithClaims.length === 0) {
          return false
        }

        volumesWithClaims.forEach(volume => {
          if (!kubeItem.spec.claimRef) {
            return false
          }
          if (
            volume.persistentVolumeClaim.claimName ===
            kubeItem.spec.claimRef.name
          ) {
            isAttached = true
          }
        })

        return isAttached
      default:
        return false
    }
  })

  if (!attachedNode) {
    attachedNode = namespaceNode
  }

  return attachedNode
}

export default findAttachedNode
