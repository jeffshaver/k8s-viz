import fetch from 'isomorphic-fetch'
import mergeNodesAndLinks from './merge-nodes-and-links'
import render from './render'

const fetchData = () => {
  return fetch('http://localhost:3000/namespaces')
  .then((response) => response.json())
  .then((graph) => {
    const shouldRerender = mergeNodesAndLinks(graph)

    return Promise.resolve(shouldRerender)
  })
  .then((shouldRerender) => {
    if (!shouldRerender) {
      return Promise.resolve()
    }

    return render()
  })
}

export default fetchData