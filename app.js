import fetch from 'node-fetch';

let reducedFeatures = [];
fetch('./pleiades-places.csv').then(resp => resp.text()).then(response => {
  console.log(response);
  // latitude, longitude, geoContent
  response.forEach(item => {
    reducedFeatures.push({
      c : [parseFloat(item.longitude), parseFloat(item.latitude)],
      n : item.geoContext
    })
  })
  console.log(reducedFeatures);
})
