import modifyExistingLinks from './modify-existing-links'
import modifyExistingNodes from './modify-existing-nodes'
import removeDeletedLinks from './remove-deleted-links'
import removeDeletedNodes from './remove-deleted-nodes'
import { links, nodes, setPrevNodesLength } from './constants'

let shouldRerender = false

function mergeNodesAndLinks(graph) {
  shouldRerender = false

  setPrevNodesLength(nodes.length)

  nodes.forEach((node, i) => {
    shouldRerender = removeDeletedNodes(shouldRerender, graph, node, i)
  })
  graph.nodes.forEach(node => {
    shouldRerender = modifyExistingNodes(shouldRerender, node)
  })

  links.forEach((link, i) => {
    shouldRerender = removeDeletedLinks(shouldRerender, graph, link, i)
  })
  graph.links.forEach(link => {
    shouldRerender = modifyExistingLinks(shouldRerender, link)
  })

  return shouldRerender
}

export default mergeNodesAndLinks
