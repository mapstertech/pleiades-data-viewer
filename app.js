import fetch from 'node-fetch';

fetch('./pleiades-places.csv').then(resp => resp.text()).then(response => {
  console.log(response);
})
