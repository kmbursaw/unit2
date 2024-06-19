/* JavaScript sheet by Kevin M Bursaw, 2024 */
/* Map of GeoJSON data from airport.geojson */
//declare map var and minValue in global scope
var map;
var minValue;

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

//calculates the min value
function calculateMinValue(data){
    var allValues = [];

    //iterates through the geojson file and looks for airports and the year and then adds the values to the array
    for(var airport of data.features){
        for(var year = 2013; year <= 2022; year ++){
            var value = airport.properties[year.toString()];
            allValues.push(value);
        }
    }

    //stores all minimum values in the variable minValue and returns it outside the function
    var minValue = Math.min(...allValues)
    return minValue;
}

//calculates the radius of the proportional symbol, in this case a circle
function calcPropRadius(attValue){
    var minRadius = 5;
    //Flannery scaling ratio equation
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
    //returns radius from function
    return radius;
};



//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "2022";
  
    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>City:</b> " + feature.properties.Airport + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map){
    console.log(data)
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};





/*
//creates proportional symbols of the data
function createPropSymbols(data){
    var attribute = "2022";

    //create marker options
    var geojsonMarkerOptions = {
        fillColor: "#ff7800",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        radius: 8
    };

    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            //determine value for the selected attribute of each feature
            var attValue = Number(feature.properties[attribute]);

            //give each feature's circle marker a radius based on its attribute value by calling the calculate Prop Radius function
            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    //adds proportional circle markers to map
    }).addTo(map);
};
*/

function getData(){
    //load the data
    fetch("data/airport.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //calculate minimum data value
            minValue = calculateMinValue(json);
            console.log(minValue)
            //call function to create proportional symbols
            pointToLayer(json);
        })
};


document.addEventListener('DOMContentLoaded',createMap)


/*
//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "2022";

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>Airport:</b> " + feature.properties.Airport + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};


//Step 2: Import GeoJSON data
function getData(){
    //load the data
    fetch("data/airport.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json);
        })
};

document.addEventListener('DOMContentLoaded',createMap)
*/

/*
//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "2022";

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string starting with city...Example 2.1 line 24
    var popupContent = "<p><b>Airport:</b> " + feature.properties.airportName + "</p>";

    //add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>P in " + year + ":</b> " + feature.properties[attribute] + " million</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};

*/

















/*
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
*/