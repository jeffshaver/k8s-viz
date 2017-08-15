const findNodesForKubeItems = (kubeItems, nodes) => {
  const relatedNodes = []

  kubeItems.forEach(kubeItem => {
    const relatedNode = nodes.find(node => node.id === kubeItem.metadata.uid)

    if (!relatedNode) {
      return
    }

    relatedNodes.push(relatedNode)
  })

  return relatedNodes
}

export default findNodesForKubeItems
