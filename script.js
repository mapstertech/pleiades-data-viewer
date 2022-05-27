
  const minDate = -2000;
  const maxDate = 1500;
  let currentSelected = false;

  /* Making mini file */
  // /*
  // let reducedFeatures = [];
  // fetch('./files/pleiades-places.csv').then(resp => resp.text()).then(response => {
  //   console.log(response);
  //   csv({ output: "json"}).fromString(response).then(function(result){
  //    console.log(result)
  //    // latitude, longitude, geoContent
  //    result.forEach(item => {
  //      if(item.geoContext !== "" && item.longitude !== "" && item.latitude !== "") {
  //        if(!reducedFeatures.find(feature => feature.n === item.title)) {
  //          reducedFeatures.push({
  //            c : [parseFloat(item.longitude), parseFloat(item.latitude)],
  //            n : item.title
  //          })
  //        }
  //      }
  //    })
  //    console.log(reducedFeatures);
  //   })
  // })
  // */

  let miniLocationsFile = false;
  fetch('./files/pleiades-min-locations.json').then(resp => resp.json()).then(response => {
    miniLocationsFile = response;
  })

  const placetypeValues = [ "abbey", "abbey-church", "acropolis", "agora", "plaza", "amphitheatre", "anchorage", "aqueduct", "arch", "archaeological-site", "archipelago", "architecturalcomplex", "basilica", "bath", "bay", "bridge", "building", "cairn", "canal", "cape", "cascade", "cemetery", "rapid", "causeway", "cave", "centuriation", "ceramicproduction", "church-2", "church", "circus", "cistern", "citadel", "city-block", "city-center", "coast", "coastal-change", "cultural-landscape", "dam", "delta", "deme-attic", "desert", "diocese-roman", "district", "earthwork", "ekklesiasterion", "escarpment", "estate", "estuary", "false", "findspot", "forest", "fort-2", "fort-group", "fort", "fortlet", "forum", "fountain", "frontier-system-limes", "garden-hortus", "city-gate", "gateway", "grove", "gymnasium", "hill", "hillfort", "hunting-base", "island", "isthmus", "lagoon", "lake", "league", "lighthouse", "marsh-wetland", "milestone", "military-installation-or-camp-temporary", "mine-2", "mine", "monastery", "monument", "mosque", "mountain", "nome-gr", "nuraghe", "oasis", "odeon", "palace", "palace-complex", "palaistra", "pass", "peninsula", "people", "piscina-roman", "plain", "plateau", "port", "postern", "production", "province-2", "province", "pyramid", "quarry", "regio-augusti", "region", "reservoir", "mouth", "river", "road", "room", "ruin", "salt-pan-salina", "salt-marsh", "sanctuary", "satrapy", "settlement", "fortified-settlement", "settlement-modern", "shrine", "space-interior", "space-uncovered", "spring", "stadion", "state", "station", "stoa", "street", "synagogue", "taberna-shop", "tell", "temple-2", "temple", "theatre", "tomb", "tower-defensive", "tower-single", "tower-wall", "townhouse", "treasury", "tribus", "tumulus", "tunnel", "undefined", "underground-structures", "unknown", "unlocated", "urban", "valley", "vicus", "villa", "volcano", "wall-2", "defensive-wall", "city-wall", "wall", "water-inland", "water-feature", "wheel", "water-open", "well", "whirlpool", "ziggurat" ];

	mapboxgl.accessToken = 'pk.eyJ1IjoibWFwc3RlcnRlY2giLCJhIjoiY2poaHk1aDg0MDI0NzMwbnl5OGl0eGg3ZCJ9.fPIgJrmVEyN8Hdvk2EDvXA';
  const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapstertech/cl3iscp8k001815pnnpg6usjr', // style URL
      center: [16.6813799860, 42.7247182], // starting position [lng, lat]
      zoom: 3.02284 // starting zoom
  });

  map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');

  // Geocoder setup
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    placeholder : "Search for an ancient or modern location...",
    localGeocoder : (query) => {
      let matches = [];
      miniLocationsFile.forEach(location => {
        if(location.n && (location.n.toLowerCase().indexOf(query.toLowerCase()) > -1 || query === ' ')) {
          var match = {
            type : "Feature",
            id : Math.random() * 1000000,
            place_name : location.n,
            center : location.c
          };
          // if(feature.geometry.type !== 'Point') {
          //   match['bbox'] = turf.bbox(feature);
          // }
          matches.push(match)
        }
      })
      console.log(matches)
      matches.sort((a, b) => a.place_name > b.place_name ? 1 : -1)
      return matches;
    }
  })
  document.getElementById('autocomplete').appendChild(geocoder.onAdd(map));

  // $('#category-panel').height(window.innerHeight - 120);
  placetypeValues.forEach(placetype => {
    $('#placetypes .accordion-body').append(`
      <div><input type="checkbox" checked="checked" value="${placetype}"> ${placetype.replace('-', ' ')}</div>
    `)
  })

  $(document).on('click', '#select-all-placetypes', () => {
    $('#placetypes .accordion-body input').each(function() {
      $(this).prop('checked', true);
    });
    let checkedExpression = [
      'any'
    ];
    $('#placetypes .accordion-body input').each(function() {
      if($(this).is(':checked')) {
        checkedExpression.push(['in', $(this).val(), ['get', 'featureTypes']])
      }
    })
    map.setFilter('pleiades_places', checkedExpression)
  });

  $(document).on('click', '#select-none-placetypes', () => {
    $('#placetypes .accordion-body input').each(function() {
      $(this).prop('checked', false);
    });
    let checkedExpression = ['all', ['in', 'whatever', ['get', 'featureType']]];
    map.setFilter('pleiades_places', checkedExpression)
  });

  $(document).on('change', '#placetypes .accordion-body input', function(e) {
    let checkedExpression = [
      'any'
    ];
    $('#placetypes .accordion-body input').each(function() {
      if($(this).is(':checked')) {
        checkedExpression.push(['in', $(this).val(), ['get', 'featureTypes']])
      }
    })
    map.setFilter('pleiades_places', checkedExpression)
  })

  const popup = new mapboxgl.Popup({ closeButton : false })

  map.on('load', () => {

    const images = ['bridge', 'building', 'cemetery', 'cross', 'ferry', 'monument', 'religious-christian', 'religious-muslim'];
    images.forEach(imageUrl => {
      let img = new Image(20,20)
      img.onload = () => {
        if(!map.hasImage(img.propertyName)) {
          map.addImage(img.propertyName, img)
        }
      }
      img.propertyName = imageUrl;
      img.src = `./img/${imageUrl}.svg`;
    })

    map.addSource('pleiades_places', {
      type : 'vector',
      url : 'mapbox://mapstertech.pleiades_places'
    });

    // district, settlement, settlement (fortified), settlement-modern, estate, villa, port, water
    // province, state (polity), temple, tomb, "urban area", "province, diocese, nome", regio, region,

    map.addLayer({
      'id' : 'pleiades_places_symbols',
      'type' : 'symbol',
      'source' : 'pleiades_places',
      'source-layer' : 'pleiades_places',
      'layout' : {
        'icon-image' : [
          'case',
          ['in', 'settlement', ['get', 'featureTypes']],
          "dot-11",
          ['in', 'forest', ['get', 'featureTypes']],
          "park",
          ['in', 'hill', ['get', 'featureTypes']],
          "mountain",
          ['in', 'mountain', ['get', 'featureTypes']],
          "mountain",
          ['in', 'bridge', ['get', 'featureTypes']],
          "bridge",
          ['in', 'building', ['get', 'featureTypes']],
          "building",
          ['in', 'tomb', ['get', 'featureTypes']],
          "cemetery",
          ['in', 'port', ['get', 'featureTypes']],
          "ferry",
          ['in', 'monument', ['get', 'featureTypes']],
          "monument",
          ['in', 'church', ['get', 'featureTypes']],
          "religious-christian",
          ['in', 'abbey', ['get', 'featureTypes']],
          "religious-christian",
          ['in', 'monastery', ['get', 'featureTypes']],
          "religious-christian",
          ['in', 'mosque', ['get', 'featureTypes']],
          "religious-muslim",
          "dot-11"
        ],
        'icon-allow-overlap' : true,
        'icon-ignore-placement' : true,
      },
      'paint' : {
        'icon-opacity' :[
          'case',
          ['in', 'settlement', ['get', 'featureTypes']],
          0.3,
          ['in', 'forest', ['get', 'featureTypes']],
          0.6,
          ['in', 'hill', ['get', 'featureTypes']],
          0.6,
          ['in', 'mountain', ['get', 'featureTypes']],
          0.6,
          0.3
        ],
        'icon-color' : [
          'case',
          ['in', 'settlement', ['get', 'featureTypes']],
          "#FFFFFF",
          ['in', 'forest', ['get', 'featureTypes']],
          "#007500",
          ['in', 'hill', ['get', 'featureTypes']],
          "#7B3F00",
          ['in', 'mountain', ['get', 'featureTypes']],
          "#7B3F00",
          "#FFFFFF"
        ],
      },
    //   'filter' : [
    //     'any',
    //     ['in', 'settlement', ['get', 'featureTypes']],
    //     ['in', 'forest', ['get', 'featureTypes']],
    //     ['in', 'hill', ['get', 'featureTypes']],
    //     ['in', 'mountain', ['get', 'featureTypes']]
    //   ]
    })

    map.addLayer({
      'id' : 'pleiades_places_areas',
      'type' : 'symbol',
      'source' : 'pleiades_places',
      'source-layer' : 'pleiades_places',
      'layout' : {
        'text-field' : ['get', 'title'],
        'text-offset' : [0, 1],
        'text-font' : ["DIN Pro Medium", "Arial Unicode MS Regular"],
        'text-padding' : 10,
        'text-size' : [
          'case',
          ['in', 'state', ['get', 'featureTypes']],
          17,
          ['in', 'province', ['get', 'featureTypes']],
          17,
          ['in', 'regio', ['get', 'featureTypes']],
          17,
          ['in', 'district', ['get', 'featureTypes']],
          14,
          14
        ]
      },
      'paint' : {
        'text-halo-color' : '#FFF',
        'text-halo-blur' : 1,
        'text-halo-width' : 2,
        'text-color' : [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          "#1870d5",
          "#000000"
        ]
      },
      'filter' : [
        'any',
        ['in', 'state', ['get', 'featureTypes']],
        ['in', 'regio', ['get', 'featureTypes']],
        ['in', 'district', ['get', 'featureTypes']],
        ['in', 'province', ['get', 'featureTypes']],
      ]
    })

    map.addLayer({
      'id' : 'pleiades_places',
      'type' : 'symbol',
      'source' : 'pleiades_places',
      'source-layer' : 'pleiades_places',
      'layout' : {
        'text-field' : ['get', 'title'],
        'text-offset' : [0, 1],
        'text-padding' : 10,
        'text-size' : [
          'case',
          ['in', 'settlement', ['get', 'featureTypes']],
          13,
          ['in', 'estate', ['get', 'featureTypes']],
          11,
          ['in', 'villa', ['get', 'featureTypes']],
          11,
          10
        ]
      },
      'paint' : {
        'text-halo-color' : '#FFF',
        'text-halo-blur' : 1,
        'text-halo-width' : 2,
        'text-color' : [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          "#1870d5",
          "#000000"
        ]
      },
      'filter' : [
        'any',
        ['in', 'settlement', ['get', 'featureTypes']],
        ['in', 'estate', ['get', 'featureTypes']],
        ['in', 'villa', ['get', 'featureTypes']],
      ]
    }, 'pleiades_places_areas');

    map.addLayer({
      'id' : 'pleiades_places_other',
      'type' : 'symbol',
      'source' : 'pleiades_places',
      'source-layer' : 'pleiades_places',
      'layout' : {
        'text-field' : ['get', 'title'],
        'text-offset' : [0, 1],
        'text-padding' : 10,
        'text-size' : 10
      },
      'paint' : {
        'text-halo-color' : '#FFF',
        'text-halo-blur' : 1,
        'text-halo-width' : 2,
        'text-color' : [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          "#1870d5",
          "#000000"
        ]
      },
      'filter' : [
        'all',
        ['!', ['in', 'settlement', ['get', 'featureTypes']]],
        ['!', ['in', 'estate', ['get', 'featureTypes']]],
        ['!', ['in', 'villa', ['get', 'featureTypes']]],
        ['!', ['in', 'forest', ['get', 'featureTypes']]],
        ['!', ['in', 'hill', ['get', 'featureTypes']]],
        ['!', ['in', 'mountain', ['get', 'featureTypes']]],
        ['!', ['in', 'state', ['get', 'featureTypes']]],
        ['!', ['in', 'regio', ['get', 'featureTypes']]],
        ['!', ['in', 'district', ['get', 'featureTypes']]],
        ['!', ['in', 'province', ['get', 'featureTypes']]],
      ]
    }, 'pleiades_places_areas');

    map.addLayer({
      'id' : 'pleiades_places_nature',
      'type' : 'symbol',
      'source' : 'pleiades_places',
      'source-layer' : 'pleiades_places',
      'layout' : {
        'text-field' : ['get', 'title'],
        'text-offset' : [0, 1],
        'text-padding' : 10,
        'text-size' : [
          'case',
          ['in', 'forest', ['get', 'featureTypes']],
          10,
          ['in', 'hill', ['get', 'featureTypes']],
          10,
          ['in', 'mountain', ['get', 'featureTypes']],
          10,
          10
        ]
      },
      'paint' : {
        'text-halo-color' : '#FFF',
        'text-halo-blur' : 1,
        'text-halo-width' : 2,
        'text-color' : [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          "#1870d5",
          "#000000"
        ]
      },
      'filter' : [
        'any',
        ['in', 'forest', ['get', 'featureTypes']],
        ['in', 'hill', ['get', 'featureTypes']],
        ['in', 'mountain', ['get', 'featureTypes']]
      ]
    }, 'pleiades_places')

    let hoveredStateId = null;

    map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers : ['pleiades_places_areas', 'pleiades_places_other', 'pleiades_places', 'pleiades_places_nature'] });
      if(features.length >  0) {
        map.getCanvas().style.cursor = 'pointer';

        if (hoveredStateId !== null) {
          map.setFeatureState(
            { source: 'pleiades_places', sourceLayer : 'pleiades_places', id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = features[0].id;
        map.setFeatureState(
          { source: 'pleiades_places', sourceLayer : 'pleiades_places', id: hoveredStateId },
          { hover: true }
        );

        const extent = JSON.parse(features[0].properties.extent);
        let newGeoJSON = { type : "FeatureCollection", features : [{
          type : "Feature",
          properties : {},
          geometry : extent
        }]}
        if(map.getSource('temp-poly')) {
          map.getSource('temp-poly').setData(newGeoJSON);
        } else {
          map.addSource('temp-poly', {
            type : 'geojson',
            data : newGeoJSON
          })
          map.addLayer({
            id : "temp-poly",
            source : 'temp-poly',
            type : 'fill',
            paint : {
              'fill-opacity' : 0.1,
              'fill-color' : '#eeeeee'
            }
          })
          map.addLayer({
            id : "temp-line",
            source : 'temp-poly',
            type : 'line',
            paint : {
              'line-opacity' : 0.5,
              'line-color' : '#333',
              'line-width' : 0.5
            }
          })
        }

      } else {
        if (hoveredStateId !== null) {
          map.setFeatureState(
            { source: 'pleiades_places', sourceLayer : 'pleiades_places', id: hoveredStateId },
            { hover: false }
          );
        }
        if(map.getSource('temp-poly')) {
          map.getSource('temp-poly').setData({ type : "FeatureCollection", features : []});
        }
        map.getCanvas().style.cursor = '';
        hoveredStateId = null;
      }
    })

    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers : ['pleiades_places_areas', 'pleiades_places_other', 'pleiades_places', 'pleiades_places_nature'] });
      if(features.length >  0) {
        $('#more-info').fadeIn();
        currentSelected = features[0];
        for(let prop in currentSelected.properties) {
          if($(`#item-${prop}`).length) {
            if(currentSelected.properties[prop] && currentSelected.properties[prop] !== "") {
              $(`#item-${prop}`).html(currentSelected.properties[prop]);
              $(`#item-${prop}`).show();
            } else {
              $(`#item-${prop}`).hide();
            }
          }
        }
        $(`#item-link`).attr('href', `https://pleiades.stoa.org${currentSelected.properties.path}`);

        const extent = JSON.parse(currentSelected.properties.extent);
        const bbox = turf.bbox({ type : "Feature", properties : {}, geometry : extent });
        map.fitBounds(bbox, { padding: 20, maxZoom : 12 })
      }
    })

    $(document).on('click', '#modal-info', () => {
      $('.modal-title').text(currentSelected.properties.title);
      let html = "<table><thead><tr><th>Property</th><th>Value</th></thead><tbody>";
      for(let prop in currentSelected.properties) {
        html += `<tr><td>${prop}</td><td>${currentSelected.properties[prop]}</td></tr>`
      }
      html += "</tbody></table>";
      $('.modal-body').html(html);
    })

    $( function() {


      const expression = [
        "case",
        [
          "all",
          ["<=", ["to-number", ["get", "minDate"]], 0],
          [">=", ["to-number", ["get", "maxDate"]], 0]
        ],
        ['get', 'title'],
        ''
      ]
      const iconExpression = [
        "case",
        [
          "all",
          ["<=", ["to-number", ["get", "minDate"]], 0],
          [">=", ["to-number", ["get", "maxDate"]], 0]
        ],
        1,
        0
      ]
      map.setLayoutProperty('pleiades_places_symbols', 'icon-size', iconExpression)
      map.setLayoutProperty('pleiades_places_areas', 'text-field', expression)
      map.setLayoutProperty('pleiades_places', 'text-field', expression)
      map.setLayoutProperty('pleiades_places_nature', 'text-field', expression)
      map.setLayoutProperty('pleiades_places_other', 'text-field', expression)
      $( "#slider" ).slider({
        min: minDate,
        max: maxDate,
        value: 0,
        slide: function( event, ui ) {
          const expression = [
            "case",
            [
              "all",
              ["<=", ["to-number", ["get", "minDate"]], ui.value],
              [">=", ["to-number", ["get", "maxDate"]], ui.value]
            ],
            ['get', 'title'],
            ''
          ]
          const iconExpression = [
            "case",
            [
              "all",
              ["<=", ["to-number", ["get", "minDate"]], ui.value],
              [">=", ["to-number", ["get", "maxDate"]], ui.value]
            ],
            1,
            0
          ]
          map.setLayoutProperty('pleiades_places_symbols', 'icon-size', iconExpression)
          map.setLayoutProperty('pleiades_places_areas', 'text-field', expression)
          map.setLayoutProperty('pleiades_places', 'text-field', expression)
          map.setLayoutProperty('pleiades_places_nature', 'text-field', expression)
          map.setLayoutProperty('pleiades_places_other', 'text-field', expression)
          $( "#time" ).val( returnReadableDate(ui.value) );
        }
      });
    });

  })

  function returnReadableDate(year) {
    if(year < 0) {
      return Math.abs(year) + ' BCE';
    }
    if(year >= 0) {
      return Math.abs(year) + ' CE';
    }
  }

  // Dealing with "locations"
  // fetch('./pleiades-locations.csv').then(resp => resp.text()).then(response => {
  //   csv({ output: "json" })
  //   .fromString(response)
  //   .then(function(result){
  //     console.log(result);
  //     const featureCollection = {
  //       type : "FeatureCollection",
  //       features : result.filter(res => res.id !== 'batlas-location' && res.id !== 'undetermined' && res.geometry !== "").map(res => {
  //         let newProperties = JSON.parse(JSON.stringify(res));
  //         delete newProperties.geometry;
  //         // console.log(res);
  //         // console.log(JSON.parse(res.geometry))
  //         return {
  //           type : "Feature",
  //           properties : newProperties,
  //           geometry : JSON.parse(res.geometry)
  //         }
  //       })
  //     }
  //     let lineDelimitedJSON = featureCollection.features.map(feature => JSON.stringify(feature));
  //     lineDelimitedJSON = lineDelimitedJSON.join('\n')
  //     console.log(lineDelimitedJSON)
  //   })
  //   // console.log(response);
  // })

  // Dealing with Places
  // fetch('./raw-files/pleiades-places.csv').then(resp => resp.text()).then(response => {
  //   csv({ output: "json" })
  //   .fromString(response)
  //   .then(function(result){
  //     console.log(result);
  //     const featureCollection = {
  //       type : "FeatureCollection",
  //       features : result.filter(res => res.extent !== "").map(res => {
  //         let newProperties = JSON.parse(JSON.stringify(res));
  //         delete newProperties.geometry;
  //         console.log(res);
  //         let fixedExtent = res.extent.replace(/NaN/g, "0.0");
  //         console.log(JSON.parse(fixedExtent))
  //         return {
  //           type : "Feature",
  //           properties : newProperties,
  //           geometry : JSON.parse(fixedExtent)
  //           // geometry : {
  //           //   type : "Point",
  //           //   coordinates : [parseFloat(res.longitude), parseFloat(res.latitude)]
  //           // }
  //         }
  //       })
  //     }
  //     let lineDelimitedJSON = featureCollection.features.map(feature => JSON.stringify(feature));
  //     lineDelimitedJSON = lineDelimitedJSON.join('\n')
  //     console.log(lineDelimitedJSON)
  //   })
  //   // console.log(response);
  // })

  // Dealing with "places" (these are all LatLngs)
  // fetch('./pleiades-places-geojson.json').then(resp => resp.json()).then(response => {
  //
  //   let newGeoJSON = { type : "FeatureCollection", features : [] }
  //   response.features.forEach(feature => {
  //     let newFeature = JSON.parse(JSON.stringify(feature));
  //     newFeature.geometry = {
  //       type : "Point",
  //       properties :
  //     }
  //   })
  //
  // })
