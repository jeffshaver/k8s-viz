import { getGroupNumber } from './constants'

const createNamespaceNode = namespace => {
  const { name, uid: id } = namespace.metadata
  const { kind } = namespace
  const namespaceNode = {
    data: namespace,
    id,
    group: getGroupNumber(name),
    name,
    tooltip: {
      Type: kind
    },
    type: kind
  }

  return namespaceNode
}

export default createNamespaceNode
