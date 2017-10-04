import { getGroupNumber } from './constants'

const createLink = (source, target, group) => ({
  group,
  source,
  target,
  value: 1.5
})

const createLinkForNode = (
  { id: source },
  { metadata: { uid: target, namespace } }
) => {
  return createLink(source, target, getGroupNumber(namespace))
}

export { createLink, createLinkForNode }
