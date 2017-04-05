import getLatestDeployments from './get-latest-deployments'
import {height, width} from './constants'

const generateNodesAndLinks = ({namespaces, deployments, pods}) => {
  let groupNumber = 1
  const cx = width / 2
  const cy = height / 2
  let nodes = [{id: 'master', name: 'master', group: groupNumber++, fx: cx, fy: cy}]
  let links = []
  const namespaceNodes = []
  const namespaceLinks = []

  namespaces.forEach((namespace) => {
    const namespaceNode = {
      id: namespace.metadata.name,
      group: groupNumber++,
      tooltip: {
        Type: 'namespace',
        Name: namespace.metadata.name
      }
    }

    if (namespace.x) {
      namespaceNode.x = namespace.x
      namespaceNode.y = namespace.y
    }

    namespaceNodes.push(namespaceNode)
    namespaceLinks.push({
      source: 'master',
      target: namespace.metadata.name,
      value: 1
    })
  })

  const latestDeployments = getLatestDeployments(deployments)
  const deploymentNodes = []
  const deploymentLinks = []

  Object.keys(latestDeployments).forEach((deploymentName) => {
    const deployment = latestDeployments[deploymentName]
    const namespaceNode = namespaceNodes.find((node) => {
      return node.id === deployment.metadata.namespace
    })
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

  pods.forEach((pod) => {
    const status = pod.metadata.deletionTimestamp
      ? 'terminating'
      : (
        pod.status.containerStatuses
        ? Object.keys(pod.status.containerStatuses[0].state)[0]
        : 'Unscheduleable'
      )
    let reason

    if (status === 'waiting') {
      reason = pod.status.containerStatuses[0].state[status].reason
    }

    const deploymentNode = deploymentNodes.find((deploymentNode) => {
      return pod.metadata.namespace + '_' + pod.metadata.labels.deployment === deploymentNode.id
    })

    if (!deploymentNode) {
      return
    }

    const podNode = {
      id: deploymentNode.id + '_' + pod.metadata.name,
      name: pod.metadata.name,
      group: deploymentNode.group,
      status,
      tooltip: {
        Type: 'pod',
        Name: pod.metadata.name,
        Namespace: deploymentNode.id.split('_')[0],
        Deployment: deploymentNode.id.split('_')[1],
        Status: status + (!reason ? '' : `: ${reason}`)
      }
    }

    if (pod.x) {
      podNode.x = pod.x
      podNode.y = pod.y
    }

    podNodes.push(podNode)
    podLinks.push({
      source: deploymentNode.id,
      target: deploymentNode.id + '_' + pod.metadata.name,
      value: 1
    })
  })

  nodes = nodes.concat(namespaceNodes, deploymentNodes, podNodes)
  links = links.concat(namespaceLinks, deploymentLinks, podLinks)

  return {
    nodes,
    links
  }
}

export default generateNodesAndLinks