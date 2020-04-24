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
  console.log(geocodedRows) 
  const features = topojson.feature(us, us.objects.oakland)
  svg.append('path')
    .attr('d', path(features))
  
}



