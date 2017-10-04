import { select } from 'd3'
import { setSize } from './svg'

const resize = () => {
  const chart = select('#chart')
  setSize(
    Number(chart.style('width').slice(0, -2)),
    Number(chart.style('height').slice(0, -2))
  )
}

export default resize
