require('dotenv').config({ path: '../.env', silent: true })

const https = require('https')
const fs = require('fs')
const path = require('path')
const express = require('express')
const compression = require('compression')
const serveStatic = require('serve-static')
const k8s = require('k8s')
const namespacesRoute = require('./routes/namespaces')
const modifyOnWatch = require('./modify-on-watch')

const {
  KUBERNETES_ENDPOINT,
  KUBERNETES_TOKEN,
  NAMESPACE,
  SERVER_CERT_PATH,
  SERVER_KEY_PATH
} = process.env
const serverOptions = {
  cert: fs.readFileSync(SERVER_CERT_PATH),
  key: fs.readFileSync(SERVER_KEY_PATH)
}
const kubeApiOptions = {
  auth: {
    token: KUBERNETES_TOKEN
  },
  endpoint: KUBERNETES_ENDPOINT,
  strictSSL: false
}
const kubeApi = k8s.api(
  Object.assign({}, kubeApiOptions, { version: '/api/v1' })
)
const kubeBetaApi = k8s.api(
  Object.assign({}, kubeApiOptions, { version: '/apis/extensions/v1beta1' })
)
const app = express()
const httpsServer = https.createServer(serverOptions, app)

require('express-ws')(app, httpsServer)

app.use(compression())

// actual code

const websockets = []
const namespaces = []
const replicasets = []
const replicationcontrollers = []
const daemonsets = []
const pods = []

app.use(
  '/bundle.js',
  serveStatic(path.join(__dirname, '../', 'client/dist/bundle.js'))
)
app.ws('/namespaces', ws => {
  namespacesRoute(
    websockets,
    ws,
    namespaces,
    replicasets,
    replicationcontrollers,
    daemonsets,
    pods
  )
})
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'client/dist/index.html'))
})

const modifyNamespaces = modifyOnWatch(namespaces)
const modifyReplicaSets = modifyOnWatch(replicasets)
const modifyReplicationControllers = modifyOnWatch(replicationcontrollers)
const modifyDaemonSets = modifyOnWatch(daemonsets)
const modifyPods = modifyOnWatch(pods)
const openConnections = {
  daemonsets: false,
  replicasets: false,
  replicationcontrollers: false,
  namespaces: false,
  pods: false
}
const typeMap = {
  DaemonSet: 'daemonset',
  Namespace: 'namespace',
  Pod: 'pod',
  ReplicationController: 'replicationcontroller',
  ReplicaSet: 'replicaset'
}

const watchTimeout = 90000
const onWatchSuccess = (modifyFn, connectionName) => {
  return data => {
    data = Object.assign(data, { nodeType: typeMap[data.object.kind] })
    openConnections[connectionName] = true
    modifyFn(
      data,
      websockets,
      namespaces,
      replicasets,
      replicationcontrollers,
      pods
    )
  }
}
const onWatchError = (connectionName, connect) => {
  return () => {
    // console.log(connectionName, 'closed; reconnecting')

    connect()
  }
}

const namespacesEndpoint = `watch/namespaces${NAMESPACE ? '/' + NAMESPACE : ''}`
const daemonSetsEndpoint = NAMESPACE
  ? `watch/namespaces${NAMESPACE ? '/' + NAMESPACE : ''}/daemonsets`
  : 'watch/daemonsets'
const replicaSetsEndpoint = NAMESPACE
  ? `watch/namespaces/${NAMESPACE}/replicasets`
  : 'watch/replicasets'
const replicationControllersEndpoint = NAMESPACE
  ? `watch/namespaces/${NAMESPACE}/replicationcontrollers`
  : 'watch/replicationcontrollers'
const podsEndpoint = NAMESPACE
  ? `watch/namespaces/${NAMESPACE}/pods`
  : 'watch/pods'

const connectNamespaces = () => {
  kubeApi.watch(
    namespacesEndpoint,
    onWatchSuccess(modifyNamespaces, 'namespaces'),
    onWatchError('namespaces', connectNamespaces),
    watchTimeout
  )
}

const connectDaemonSets = () => {
  kubeBetaApi.watch(
    daemonSetsEndpoint,
    onWatchSuccess(modifyDaemonSets, 'daemonsets'),
    onWatchError('daemonsets', connectDaemonSets),
    watchTimeout
  )
}

const connectReplicaSets = () => {
  kubeBetaApi.watch(
    replicaSetsEndpoint,
    onWatchSuccess(modifyReplicaSets, 'replicasets'),
    onWatchError('replicasets', connectReplicaSets),
    watchTimeout
  )
}

const connectReplicationControllers = () => {
  kubeApi.watch(
    replicationControllersEndpoint,
    onWatchSuccess(modifyReplicationControllers, 'replicationcontrollers'),
    onWatchError('replicationcontrollers', connectReplicationControllers),
    watchTimeout
  )
}

const connectPods = () => {
  kubeApi.watch(
    podsEndpoint,
    onWatchSuccess(modifyPods, 'pods'),
    onWatchError('pods', connectPods),
    watchTimeout
  )
}

connectNamespaces()
connectDaemonSets()
connectReplicaSets()
connectReplicationControllers()
connectPods()

httpsServer.listen(3000, () => {
  /* eslint-disable no-console */
  console.log('app listening on port 3000')
  /* eslint-enable no-console */
})
