const createPersistentVolumeNode = (persistentVolume, { group }) => {
  const { name, uid: id } = persistentVolume.metadata
  const { namespace } = persistentVolume.spec.claimRef
  const { kind } = persistentVolume
  const node = {
    data: persistentVolume,
    id,
    name,
    group,
    tooltip: {
      Type: kind,
      Namespace: namespace
    },
    type: kind
  }

  return node
}

export default createPersistentVolumeNode
