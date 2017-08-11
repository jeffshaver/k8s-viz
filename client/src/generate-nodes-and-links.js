import getLatestKubeItem from './get-latest-kube-item'
import { height, width } from './constants'

const cx = width / 2
const cy = height / 2

const createLink = (source, target) => ({
  source,
  target,
  value: 1
})

// (attachedNode, kubeItem)
const createLinkForNode = ({ id }, { metadata: { name } }) =>
  createLink(id, id + '_' + name)

const createNamespaceNode = (namespace, groupNumber) => {
  const { name, uid } = namespace.metadata
  const { kind } = namespace
  const namespaceNode = {
    uid,
    id: name,
    group: groupNumber,
    tooltip: {
      Type: kind.toLowerCase(),
      Name: name
    },
    type: kind
  }

  return namespaceNode
}

const createSubNode = (
  kubeItem,
  { id: namespaceId, group, fx: namespaceX, fy: namespaceY }
) => {
  const { name, uid } = kubeItem.metadata
  const { kind } = kubeItem
  const node = {
    uid,
    id: `${namespaceId}_${name}`,
    name,
    group,
    tooltip: {
      Type: kind.toLowerCase(),
      Name: name,
      Namespace: namespaceId
    },
    type: kind
  }

  return node
}

const findAttachedNode = (nodes, kubeItem) => {
  let namespaceNode
  let attachedNode = nodes.find(node => {
    switch (node.type) {
      case 'Job':
        return kubeItem.metadata.labels['controller-uid'] === node.uid
      case 'DaemonSet':
      case 'ReplicaSet':
      case 'ReplicationController':
      case 'StatefulSet': {
        const { ownerReferences = [] } = kubeItem.metadata
        const ownerReference = ownerReferences[0]

        if (!ownerReference) {
          return false
        }

        return kubeItem.metadata.ownerReferences[0].uid === node.uid
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

const findNamespaceNode = (namespaceNodes, kubeItem) => {
  const namespaceNode = namespaceNodes.find(
    namespaceNode => kubeItem.metadata.namespace === namespaceNode.id
  )

  return namespaceNode
}

const generateNodesAndLinks = ({
  namespaces,
  daemonsets,
  jobs,
  replicasets,
  replicationcontrollers,
  statefulsets,
  pods
}) => {
  let groupNumber = 1
  let nodes = [
    { id: 'master', name: 'master', group: groupNumber++, fx: cx, fy: cy }
  ]
  let links = []

  const namespaceNodes = []
  const namespaceLinks = []

  namespaces.forEach(namespace => {
    namespaceNodes.push(createNamespaceNode(namespace, groupNumber++))
    namespaceLinks.push(createLink('master', namespace.metadata.name))
  })

  nodes = nodes.concat(namespaceNodes)
  links = links.concat(namespaceLinks)

  const needsLatest = ['replicasets', 'replicationcontrollers', 'statefulsets']
  const nodeTypes = {
    daemonsets,
    jobs,
    replicasets,
    replicationcontrollers,
    statefulsets
  }

  Object.keys(nodeTypes).forEach(nodeType => {
    let kubeItems = nodeTypes[nodeType]
    const kubeItemNodes = []
    const kubeItemLinks = []

    if (needsLatest.includes(nodeType)) {
      let latestKubeItems = getLatestKubeItem(nodeTypes[nodeType])

      kubeItems = Object.keys(latestKubeItems).map(
        kubeItemName => latestKubeItems[kubeItemName]
      )
    }

    kubeItems.forEach(kubeItem => {
      const namespaceNode = findNamespaceNode(namespaceNodes, kubeItem)

      kubeItemNodes.push(createSubNode(kubeItem, namespaceNode))
      kubeItemLinks.push(createLinkForNode(namespaceNode, kubeItem))
    })

    nodes = nodes.concat(kubeItemNodes)
    links = links.concat(kubeItemLinks)
  })

  const podNodes = []
  const podLinks = []

  pods.forEach(pod => {
    const status = pod.metadata.deletionTimestamp
      ? 'terminating'
      : pod.status.containerStatuses
        ? Object.keys(pod.status.containerStatuses[0].state)[0]
        : 'Unscheduleable'
    let reason

    if (status === 'waiting') {
      reason = pod.status.containerStatuses[0].state[status].reason
    }

    let attachedNode = findAttachedNode(nodes, pod)

    if (!attachedNode) {
      return
    }

    let tooltip = {
      Type: 'pod',
      Name: pod.metadata.name
    }

    if (attachedNode.type === 'Namespace') {
      tooltip = Object.assign({}, tooltip, { Namespace: attachedNode.id })
    } else {
      const attachedNodeNames = attachedNode.id.split('_')

      tooltip = Object.assign({}, tooltip, {
        Namespace: attachedNodeNames[0],
        [attachedNode.type]: attachedNodeNames[1]
      })
    }

    tooltip = Object.assign({}, tooltip, {
      Status: status + (!reason ? '' : `: ${reason}`)
    })

    const podNode = {
      id: attachedNode.id + '_' + pod.metadata.name,
      name: pod.metadata.name,
      group: attachedNode.group,
      status,
      tooltip
    }

    podNodes.push(podNode)
    podLinks.push({
      source: attachedNode.id,
      target: attachedNode.id + '_' + pod.metadata.name,
      value: 1
    })
  })

  nodes = nodes.concat(podNodes)
  links = links.concat(podLinks)

  return {
    nodes,
    links
  }
}

export default generateNodesAndLinks
