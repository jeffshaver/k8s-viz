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
