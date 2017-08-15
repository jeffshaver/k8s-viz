const createPodNode = (pod, attachedNode) => {
  const { name, uid: id } = pod.metadata
  const { kind: type } = attachedNode.data
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
    Type: 'pod',
    Name: pod.metadata.name
  }

  if (type === 'Namespace') {
    const { name: namespace } = attachedNode.data.metadata

    tooltip = Object.assign({}, tooltip, { Namespace: namespace })
  } else {
    const { name, namespace } = attachedNode.data.metadata

    tooltip = Object.assign({}, tooltip, {
      Namespace: namespace,
      [type]: name
    })
  }

  tooltip = Object.assign({}, tooltip, {
    Status: status + (!reason ? '' : `: ${reason}`)
  })

  const podNode = {
    id,
    name,
    group: attachedNode.group,
    status,
    tooltip
  }

  return podNode
}

export default createPodNode
