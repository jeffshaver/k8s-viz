const createIntermediateNode = (kubeItem, { group }) => {
  const { name, uid: id } = kubeItem.metadata
  const { kind } = kubeItem
  const node = {
    data: kubeItem,
    id,
    name,
    group,
    tooltip: {
      Type: kind,
      Namespace: kubeItem.metadata.namespace
    },
    type: kind
  }

  return node
}

export default createIntermediateNode
