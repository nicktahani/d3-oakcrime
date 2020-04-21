const width = 860
const height = 750

const svg = d3.select('#crimeVis')  
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
  d3.csv('data/oak_crime.csv')
])
  .then(go)
  .catch(e => console.error(e))

function go ([us, data]) {
  const features = topojson.feature(us, us.objects.oakland)
  svg.append('path')
    .attr('d', path(features))
  console.log(features)
}



