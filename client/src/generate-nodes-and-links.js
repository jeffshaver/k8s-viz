import createIntermediateNode from './create-intermediate-node'
import createNamespaceNode from './create-namespace-node'
import createPodNode from './create-pod-node'
import createServiceNode from './create-service-node'
import findAttachedNode from './find-attached-node'
import findNamespaceNode from './find-namespace-node'
import findPodsAttachedToService from './find-pods-attached-to-service'
import findNodesForKubeItems from './find-nodes-for-kube-items'
import getLatestKubeItem from './get-latest-kube-item'
import { createLink, createLinkForNode } from './create-link'
import { cx, cy, height, width } from './svg'

const generateNodesAndLinks = ({
  namespaces,
  daemonsets,
  jobs,
  replicasets,
  replicationcontrollers,
  statefulsets,
  pods,
  services
}) => {
  let groupNumber = 1
  let nodes = []
  let links = []

  // namespace nodes

  const namespaceNodes = []
  const namespaceLinks = []

  namespaces.forEach(namespace => {
    namespaceNodes.push(createNamespaceNode(namespace, groupNumber++))
    if (namespaces.length > 1) {
      namespaceLinks.push(createLink('master', namespace.metadata.uid))
    }
  })

  nodes = nodes.concat(namespaceNodes)
  links = links.concat(namespaceLinks)

  // intermediate nodes

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

      kubeItemNodes.push(createIntermediateNode(kubeItem, namespaceNode))
      kubeItemLinks.push(createLinkForNode(namespaceNode, kubeItem))
    })

    nodes = nodes.concat(kubeItemNodes)
    links = links.concat(kubeItemLinks)
  })

  // pod nodes

  const podNodes = []
  const podLinks = []

  pods.forEach(pod => {
    const attachedNode = findAttachedNode(nodes, pod)

    if (!attachedNode) {
      return
    }

    podNodes.push(createPodNode(pod, attachedNode))
    podLinks.push(createLinkForNode(attachedNode, pod))
  })

  nodes = nodes.concat(podNodes)
  links = links.concat(podLinks)

  // service nodes

  const serviceNodes = []
  const serviceLinks = []

  services.forEach(service => {
    const attachedPods = findPodsAttachedToService(service, pods)
    const attachedNodes = findNodesForKubeItems(attachedPods, nodes)

    serviceNodes.push(createServiceNode(service, attachedNodes))

    if (attachedNodes.length === 0) {
      return
    }

    attachedNodes.forEach(attachedNode => {
      serviceLinks.push(createLink(attachedNode.id, service.metadata.uid))
    })
  })

  links = links.concat(serviceLinks)

  if (namespaces.length > 1) {
    nodes.unshift({ id: 'master', name: 'master', group: groupNumber++ })
  }

  nodes[0] = Object.assign(nodes[0], { fx: cx, fy: cy })

  return {
    nodes,
    links,
    serviceNodes
  }
}

export default generateNodesAndLinks
