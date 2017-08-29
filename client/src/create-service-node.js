import { getGroupNumber } from './constants'

const createServiceNode = (service, attachedNodes) => {
  const { name, namespace, uid: id } = service.metadata
  const { ports, type } = service.spec
  const { kind } = service

  let tooltip = {
    Type: kind,
    'Service Type': type,
    Name: name,
    Namespace: namespace
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
    group: getGroupNumber(namespace),
    name,
    tooltip,
    type: kind
  }

  return serviceNode
}

export default createServiceNode
