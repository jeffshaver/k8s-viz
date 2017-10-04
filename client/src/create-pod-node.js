import { getGroupNumber } from './constants'

const createPodNode = (pod, attachedNode) => {
  const { name, namespace, uid: id } = pod.metadata
  const { kind: attachedNodeType } = attachedNode.data
  const status = pod.metadata.deletionTimestamp
    ? 'terminating'
    : pod.status.containerStatuses
      ? Object.keys(pod.status.containerStatuses[0].state)[0]
      : 'Unscheduleable'
  let reason

  if (status === 'waiting') {
    reason = pod.status.containerStatuses[0].state[status].reason
  }

  let tooltip = {
    Type: pod.kind
  }

  if (attachedNodeType === 'Namespace') {
    const { name: namespace } = attachedNode.data.metadata

    tooltip = Object.assign({}, tooltip, { Namespace: namespace })
  } else {
    const { name, namespace } = attachedNode.data.metadata

    tooltip = Object.assign({}, tooltip, {
      Namespace: namespace,
      [attachedNodeType]: name
    })
  }

  tooltip = Object.assign({}, tooltip, {
    Status: status + (!reason ? '' : `: ${reason}`)
  })

  const podNode = {
    data: pod,
    id,
    name,
    group: getGroupNumber(namespace),
    status,
    tooltip,
    type: pod.kind
  }

  return podNode
}

export default createPodNode
