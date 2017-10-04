import modifyExistingLinks from './modify-existing-links'
import modifyExistingNodes from './modify-existing-nodes'
import removeDeletedLinks from './remove-deleted-links'
import removeDeletedNodes from './remove-deleted-nodes'
import {
  links,
  linkNodes,
  nodes,
  persistentVolumeNodes,
  serviceNodes,
  setPrevNodesLength
} from './constants'

let shouldRerender = false

function mergeNodesAndLinks(graph) {
  shouldRerender = false

  setPrevNodesLength(
    nodes
      .concat(serviceNodes)
      .concat(persistentVolumeNodes)
      .concat(linkNodes).length
  )

  shouldRerender = removeDeletedNodes(shouldRerender, graph, nodes)
  shouldRerender = modifyExistingNodes(shouldRerender, graph, nodes)

  shouldRerender = removeDeletedNodes(
    shouldRerender,
    graph,
    serviceNodes,
    'serviceNodes'
  )
  shouldRerender = modifyExistingNodes(
    shouldRerender,
    graph,
    serviceNodes,
    'serviceNodes'
  )

  shouldRerender = removeDeletedNodes(
    shouldRerender,
    graph,
    persistentVolumeNodes,
    'persistentVolumeNodes'
  )
  shouldRerender = modifyExistingNodes(
    shouldRerender,
    graph,
    persistentVolumeNodes,
    'persistentVolumeNodes'
  )
  // shouldRerender = removeDeletedLinks(
  //   shouldRerender,
  //   graph,
  //   linkNodes,
  //   'linkNodes'
  // )
  // shouldRerender = modifyExistingLinks(
  //   shouldRerender,
  //   graph,
  //   linkNodes,
  //   'linkNodes'
  // )
  shouldRerender = removeDeletedLinks(shouldRerender, graph, links)
  shouldRerender = modifyExistingLinks(shouldRerender, graph, links)

  return shouldRerender
}

export default mergeNodesAndLinks
