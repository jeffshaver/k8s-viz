require('dotenv').config({ path: '../.env', silent: true })

const https = require('https')
const fs = require('fs')
const morgan = require('morgan')
const path = require('path')
const express = require('express')
const compression = require('compression')
const serveStatic = require('serve-static')
const k8s = require('k8s')
const clusterDataRoute = require('./routes/cluster-data')
const modifyOnWatch = require('./modify-on-watch')

const {
  KUBERNETES_ENDPOINT,
  KUBERNETES_TOKEN_PATH,
  NAMESPACE,
  SERVER_CERT_PATH,
  SERVER_KEY_PATH
} = process.env
const kubernetesToken = fs
  .readFileSync(KUBERNETES_TOKEN_PATH)
  .toString()
  .replace('\n', '')
const serverOptions = {
  cert: fs.readFileSync(SERVER_CERT_PATH),
  key: fs.readFileSync(SERVER_KEY_PATH)
}
const kubeApiOptions = {
  auth: {
    token: kubernetesToken
  },
  endpoint: KUBERNETES_ENDPOINT,
  strictSSL: false
}
const apis = {
  stable: k8s.api(Object.assign({}, kubeApiOptions, { version: '/api/v1' })),
  app: k8s.api(
    Object.assign({}, kubeApiOptions, { version: '/apis/apps/v1beta1' })
  ),
  beta: k8s.api(
    Object.assign({}, kubeApiOptions, { version: '/apis/extensions/v1beta1' })
  ),
  batch: k8s.api(
    Object.assign({}, kubeApiOptions, { version: '/apis/batch/v1' })
  )
}

const app = express()
const httpsServer = https.createServer(serverOptions, app)

require('express-ws')(app, httpsServer)

app.use(compression())

// actual code

const websockets = []
const kubeItems = {}
const clusterData = {}
const watchTimeout = 90000
let log = []

const endpoints = [
  {
    name: 'namespaces',
    app: false,
    batch: false,
    beta: false,
    path: `watch/namespaces${NAMESPACE ? '/' + NAMESPACE : ''}`
  },
  {
    name: 'daemonsets',
    app: false,
    batch: false,
    beta: true,
    path: NAMESPACE
      ? `watch/namespaces${NAMESPACE ? '/' + NAMESPACE : ''}/daemonsets`
      : 'watch/daemonsets'
  },
  {
    name: 'replicasets',
    app: false,
    batch: false,
    beta: true,
    path: NAMESPACE
      ? `watch/namespaces/${NAMESPACE}/replicasets`
      : 'watch/replicasets'
  },
  {
    name: 'replicationcontrollers',
    app: false,
    batch: false,
    beta: false,
    path: NAMESPACE
      ? `watch/namespaces/${NAMESPACE}/replicationcontrollers`
      : 'watch/replicationcontrollers'
  },
  {
    name: 'statefulsets',
    app: true,
    batch: false,
    beta: false,
    path: NAMESPACE
      ? `watch/namespaces/${NAMESPACE}/statefulsets`
      : 'watch/statefulsets'
  },
  {
    name: 'jobs',
    app: false,
    batch: true,
    beta: false,
    path: NAMESPACE ? `watch/namespaces/${NAMESPACE}/jobs` : 'watch/jobs'
  },
  {
    name: 'pods',
    app: false,
    batch: false,
    beta: false,
    path: NAMESPACE ? `watch/namespaces/${NAMESPACE}/pods` : 'watch/pods'
  },
  {
    name: 'services',
    app: false,
    batch: false,
    beta: false,
    path: NAMESPACE
      ? `watch/namespaces/${NAMESPACE}/services`
      : 'watch/services'
  },
  {
    name: 'persistentvolumeclaimss',
    app: false,
    batch: false,
    beta: false,
    path: NAMESPACE
      ? `watch/namespaces/${NAMESPACE}/persistentvolumeclaims`
      : 'watch/persistentvolumeclaims'
  }
]

endpoints.forEach(({ app, batch, beta, name, path }) => {
  const array = []
  const modify = modifyOnWatch(array, kubeItems, log)
  const connect = () => {
    const apiType =
      (batch && 'batch') || (beta && 'beta') || (app && 'app') || 'stable'
    apis[apiType].watch(
      path,
      onWatchSuccess(modify, name),
      onWatchError(name, connect),
      watchTimeout
    )
  }

  kubeItems[name] = array

  connect()

  function onWatchSuccess(modifyFn, connectionName) {
    return data => {
      modifyFn(data, websockets)
    }
  }
  function onWatchError(connectionName, connect) {
    return () => {
      // console.log(`${connectionName} closed`)
      connect()
    }
  }
})

app.use(morgan('dev'))

app.use(
  '/bundle.js',
  serveStatic(path.join(__dirname, '../', 'client/dist/bundle.js'))
)
app.ws('/cluster-data', ws => {
  clusterDataRoute(websockets, ws, kubeItems, log)
})
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'client/dist/index.html'))
})

app.use(function(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

httpsServer.listen(3000, () => {
  /* eslint-disable no-console */
  console.log('app listening on port 3000')
  /* eslint-enable no-console */
})
