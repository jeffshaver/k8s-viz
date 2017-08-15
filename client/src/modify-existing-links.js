const modifyExistingLinks = (shouldRerender, graph, links) => {
  graph.links.forEach(link => {
    const existingIndex = links.findIndex(d => {
      return d.source.id + '-' + d.target.id === link.source + '-' + link.target
    })

    if (existingIndex === -1) {
      shouldRerender = true
      links.push(link)

      return shouldRerender
    }

    if (
      links[existingIndex].source === link.source &&
      links[existingIndex].target === link.target
    ) {
      return shouldRerender
    }

    links[existingIndex] = Object.assign(links[existingIndex], link)
    shouldRerender = true
  })

  return shouldRerender
}

export default modifyExistingLinks
