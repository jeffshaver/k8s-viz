import is from 'is'
import {height, nodes, width} from './constants'

const modifyExistingNodes = (shouldRerender, node) => {
  const existingIndex = nodes.findIndex((d) => {
    return d.id === node.id
  })

  if (existingIndex === -1) {
    shouldRerender = true
    nodes.push(node)

    return shouldRerender
  }

  if (is.equal(nodes[existingIndex], Object.assign({}, nodes[existingIndex], node))) {
    return shouldRerender
  }

  nodes[existingIndex] = Object.assign(nodes[existingIndex], node)

  shouldRerender = true

  return shouldRerender
}

export default modifyExistingNodes