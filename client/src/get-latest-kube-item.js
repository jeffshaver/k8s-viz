const getLatestKubeItem = kubeItems => {
  /*
  {
    namespace: {
      kubeItem1: latestVersionOfKubeItem,
      kubeItem2: latestVersionOfKubeItem
    }
  }
  */
  const latestKubeItems = {}

  kubeItems.forEach(kubeItem => {
    const kubeItemName = kubeItem.metadata.name

    if (!latestKubeItems[kubeItemName]) {
      latestKubeItems[kubeItemName] = kubeItem

      return
    }

    const kubeItemCreationDate = kubeItem.metadata.creationTimestamp
    const latestKubeItemCreationDate =
      latestKubeItems[kubeItemName].metadata.creationTimestamp

    if (
      new Date(kubeItemCreationDate).getTime() >
      new Date(latestKubeItemCreationDate).getTime()
    ) {
      latestKubeItems[kubeItemName] = kubeItem
    }
  })

  return latestKubeItems
}

export default getLatestKubeItem
