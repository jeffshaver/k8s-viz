const getSvgDimensions = svg => {
  const height = +svg
    .style('height')
    .substring(0, svg.style('height').length - 2)
  const width = +svg.style('width').substring(0, svg.style('width').length - 2)

  return { height, width }
}

export default getSvgDimensions
