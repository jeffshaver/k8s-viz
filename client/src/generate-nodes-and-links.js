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
    }
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
    name: name,
    group,
    tooltip: {
      Type: 'daemonset',
      Name: name,
      Namespace: namespaceId
    }
  }

  if (daemonset.x) {
    daemonsetNode.x = daemonset.x
    daemonsetNode.y = daemonset.y
  }

  return daemonsetNode
}

const findDaemonsetNode = (daemonsetNodes, kubeItem) => {}

const findDeploymentNode = (deploymentNodes, kubeItem) => {
  const deploymentNode = deploymentNodes.find(deploymentNode => {
    const { ownerReferences = [] } = kubeItem.metadata
    const ownerReference = ownerReferences[0]

    if (!ownerReference) {
      return
    }

    return (
      kubeItem.metadata.namespace + '_' + ownerReference.name ===
      deploymentNode.id
    )
  })

  return deploymentNode
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
  let attachedNode = findDeploymentNode(deploymentNodes, pod)
  let attachedNodeIsNamespace = false

  if (attachedNode) {
    return { attachedNode, attachedNodeIsNamespace }
  }

  attachedNode = findNamespaceNode(namespaceNodes, pod)
  attachedNodeIsNamespace = !!attachedNode

  return { attachedNode, attachedNodeIsNamespace }
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
    const deploymentNode = {
      id: namespaceNode.id + '_' + deployment.metadata.name,
      name: deployment.metadata.name,
      group: namespaceNode.group,
      tooltip: {
        Type: 'deployment',
        Name: deployment.metadata.name,
        Namespace: namespaceNode.id
      }
    }

    if (deployment.x) {
      deploymentNode.x = deployment.x
      deploymentNode.y = deployment.y
    }

    deploymentNodes.push(deploymentNode)
    deploymentLinks.push({
      source: namespaceNode.id,
      target: namespaceNode.id + '_' + deployment.metadata.name,
      value: 1
    })
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

    const { attachedNode, attachedNodeIsNamespace } = findAttachedNode(
      daemonsetNodes,
      deploymentNodes,
      namespaceNodes,
      pod
    )

    if (!attachedNode) {
      return
    }

    const podNode = {
      id: attachedNode.id + '_' + pod.metadata.name,
      name: pod.metadata.name,
      group: attachedNode.group,
      status,
      tooltip: {
        Type: 'pod',
        Name: pod.metadata.name,
        Namespace: attachedNodeIsNamespace
          ? attachedNode.id
          : attachedNode.id.split('_')[0],
        Deployment: attachedNodeIsNamespace
          ? 'N/A'
          : attachedNode.id.split('_')[1],
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
