import { mouseIsDown, tooltip } from './constants'

const showTooltip = (d, e) => {
  if (mouseIsDown) return
  tooltip.select('.name').html(
    d.tooltip
      ? Object.keys(d.tooltip)
          .map(key => {
            return `<span style="font-weight: 400">${key}:</span> ${d.tooltip[
              key
            ]}`
          })
          .join('<br>')
      : d.name
  )
  tooltip.style('display', 'block')
}

export default showTooltip
