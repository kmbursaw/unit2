/* JavaScript sheet by Kevin M Bursaw, 2024 */
/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [35.50, -110.35],
        zoom: 3
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};

//function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        popupContent += "<p>Airport: " + feature.properties["Airport"] + "</p>";
        popupContent += "<p>Rank (2022): " + feature.properties['Rank (2022)'] + "</p>";

        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            if (property !== "Airport" && property !== "Rank (2022)") {
                popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
            }
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    fetch("data/airport.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){            
            //create marker options and design
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#007700",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            //create a Leaflet GeoJSON layer and add it to the map of popups and circle markers
            L.geoJson(json, {
                onEachFeature: onEachFeature,
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            //adds popups and circlemarkers to map
            }).addTo(map);
        });       
};
//adds event listener to create map and features
document.addEventListener('DOMContentLoaded',createMap)
