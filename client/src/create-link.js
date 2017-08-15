const createLink = (source, target) => ({
  source,
  target,
  value: 1.5
})

const createLinkForNode = ({ id: source }, { metadata: { uid: target } }) => {
  return createLink(source, target)
}

export { createLink, createLinkForNode }
