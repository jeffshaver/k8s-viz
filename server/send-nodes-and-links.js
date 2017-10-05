const createNode = require('./create-node')
const getGroup = require('./get-group')
const masterKubeItem = { metadata: { uid: 'master' } }
const { NAMESPACE } = process.env

const sendNodesAndLinks = (websockets, kubeItems, log) => {
  let nodes = []
  let links = []

  if (!NAMESPACE) {
    nodes.push({ uid: 'master', name: 'master', group: getGroup('master') })
  }

  Object.keys(kubeItems).forEach(kubeItemType => {
    const kubeItemsForType = kubeItems[kubeItemType]

    kubeItemsForType.map(kubeItem =>
      nodes.push(createNode(kubeItem, kubeItems))
    )
  })

  nodes.forEach(node => {
    const { attachedTo = [], group, uid: source } = node
    attachedTo.forEach(attached => {
      if (attached === 'master' && NAMESPACE) {
        return
      }

      const attachedKubeItem =
        attached === 'master' ? masterKubeItem : attached ? attached : {}
      const { metadata: { uid: target } = {} } = attachedKubeItem

      if (!source || !target) {
        return
      }

      links.push({ group, source, target })
    })
  })

  websockets.forEach(ws => {
    ws.send(
      JSON.stringify(
        Object.assign(
          {},
          { nodes, links, log },
          { namespace: process.env.NAMESPACE }
        )
      )
    )
  })
}

module.exports = sendNodesAndLinks
