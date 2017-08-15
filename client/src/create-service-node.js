const createServiceNode = (service, attachedNodes) => {
  const { name, uid: id } = service.metadata
  const { ports, type } = service.spec
  const { kind } = service
  let group
  let attachedIds

  if (attachedNodes.length !== 0) {
    group = attachedNodes[0].group
    attachedIds = attachedNodes.map(attachedNode => attachedNode.id)
  }

  let tooltip = {
    Type: kind.toLowerCase(),
    'Service Type': type,
    Name: name
  }

  if (ports.length !== 0) {
    const Ports = ports.map(({ port, protocol }) => `${protocol}: ${port}`)
    tooltip = Object.assign({}, tooltip, {
      Ports: ports
        .map(
          ({ nodePort, port, protocol, targetPort }) =>
            `${protocol}:${port}${targetPort ? ':' + targetPort : ''}${nodePort
              ? ':' + nodePort
              : ''}`
        )
        .join(',<br>' + '&nbsp'.repeat(14))
    })
  }

  const serviceNode = {
    id,
    group,
    attachedIds,
    name,
    tooltip,
    type: kind
  }

  return serviceNode
}

export default createServiceNode
