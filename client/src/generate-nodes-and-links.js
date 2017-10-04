import createIntermediateNode from './create-intermediate-node'
import createLinkNode from './create-link-node'
import createNamespaceNode from './create-namespace-node'
import createPersistentVolumeNode from './create-persistent-volume-node'
import createPodNode from './create-pod-node'
import createServiceNode from './create-service-node'
import findAttachedNode from './find-attached-node'
import findNamespaceNode from './find-namespace-node'
import findPodsAttachedToService from './find-pods-attached-to-service'
import findNodesForKubeItems from './find-nodes-for-kube-items'
import getLatestKubeItem from './get-latest-kube-item'
import { createLink, createLinkForNode } from './create-link'
import { cx, cy, height, width } from './svg'
import { getGroupNumber } from './constants'

const generateNodesAndLinks = ({
  namespaces,
  daemonsets,
  jobs,
  replicasets,
  replicationcontrollers,
  statefulsets,
  pods,
  services,
  persistentvolumes
}) => {
  const masterNode = {
    id: 'master',
    name: 'master',
    group: getGroupNumber('master')
  }
  const linkNodes = []
  let nodes = []
  let links = []

  // namespace nodes

  const namespaceNodes = []
  const namespaceLinks = []

  namespaces.forEach(namespace => {
    const namespaceNode = createNamespaceNode(namespace)

    namespaceNodes.push(namespaceNode)
    if (namespaces.length > 1) {
      namespaceLinks.push(
        createLink('master', namespace.metadata.uid, namespaceNode.group)
      )
      linkNodes.push(createLinkNode(masterNode, namespaceNode))
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
      const intermediateNode = createIntermediateNode(kubeItem, namespaceNode)

      kubeItemNodes.push(intermediateNode)
      kubeItemLinks.push(createLinkForNode(namespaceNode, kubeItem))
      linkNodes.push(createLinkNode(namespaceNode, intermediateNode))
    })

    nodes = nodes.concat(kubeItemNodes)
    links = links.concat(kubeItemLinks)
  })

  // pod nodes

  const podNodes = []
  const podLinks = []

  pods.forEach(pod => {
    const attachedNode = findAttachedNode(nodes, pod)
    const podNode = createPodNode(pod, attachedNode)

    if (!attachedNode) {
      return
    }

    podNodes.push(podNode)
    podLinks.push(createLinkForNode(attachedNode, pod))
    linkNodes.push(createLinkNode(attachedNode, podNode))
  })

  nodes = nodes.concat(podNodes)
  links = links.concat(podLinks)

  // service nodes

  const serviceNodes = []
  const serviceLinks = []

  services.forEach(service => {
    const attachedPods = findPodsAttachedToService(service, pods)
    const attachedNodes = findNodesForKubeItems(attachedPods, nodes)
    const serviceNode = createServiceNode(service, attachedNodes)

    serviceNodes.push(serviceNode)

    if (attachedNodes.length === 0) {
      return
    }

    attachedNodes.forEach(attachedNode => {
      serviceLinks.push(
        createLink(attachedNode.id, service.metadata.uid, serviceNode.group)
      )
      linkNodes.push(createLinkNode(attachedNode, serviceNode))
    })
  })

  links = links.concat(serviceLinks)

  // persistent volumes

  const persistentVolumeNodes = []
  const persistentVolumeLinks = []

  persistentvolumes.forEach(persistentVolume => {
    const attachedNode = findAttachedNode(podNodes, persistentVolume)

    if (!attachedNode) {
      return
    }

    const persistentVolumeNode = createPersistentVolumeNode(
      persistentVolume,
      attachedNode
    )

    persistentVolumeNodes.push(persistentVolumeNode)
    persistentVolumeLinks.push(
      createLink(
        attachedNode.id,
        persistentVolume.metadata.uid,
        persistentVolumeNode.group
      )
    )
    linkNodes.push(createLinkNode(attachedNode, persistentVolumeNode))
  })

  links = links.concat(persistentVolumeLinks)

  if (namespaces.length > 1) {
    nodes.unshift(masterNode)
  }

  nodes[0] = Object.assign(nodes[0], { fx: cx, fy: cy })

  return {
    nodes,
    linkNodes,
    links,
    persistentVolumeNodes,
    serviceNodes
  }
}

export default generateNodesAndLinks
