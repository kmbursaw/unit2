//creates map and sets initial view and zoom level
var map = L.map('map').setView([51.505, -0.09], 13);

//openStreetMap tile layer from address and sets max zoom
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//Adds point marker to map
var marker = L.marker([51.5, -0.09]).addTo(map);

//adds cirlce to map, color red
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
//adds circle to map
}).addTo(map);

//adds polygon to map, triangle
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
//adds polygon to map
]).addTo(map);

//adds popup to the marker when clicked binding the popup to the point listed before the method
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

//adds popup to the circle when clicked binding the popup to the point listed before the method
circle.bindPopup("I am a circle.");

//adds popup to the ploygon when clicked binding the popup to the point listed before the method
polygon.bindPopup("I am a polygon.");

//standalone popup on map
var popup = L.popup()
    //sets the lat long of the popup
    .setLatLng([51.513, -0.09])
    //sets the content displayed in the popup
    .setContent("I am a standalone popup.")
    //sets the popup to open on the map itself, in this case when the map is initially opened
    .openOn(map);

//adds popup with lat long where the user clicked the mouse on the map
var popup = L.popup();

//when the map is clicked
function onMapClick(e) {
    popup
        //popup contains lat long of e
        .setLatLng(e.latlng)
        //content displayed is this string and the lat long of e added to the string as another string
        .setContent("You clicked the map at " + e.latlng.toString())
        //sets the popup to open on the map when clicked
        .openOn(map);
}

//lets the user click on the map for features
map.on('click', onMapClick);