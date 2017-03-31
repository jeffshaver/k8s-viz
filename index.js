import './src/fetch-data'
// import fetchData from './src/fetch-data'
import * as d3 from 'd3'

window.d3 = d3

// const recursiveFetchData = () => {
//   return fetchData()
//     .then(() => {
//       setTimeout(recursiveFetchData, 2000)
//     })
// }
//
// recursiveFetchData()

// setTimeout(() => {
//   nodes.push({"id":"mp_mp-app-5_mp-app-5-rrrrr","name":"mp-app-5-rrrrr","group":11,"status":"terminating","tooltip":{"Type":"pod","Name":"mp-app-5-rrrrr","Namespace":"mp","Deployment":"mp-app-5","Status":"terminating"}})
//   links.push({"source":"mp_mp-app-5","target":"mp_mp-app-5_mp-app-5-rrrrr","value":1})
//   render()
// }, 5000)