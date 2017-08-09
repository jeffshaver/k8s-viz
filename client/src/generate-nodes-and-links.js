import getLatestKubeItem from './get-latest-kube-item'
import { height, width } from './constants'

const createLink = (source, target) => ({
  source,
  target,
  value: 1
})

// (attachedNode, kubeItem)
const createLinkForNode = ({ id }, { metadata: { name } }) =>
  createLink(id, id + '_' + name)

const createNamespaceNode = (namespace, groupNumber) => {
  const { name } = namespace.metadata
  const namespaceNode = {
    id: name,
    group: groupNumber,
    tooltip: {
      Type: 'namespace',
      Name: name
    },
    type: 'Namespace'
  }

  if (namespace.x) {
    namespaceNode.x = namespace.x
    namespaceNode.y = namespace.y
  }

  return namespaceNode
}

const createDaemonsetNode = (daemonset, { id: namespaceId, group }) => {
  const { name } = daemonset.metadata
  const daemonsetNode = {
    id: namespaceId + '_' + name,
    name,
    group,
    tooltip: {
      Type: 'daemonset',
      Name: name,
      Namespace: namespaceId
    },
    type: 'Daemonset'
  }

  if (daemonset.x) {
    daemonsetNode.x = daemonset.x
    daemonsetNode.y = daemonset.y
  }

  return daemonsetNode
}

const createReplicaSetNode = (replicaSet, { id: namespaceId, group }) => {
  const { name } = replicaSet.metadata
  const replicaSetNode = {
    id: namespaceId + '_' + name,
    name,
    group,
    tooltip: {
      Type: 'replicaset',
      Name: name,
      Namespace: namespaceId
    },
    type: 'ReplicaSet'
  }

  if (replicaSet.x) {
    replicaSetNode.x = replicaSet.x
    replicaSetNode.y = replicaSet.y
  }

  return replicaSetNode
}
const createReplicationControllerNode = (
  replicationController,
  { id: namespaceId, group }
) => {
  const { name } = replicationController.metadata
  const replicationControllerNode = {
    id: namespaceId + '_' + name,
    name,
    group,
    tooltip: {
      Type: 'replicationcontroller',
      Name: name,
      Namespace: namespaceId
    },
    type: 'ReplicationController'
  }

  if (replicationController.x) {
    replicationControllerNode.x = replicationController.x
    replicationControllerNode.y = replicationController.y
  }

  return replicationControllerNode
}

const findOwnerNode = (nodes, kubeItem) => {
  const { ownerReferences = [] } = kubeItem.metadata
  const ownerReference = ownerReferences[0]

  if (!ownerReference) {
    return
  }

  const ownerNode = nodes.find(node => {
    return kubeItem.metadata.namespace + '_' + ownerReference.name === node.id
  })

  return ownerNode
}

const findNamespaceNode = (namespaceNodes, kubeItem) => {
  const namespaceNode = namespaceNodes.find(
    namespaceNode => kubeItem.metadata.namespace === namespaceNode.id
  )

  return namespaceNode
}

const findAttachedNode = (
  daemonsetNodes,
  replicaSetNodes,
  replicationControllerNodes,
  namespaceNodes,
  pod
) => {
  let attachedNode = findOwnerNode(replicaSetNodes, pod)
  let attachedNodeType = 'ReplicaSet'

  if (attachedNode) {
    return { attachedNode, attachedNodeType }
  }

  attachedNode = findOwnerNode(replicationControllerNodes, pod)
  attachedNodeType = 'ReplicationController'

  if (attachedNode) {
    return { attachedNode, attachedNodeType }
  }

  attachedNode = findOwnerNode(daemonsetNodes, pod)
  attachedNodeType = 'DaemonSet'

  if (attachedNode) {
    return { attachedNode, attachedNodeType }
  }

  attachedNode = findNamespaceNode(namespaceNodes, pod)
  attachedNodeType = 'Namespace'

  return { attachedNode, attachedNodeType }
}

const generateNodesAndLinks = ({
  daemonsets,
  namespaces,
  pods,
  replicasets,
  replicationcontrollers
}) => {
  const cx = width / 2
  const cy = height / 2
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

  const daemonsetNodes = []
  const daemonsetLinks = []

  daemonsets.forEach(daemonset => {
    const namespaceNode = findNamespaceNode(namespaceNodes, daemonset)

    daemonsetNodes.push(createDaemonsetNode(daemonset, namespaceNode))
    daemonsetLinks.push(createLinkForNode(namespaceNode, daemonset))
  })

  const latestReplicaSets = getLatestKubeItem(replicasets)
  const replicaSetNodes = []
  const replicaSetLinks = []

  Object.keys(latestReplicaSets).forEach(replicaSetName => {
    const replicaSet = latestReplicaSets[replicaSetName]
    const namespaceNode = findNamespaceNode(namespaceNodes, replicaSet)

    replicaSetNodes.push(createReplicaSetNode(replicaSet, namespaceNode))
    replicaSetLinks.push(createLinkForNode(namespaceNode, replicaSet))
  })

  const latestReplicationControllers = getLatestKubeItem(replicationcontrollers)
  const replicationControllerNodes = []
  const replicationControllerLinks = []

  Object.keys(
    latestReplicationControllers
  ).forEach(replicationControllerName => {
    const replicationController =
      latestReplicationControllers[replicationControllerName]
    const namespaceNode = findNamespaceNode(
      namespaceNodes,
      replicationController
    )

    replicationControllerNodes.push(
      createReplicationControllerNode(replicationController, namespaceNode)
    )
    replicationControllerLinks.push(
      createLinkForNode(namespaceNode, replicationController)
    )
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

    const { attachedNode, attachedNodeType } = findAttachedNode(
      daemonsetNodes,
      replicaSetNodes,
      replicationControllerNodes,
      namespaceNodes,
      pod
    )

    if (!attachedNode) {
      return
    }

    let Namespace
    let DaemonSet
    let ReplicaSet
    let ReplicationController

    switch (attachedNodeType) {
      case 'DaemonSet':
        Namespace = attachedNode.id.split('_')[0]
        ReplicaSet = 'n/a'
        ReplicationController = 'n/a'
        DaemonSet = attachedNode.id.split('_')[1]
        break
      case 'Namespace':
        Namespace = attachedNode.id
        ReplicaSet = 'n/a'
        ReplicationController = 'n/a'
        DaemonSet = 'n/a'
        break
      case 'ReplicaSet':
        Namespace = attachedNode.id.split('_')[0]
        ReplicaSet = attachedNode.id.split('_')[1]
        ReplicationController = 'n/a'
        DaemonSet = 'n/a'
        break
      case 'ReplicationController':
        Namespace = attachedNode.id.split('_')[0]
        ReplicaSet = 'n/a'
        ReplicationController = attachedNode.id.split('_')[1]
        DaemonSet = 'n/a'
        break
      default:
        break
    }

    const podNode = {
      id: attachedNode.id + '_' + pod.metadata.name,
      name: pod.metadata.name,
      group: attachedNode.group,
      status,
      tooltip: {
        Type: 'pod',
        Name: pod.metadata.name,
        Namespace,
        DaemonSet,
        ReplicaSet,
        ReplicationController,
        Status: status + (!reason ? '' : `: ${reason}`)
      }
    }

    if (pod.x) {
      podNode.x = pod.x
      podNode.y = pod.y
    }

    podNodes.push(podNode)
    podLinks.push({
      source: attachedNode.id,
      target: attachedNode.id + '_' + pod.metadata.name,
      value: 1
    })
  })

  nodes = nodes.concat(
    namespaceNodes,
    daemonsetNodes,
    replicaSetNodes,
    replicationControllerNodes,
    podNodes
  )
  links = links.concat(
    namespaceLinks,
    daemonsetLinks,
    replicaSetLinks,
    replicationControllerLinks,
    podLinks
  )

  return {
    nodes,
    links
  }
}

export default generateNodesAndLinks
