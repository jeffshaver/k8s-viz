require('dotenv').config({path: '../.env', silent: true})

const path = require('path')
const express = require('express')
const compression = require('compression')
const serveStatic = require('serve-static')
const k8s = require('k8s')

const namespacesRoute = require('./routes/namespaces')
const modifyOnWatch = require('./modify-on-watch')

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

require('express-ws')(app)

app.use(compression())

// actual code

const websockets = []
const namespaces = []
const deployments = []
const pods = []

app.use('/bundle.js', serveStatic(path.join(__dirname, '../', 'dist/bundle.js')))
app.ws('/namespaces', (ws) => {
  namespacesRoute(websockets, ws, namespaces, deployments, pods)
})
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'dist/index.html'))
})

const modifyNamespaces = modifyOnWatch(namespaces)
const modifyDeployments = modifyOnWatch(deployments)
const modifyPods = modifyOnWatch(pods)

kubeApi.watch('watch/namespaces', (data) => {
  modifyNamespaces(data, websockets, namespaces, deployments, pods)
}, (err) => {
  console.log(err)
})

kubeApi.watch('watch/replicationcontrollers', (data) => {
  modifyDeployments(data, websockets, namespaces, deployments, pods)
}, (err) => {
  console.log(err)
})

kubeApi.watch('watch/pods', (data) => {
  modifyPods(data, websockets, namespaces, deployments, pods)
}, (err) => {
  console.log(err)
})

app.listen(3000, () => {
  console.log('app listening on port 3000')
})