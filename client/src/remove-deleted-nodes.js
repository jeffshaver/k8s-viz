import { nodes } from './constants'

const removeDeletedNodes = (shouldRerender, graph, node, i) => {
  const existingIndex = graph.nodes.findIndex(d => {
    return d.id === node.id
  })

  if (existingIndex === -1) {
    shouldRerender = true
    nodes.splice(i, 1)
  }

  return shouldRerender
}

export default removeDeletedNodes
