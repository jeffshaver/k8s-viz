const createNamespaceNode = (namespace, groupNumber) => {
  const { name, uid: id } = namespace.metadata
  const { kind } = namespace
  const namespaceNode = {
    data: namespace,
    id,
    group: groupNumber,
    tooltip: {
      Type: kind.toLowerCase(),
      Name: name
    },
    type: kind
  }

  return namespaceNode
}

export default createNamespaceNode
