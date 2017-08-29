import { mouseIsDown, tooltip } from './constants'

const showTooltip = (d, e) => {
  if (mouseIsDown) return
  tooltip.html(
    d.tooltip
      ? `<h2>${d.name}</h2>` +
        Object.keys(d.tooltip)
          .map(key => {
            return `<p><span>${key}:</span> ${d.tooltip[key]}</p>`
          })
          .join('')
      : d.name
  )
  tooltip.style('display', 'block')
}

export default showTooltip
