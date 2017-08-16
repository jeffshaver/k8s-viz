import simulation from './simulation'

const createAlphaTargetTimeout = () => {
  let timeout

  return () => {
    simulation.alphaTarget(0.1).restart()

    timeout = setTimeout(() => {
      simulation.alphaTarget(0)
    }, 4000)
  }
}

export default createAlphaTargetTimeout
