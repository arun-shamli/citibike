const newYorkCoords = [40.73, -74.0059];
const mapZoomLevel = 12;
const infourl = "https://gbfs.citibikenyc.com/gbfs/en/station_information.json";
const statusurl = "https://gbfs.citibikenyc.com/gbfs/en/station_status.json";

/*****************************************************************/
d3.json(infourl).then((info) => {
  d3.json(statusurl).then((status) => createBikeMap(info, status));
});

/*****************************************************************/

function createBikeMap(info, status) {
  //create the map object
  let myMap = MapObject();

  //create the base layers.baselayers is a dictionary/Object
  let baseLayers = createBaseLayers();

  // creat the leged div and attached it to the map
  let legend = createLegend();
  legend.addTo(myMap);
  //   myMap.addControl(legend);

  let icons = createIcons();

  let layers = createLayerGroups();

  let overlayMaps = createOverlayMaps(layers);

  // create the control layers. pass the base layers and overlaymaps
  let controls = L.control.layers(baseLayers, overlayMaps, {
    collapsed: false,
    position: "topright",
  });

  // add the control to the map
  myMap.addControl(controls);
  //Add the default layer
  myMap.addLayer(baseLayers["Street Map"]);
  for (key in layers) {
    myMap.addLayer(layers[key]);
  }

  let updatedAt = info.last_updated;
  let stationStatus = status.data.stations;
  let stationInfo = info.data.stations;

  //stationcount is used to keep the count for each type of station
  let stationCount = {
    COMING_SOON: 0,
    EMPTY: 0,
    LOW: 0,
    NORMAL: 0,
    OUT_OF_ORDER: 0,
  };

  for (var index = 0; index < stationStatus.length; index++) {
    if (index > 60) break;

    let station = { ...stationInfo[index], ...stationStatus[index] };
    let statuscode = getStationStatus(station);
    stationCount[statuscode]++;
    // Create a new marker with the appropriate icon and coordinates
    let newMarker = createMarker(station, statuscode, icons);
    // Add the new marker to the appropriate layer
    newMarker.addTo(layers[statuscode]);
    // layers[stationStatus].addLayer(newMarker);
  }
  // Call the updateLegend function, which will... update the legend!
  updateLegend(updatedAt, stationCount);
}

/*****************************************************************/
function getStationStatus(station) {
  if (!station.is_installed) {
    stationStatusCode = "COMING_SOON";
  }
  // If a station has no bikes available, it's empty
  else if (!station.num_bikes_available) {
    stationStatusCode = "EMPTY";
  }
  // If a station is installed but isn't renting, it's out of order
  else if (station.is_installed && !station.is_renting) {
    stationStatusCode = "OUT_OF_ORDER";
  }
  // If a station has less than 5 bikes, it's status is low
  else if (station.num_bikes_available < 5) {
    stationStatusCode = "LOW";
  }
  // Otherwise the station is normal
  else {
    stationStatusCode = "NORMAL";
  }
  return stationStatusCode;
}

/*****************************************************************/
function createMarker(station, stationStatus, icons) {
  let marker = L.marker([station.lat, station.lon], {
    icon: icons[stationStatus],
  });
  // Bind a popup to the marker that will  display on click. This will be rendered as HTML
  let popuptext =
    station.name +
    "<br> Capacity: " +
    station.capacity +
    "<br>" +
    station.num_bikes_available +
    " Bikes Available";

  marker.bindPopup(popuptext);
  return marker;
}
// Create the tile layer that will be the background of our map
function createBaseLayers() {
  var lightmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY,
    }
  );

  var streetmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "streets-v11",
      accessToken: API_KEY,
    }
  );

  var satellite_streets = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "satellite-streets-v11",
      accessToken: API_KEY,
    }
  );
  var baseMaps = {
    "Light Map": lightmap,
    "Street Map": streetmap,
    "Satellite Street Map": satellite_streets,
  };
  return baseMaps;
}

/*****************************************************************/
function createIcons() {
  // Initialize an object containing icons for each layer group
  let icons = {
    COMING_SOON: L.ExtraMarkers.icon({
      icon: "ion-settings",
      iconColor: "white",
      markerColor: "yellow",
      shape: "star",
    }),
    EMPTY: L.ExtraMarkers.icon({
      icon: "ion-android-bicycle",
      iconColor: "white",
      markerColor: "red",
      shape: "circle",
    }),
    OUT_OF_ORDER: L.ExtraMarkers.icon({
      icon: "ion-minus-circled",
      iconColor: "white",
      markerColor: "blue-dark",
      shape: "penta",
    }),
    LOW: L.ExtraMarkers.icon({
      icon: "ion-android-bicycle",
      iconColor: "white",
      markerColor: "orange",
      shape: "circle",
    }),
    NORMAL: L.ExtraMarkers.icon({
      icon: "ion-android-bicycle",
      iconColor: "white",
      markerColor: "green",
      shape: "circle",
    }),
  };
  return icons;
}

/*****************************************************************/

function MapObject() {
  let map = L.map("map-id", {
    center: newYorkCoords,
    zoom: mapZoomLevel,
  });
  return map;
}

/*****************************************************************/
function createLegend() {
  let info = L.control({
    position: "bottomright",
  });
  // When the layer control is added, insert a div with the class of "legend"
  info.onAdd = function () {
    let div = L.DomUtil.create("div", "legend");
    return div;
  };
  return info;
}

/*****************************************************************/
function createLayerGroups() {
  // Initialize all of the LayerGroups we'll be using
  let layers = {
    COMING_SOON: new L.LayerGroup(),
    EMPTY: new L.LayerGroup(),
    LOW: new L.LayerGroup(),
    NORMAL: new L.LayerGroup(),
    OUT_OF_ORDER: new L.LayerGroup(),
  };
  return layers;
}

/*****************************************************************/

function createOverlayMaps(layers) {
  let overlays = {
    "Coming Soon": layers.COMING_SOON,
    "Empty Stations": layers.EMPTY,
    "Low Stations": layers.LOW,
    "Healthy Stations": layers.NORMAL,
    "Out of Order": layers.OUT_OF_ORDER,
  };
  return overlays;
}

/*****************************************************************/

function updateLegend(time, stationCount) {
  let legend = d3.select(".legend");
  const htmlInfo = `<p>Updated:  ${moment.unix(time).format("h:mm:ss A")} </p>
      <p class='out-of-order'>Out of Order Stations: 
        ${stationCount.OUT_OF_ORDER} </p>
      <p class='coming-soon'>Stations Coming Soon: 
        ${stationCount.COMING_SOON} </p>
      <p class='empty'>Empty Stations: ${stationCount.EMPTY}  </p>
      <p class='low'>Low Stations: ${stationCount.LOW} </p>
      <p class='healthy'>Healthy Stations:  ${stationCount.NORMAL} </p>`;

  legend.html(htmlInfo);
}

/*****************************************************************/
