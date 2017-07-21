import getLatestDeployments from './get-latest-deployments'
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

const createDeploymentNode = (deployment, { id: namespaceId, group }) => {
  const { name } = deployment.metadata
  const deploymentNode = {
    id: namespaceId + '_' + name,
    name,
    group,
    tooltip: {
      Type: 'deployment',
      Name: name,
      Namespace: namespaceId
    },
    type: 'Deployment'
  }

  if (deployment.x) {
    deploymentNode.x = deployment.x
    deploymentNode.y = deployment.y
  }

  return deploymentNode
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
  deploymentNodes,
  namespaceNodes,
  pod
) => {
  let attachedNode = findOwnerNode(deploymentNodes, pod)
  let attachedNodeType = 'Deployment'

  if (attachedNode) {
    return { attachedNode, attachedNodeType }
  }

  attachedNode = findOwnerNode(daemonsetNodes, pod)
  attachedNodeType = 'Daemonset'

  if (attachedNode) {
    return { attachedNode, attachedNodeType }
  }

  attachedNode = findNamespaceNode(namespaceNodes, pod)
  attachedNodeType = 'Namespace'

  return { attachedNode, attachedNodeType }
}

const generateNodesAndLinks = ({
  daemonsets,
  deployments,
  namespaces,
  pods
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

  const latestDeployments = getLatestDeployments(deployments)
  const deploymentNodes = []
  const deploymentLinks = []

  Object.keys(latestDeployments).forEach(deploymentName => {
    const deployment = latestDeployments[deploymentName]
    const namespaceNode = findNamespaceNode(namespaceNodes, deployment)

    deploymentNodes.push(createDeploymentNode(deployment, namespaceNode))
    deploymentLinks.push(createLinkForNode(namespaceNode, deployment))
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
      deploymentNodes,
      namespaceNodes,
      pod
    )

    if (!attachedNode) {
      return
    }

    let Namespace
    let Deployment
    let DaemonSet

    switch (attachedNodeType) {
      case 'Deployment':
        Namespace = attachedNode.id.split('_')[0]
        Deployment = attachedNode.id.split('_')[1]
        DaemonSet = 'n/a'
        break
      case 'DaemonSet':
        Namespace = attachedNode.id.split('_')[0]
        Deployment = 'n/a'
        DaemonSet = attachedNode.id.split('_')[1]
        break
      case 'Namespace':
        Namespace = attachedNode.id
        Deployment = 'n/a'
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
        Deployment,
        DaemonSet,
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
    deploymentNodes,
    podNodes
  )
  links = links.concat(
    namespaceLinks,
    daemonsetLinks,
    deploymentLinks,
    podLinks
  )

  return {
    nodes,
    links
  }
}

export default generateNodesAndLinks
