let nextGroup = 0
const groups = {}
const getGroup = namespace => {
  if (groups[namespace] === undefined) {
    groups[namespace] = nextGroup++
  }

  return groups[namespace]
}

module.exports = getGroup
