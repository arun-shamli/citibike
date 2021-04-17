const url = "https://gbfs.citibikenyc.com/gbfs/en/station_information.json";

d3.json(url).then(createMarkers);

function createMarkers(response) {
  // Pull the "stations" property off of response.data
  var stations = response.data.stations;

  // Initialize an array to hold bike markers
  var bikeMarkers = [];
  stations.forEach((station) => {
    let bikeMarker = L.marker([station.lat, station.lon]);
    let status = `<h3>  ${station.name} <h3><h3> Capacity: ${station.capacity} <h3>`;
    bikeMarker.bindPopup(status);
    // Add the marker to the bikeMarkers array
    bikeMarkers.push(bikeMarker);
  });

  // Create a layer group made from the bike markers array, pass it into the createMap function
  createMap(L.layerGroup(bikeMarkers));
}

function createMap(bikeStations) {
  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox.light",
      accessToken: API_KEY,
    }
  );

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap,
  };

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Bike Stations": bikeStations,
  };

  // Create the map object with options
  var map = L.map("map-id", {
    center: [40.73, -74.0059],
    zoom: 12,
    layers: [lightmap, bikeStations],
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(map);
}
