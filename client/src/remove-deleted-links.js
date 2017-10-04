const removeDeletedLinks = (
  shouldRerender,
  graph,
  links,
  graphKey = 'links'
) => {
  const linksToSplice = []

  links.forEach((link, i) => {
    const existingIndex = graph[graphKey].findIndex(d => {
      return d.source + '-' + d.target === link.source.id + '-' + link.target.id
    })

    if (existingIndex === -1) {
      shouldRerender = true
      linksToSplice.push(i)
    }
  })

  for (let i = 0; i < linksToSplice.length; i++) {
    links.splice(linksToSplice[i] - i, 1)
  }

  return shouldRerender
}

export default removeDeletedLinks
