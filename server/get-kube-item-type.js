const getKubeItemType = kind => {
  switch (kind) {
    case 'Namespace':
      return 'namespace'
    case 'Pod':
      return 'pod'
    case 'Service':
      return 'service'
    case 'PersistentVolume':
      return 'persistentvolume'
    default:
      return 'intermediate'
  }
}

module.exports = getKubeItemType
