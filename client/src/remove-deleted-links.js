import { links } from './constants'

const removeDeletedLinks = (shouldRerender, graph, link, i) => {
  const existingIndex = graph.links.findIndex(d => {
    if (typeof link.source === 'object') {
      return d.source + '-' + d.target === link.source.id + '-' + link.target.id
    }

    return d.source + '-' + d.target === link.source + '-' + link.target
  })

  if (existingIndex === -1) {
    shouldRerender = true
    links.splice(i, 1)
  }

  return shouldRerender
}

export default removeDeletedLinks
