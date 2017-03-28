require('dotenv').config({silent: true})

const path = require('path')
const express = require('express')
const compression = require('compression')
const serveStatic = require('serve-static')
const k8s = require('k8s')
const {
  KUBERNETES_ENDPOINT,
  KUBERNETES_TOKEN
} = process.env
const kubeApi = k8s.api({
  auth: {
    token: KUBERNETES_TOKEN
  },
  endpoint: KUBERNETES_ENDPOINT,
  strictSSL: false,
  version: '/api/v1'
})
const app = express()

app.use(compression())

let groupNumber = 1

app.use('/bundle.js', serveStatic('dist/bundle.js'))
app.get('/namespaces', namespaces)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/dist/index.html'))
})

async function namespaces (req, res) {
  const data = await getData()

  data.nodes.unshift({id: 'master', name: 'master', group: groupNumber++})

  groupNumber = 1

  res.status(200).json(data)
}

async function getData () {
  const [namespaces, deployments, pods] = await Promise.all([
    kubeApi.get('namespaces'),
    kubeApi.get('replicationcontrollers'),
    kubeApi.get('pods')
  ])

  const nodes = []
  const links = []

  const {nodes: namespaceNodes, links: namespaceLinks} = createNamespaceNodesAndLinks(namespaces)
  const {nodes: deploymentNodes, links: deploymentLinks} = createDeploymentNodesAndLinks(deployments, namespaceNodes)
  const {nodes: podNodes, links: podLinks} = createPodNodesAndLinks(pods, deploymentNodes)

  return {
    nodes: nodes.concat(namespaceNodes).concat(deploymentNodes).concat(podNodes),
    links: links.concat(namespaceLinks).concat(deploymentLinks).concat(podLinks)
  }
}

function createNamespaceNodesAndLinks (namespaces) {
  const nodes = []
  const links = []

  namespaces.items.forEach((item) => {
    nodes.push({
      id: item.metadata.name,
      group: groupNumber++,
      tooltip: {
        Type: 'namespace',
        Name: item.metadata.name
      }
    })
    links.push({
      source: 'master',
      target: item.metadata.name,
      value: 1
    })
  })

  return {nodes, links}
}

function getLatestDeployments (deployments) {
  /*
  {
    namespace: {
      deploymentName: latestDeployment,
      deploymentName2: latestDeployment
    }
  }
  */
  const latestDeployments = {}

  deployments.items.forEach((deployment) => {
    const namespace = deployment.metadata.namespace
    const deploymentName = deployment.spec.selector.deploymentconfig

    if (!latestDeployments[namespace]) {
      latestDeployments[namespace] = {}
    }

    if (!latestDeployments[namespace][deploymentName]) {
      latestDeployments[namespace][deploymentName] = deployment

      return
    }

    const deploymentCreationDate = deployment.metadata.creationTimestamp
    const latestDeploymentCreationDate = latestDeployments[namespace][deploymentName].metadata.creationTimestamp

    if (new Date(deploymentCreationDate).getTime() > new Date(latestDeploymentCreationDate).getTime()) {
      latestDeployments[namespace][deploymentName] = deployment
    }
  })

  return latestDeployments
}

function createDeploymentNodesAndLinks (deployments, namespaceNodes) {
  const latestDeployments = getLatestDeployments(deployments)
  const nodes = []
  const links = []

  namespaceNodes.forEach((namespaceNode) => {
    if (!latestDeployments[namespaceNode.id]) {
      return
    }

    const deploymentNames = Object.keys(latestDeployments[namespaceNode.id])

    deploymentNames.forEach((deploymentName) => {
      const deployment = latestDeployments[namespaceNode.id][deploymentName]

      nodes.push({
        id: namespaceNode.id + '_' + deployment.metadata.name,
        name: deployment.metadata.name,
        group: namespaceNode.group,
        tooltip: {
          Type: 'deployment',
          Name: deployment.metadata.name,
          Namespace: namespaceNode.id
        }
      })
      links.push({
        source: namespaceNode.id,
        target: namespaceNode.id + '_' + deployment.metadata.name,
        value: 1
      })
    })
  })

  return {nodes, links}
}

function createPodNodesAndLinks (pods, deploymentNodes) {
  const nodes = []
  const links = []

  pods.items.forEach((pod) => {
    const status = pod.metadata.deletionTimestamp
      ? 'terminating'
      : Object.keys(pod.status.containerStatuses[0].state)[0]
    let reason

    if (status === 'waiting') {
      reason = pod.status.containerStatuses[0].state[status].reason
    }

    const deploymentNode = deploymentNodes.find((deploymentNode) => {
      return pod.metadata.namespace + '_' + pod.metadata.labels.deployment === deploymentNode.id
    })

    if (!deploymentNode) {
      return
    }

    nodes.push({
      id: deploymentNode.id + '_' + pod.metadata.name,
      name: pod.metadata.name,
      group: deploymentNode.group,
      status,
      tooltip: {
        Type: 'pod',
        Name: pod.metadata.name,
        Namespace: deploymentNode.id.split('_')[0],
        Deployment: deploymentNode.id.split('_')[1],
        Status: status + (!reason ? '' : `: ${reason}`)
      }
    })
    links.push({
      source: deploymentNode.id,
      target: deploymentNode.id + '_' + pod.metadata.name,
      value: 1
    })
  })

  return {nodes, links}
}

app.listen(3000, () => {
  console.log('app listening on port 3000')
})