const width = 860
const height = 750

const svg = d3.select('#root').append('svg')  
  .attr('width', width)
  .attr('height', height)
  .append('g')
  
const proj = d3.geoAlbers()
  .scale(200000)
  .rotate([122.2712, 0])
  .center([0, 37.8044])
  .translate([width/2, height/2])
  
const path = d3.geoPath(proj)

const tooltip = d3.select('body').append('div')

Promise.all([
  d3.json('data/oakland_topo.json'),
  d3.csv('data/oak_crime.csv', d => {
    const match = d.Location.trim().match(/\(([\d-.]+)°?, ([\d-.]+)°?\)$/) // e.g. [ "(37.834632°, -122.195153°)", "37.834632", "-122.195153" ]
    // console.log(`match: ${match}`)
    if (!match) {
      return d
    }
    const [latitude, longitude] = match.slice(1, 3).map(Number) // e.g. [ 37.834632, -122.195153 ]
    return {
      ...d,
      latitude,
      longitude
    }
  })
])
  .then(go)
  .catch(e => console.error(e))

function go ([us, data]) {
  // console.log(data[1])
  const geocodedRows = data.filter(d => ('latitude' in d) && ('longitude' in d))
  // console.log(geocodedRows) 
  
  const features = topojson.feature(us, us.objects.oakland)
  svg.append('path')
    .attr('d', path(features))

  const points = data.map(d => {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [d.longitude, d.latitude]
      },
      properties: d
    }
  })
  
  const crimeTypes = [...new Set(points.map(d => d.properties.CRIMETYPE))]
  const color = crimeType => (
    `hsl(${crimeTypes.indexOf(crimeType) / crimeTypes.length * 360}, 100%, 70%)`
  );

  svg.selectAll('circle')
    .data(points)
  .enter().append('circle')
    .attr('cx', d => path.centroid(d)[0])
    .attr('cy', d => path.centroid(d)[1])
    .attr('r', 2.5)
    .style('fill', d => color(d.properties.CRIMETYPE))
    .style('opacity', 0.5)
    .on('mouseover', mouseover)
    .on('mouseout', mouseout)
  
}

const mouseover = d => {
  tooltip
    .style('display', 'inline')
    .html(`crime type: ${d.properties.CRIMETYPE}`)
}

const mouseout = () => {
  tooltip
    .style('display', 'none')
}


