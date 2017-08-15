import is from 'is'

const modifyExistingNodes = (
  shouldRerender,
  graph,
  nodes,
  graphKey = 'nodes'
) => {
  graph[graphKey].forEach(node => {
    const existingIndex = nodes.findIndex(d => {
      return d.id === node.id
    })

    if (existingIndex === -1) {
      shouldRerender = true
      nodes.push(node)

      return
    }

    if (
      is.equal(
        nodes[existingIndex],
        Object.assign({}, nodes[existingIndex], node)
      )
    ) {
      return
    }

    nodes[existingIndex] = Object.assign(nodes[existingIndex], node)
    shouldRerender = true
  })

  return shouldRerender
}

export default modifyExistingNodes
