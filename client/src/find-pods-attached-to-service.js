const findPodsAttachedToService = (service, pods) => {
  const attachedPods = []

  if (!service.spec.selector) {
    return attachedPods
  }

  const selectorKey = Object.keys(service.spec.selector)[0]
  const selectorValue = service.spec.selector[selectorKey]

  pods.forEach(pod => {
    if (pod.metadata.labels[selectorKey] !== selectorValue) {
      return
    }

    attachedPods.push(pod)
  })

  return attachedPods
}

export default findPodsAttachedToService
