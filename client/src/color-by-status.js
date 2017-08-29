const colorStatus = (status = '') => {
  switch (status.toLowerCase()) {
    case 'pending':
      return '#7ac2ff'
    case 'running':
      return '#62ff62'
    case 'waiting':
      return '#ffff71'
    case 'terminating':
    case 'terminated':
      return '#ff6b6b'
    default:
      return '#222222'
  }
}

export default colorStatus
