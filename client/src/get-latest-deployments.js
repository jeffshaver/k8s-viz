const getLatestDeployments = (deployments) => {
  /*
  {
    namespace: {
      deploymentName: latestDeployment,
      deploymentName2: latestDeployment
    }
  }
  */
  const latestDeployments = {}

  deployments.forEach((deployment) => {
    const deploymentName = deployment.spec.selector.deploymentconfig

    if (!latestDeployments[deploymentName]) {
      latestDeployments[deploymentName] = deployment

      return
    }

    const deploymentCreationDate = deployment.metadata.creationTimestamp
    const latestDeploymentCreationDate = latestDeployments[deploymentName].metadata.creationTimestamp

    if (new Date(deploymentCreationDate).getTime() > new Date(latestDeploymentCreationDate).getTime()) {
      latestDeployments[deploymentName] = deployment
    }
  })

  return latestDeployments
}

module.exports = getLatestDeployments