const removeDeletedNodes = (
  shouldRerender,
  graph,
  nodes,
  graphKey = 'nodes'
) => {
  const nodesToSplice = []

  nodes.forEach((node, i) => {
    const existingIndex = graph[graphKey].findIndex(d => {
      return d.id === node.id
    })

    if (existingIndex === -1) {
      shouldRerender = true
      nodesToSplice.push(i)
    }
  })

  for (let i = 0; i < nodesToSplice.length; i++) {
    nodes.splice(nodesToSplice[i] - i, 1)
  }

  return shouldRerender
}

export default removeDeletedNodes
