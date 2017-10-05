const tooltipFields = {
  namespace: {
    Kind: 'kind'
  },
  intermediate: {
    Kind: 'kind',
    Namespace: 'metadata.namespace'
  },
  pod: {
    Kind: 'kind',
    Namespace: 'metadata.namespace',
    'attachedNode.kind': 'attachedNode.metadata.name',
    Status: kubeItem => {
      const status = kubeItem.metadata.deletionTimestamp
        ? 'terminating'
        : kubeItem.status.containerStatuses
          ? Object.keys(kubeItem.status.containerStatuses[0].state)[0]
          : 'Unscheduleable'
      let reason

      if (status === 'waiting') {
        reason = kubeItem.status.containerStatuses[0].state[status].reason
      }

      return `${status}${reason ? ': ' + reason : ''}`
    }
  },
  service: {
    Kind: 'kind',
    Namespace: 'metadata.namespace',
    'Service Type': 'spec.type',
    Ports: (kubeItem, attachedKubeItems) => {
      return kubeItem.spec.ports
        .map(
          ({ nodePort, port, protocol, targetPort }) =>
            `${protocol}:${port}${targetPort ? ':' + targetPort : ''}${nodePort
              ? ':' + nodePort
              : ''}`
        )
        .join(',<br>' + '&nbsp'.repeat(14))
    }
  },
  persistentvolumeclaim: {
    Kind: 'kind',
    Namespace: 'metadata.namespace',
    Capacity: 'status.capacity.storage'
  }
}

module.exports = tooltipFields
