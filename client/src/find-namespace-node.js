const findNamespaceNode = (namespaceNodes, kubeItem) => {
  const namespaceNode = namespaceNodes.find(
    namespaceNode =>
      kubeItem.metadata.namespace === namespaceNode.data.metadata.name
  )

  return namespaceNode
}

export default findNamespaceNode
