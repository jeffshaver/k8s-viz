const findPodsAttachedToService = (service, pods) => {
  const attachedPods = []

  if (!service.spec.selector) {
    return attachedPods
  }

  const selectorKey = Object.keys(service.spec.selector)[0]
  const selectorValue = service.spec.selector[selectorKey]

  pods.forEach(pod => {
    const { labels = {} } = pod.metadata
    const hasNoLabels = Object.keys(labels).length === 0

    if (hasNoLabels || labels[selectorKey] !== selectorValue) {
      return
    }

    attachedPods.push(pod)
  })

  return attachedPods
}

export default findPodsAttachedToService
