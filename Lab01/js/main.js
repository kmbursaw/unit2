//Created by Kevin M Bursaw for GEOG 575 at Unversity of Wisconsin-Madison

// declare certain variables globally so all functions have access
var map;
var minValue;
var attributes;
var medium_airports = L.layerGroup();
var layerControl;
var dataStats = {};


// custom icon for medium airports. Icon from Google.
var custom_medium_airport = L.icon({
    iconUrl: 'img/flight.svg',
    iconSize: [20, 20],
})


// create map
function createMap(){

    // two different map options
    var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });

    var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });
    
    
    // create the map
    map = L.map('map', {
        center: [41.50, -110.35],
        zoom: 3,
        layers: [Stadia_AlidadeSmoothDark]
    });
    
    
    // sets basemap options for user to choose from
    var baseMaps = {
        "Smooth Dark": Stadia_AlidadeSmoothDark,
        "Dark Matter": CartoDB_DarkMatter
    };

    // sets overlay options for user to choose from
    var overlayMaps = {
        "Medium Airports": medium_airports
    };

    // adds starting base tileset to map
    Stadia_AlidadeSmoothDark.addTo(map);

    // adds addtional base tilesets and overlays to map
    layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);


    // call getData function
    getData(map);
    getOtherData(map);
};



// Function to create markers for medium airports
function createMarkers(data) {
    // Clear existing markers if any
    medium_airports.clearLayers();

    // Loop through each feature in the GeoJSON data
    data.features.forEach(function(feature) {
        // Extract latitude and longitude from geometry
        var lat = feature.geometry.coordinates[1];
        var lng = feature.geometry.coordinates[0];

        // Create marker with custom icon and popup content of medium airport name
        var marker = L.marker([lat, lng], { icon: custom_medium_airport })
            .bindPopup(feature.properties["Airports (medium)"]);

        // Add marker to layer group
        medium_airports.addLayer(marker);
    });

    // Update layer control after adding markers
    updateLayerControl();
}



// Function to update the layer control with medium airports layer
function updateLayerControl() {
    // Add medium airports layer to overlay maps
    var overlayMaps = {
        "Medium Airports": medium_airports
    };
}


// calculate minimum values of each property. Changed from calculateMinValue
function calcStats(data){
    // create empty array to store all data values
    var attributes = []; 
    // loop through years to gather passenger properties and store in variable yearValues. Also checks if NaN.
    for (var year = 2013; year <= 2022; year++) {
        var yearValues = [];
        for (var airport of data.features) {
            var value = airport.properties["Pax_" + year];
            if (!isNaN(value)) {
                yearValues.push(value);
            }
        }
        // Caclulates the max, mean, and min values per year and pushes them to the array
        dataStats["Pax_" + year] = {
            min: Math.min(...yearValues),
            max: Math.max(...yearValues),
            mean: yearValues.reduce((a, b) => a + b, 0) / yearValues.length 
        };
        attributes.push("Pax_" + year);
    }
    // return the array of attributes
    return attributes;
}


// calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    // constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    // Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    // returns radius from function
    return radius;
};


function createPopupContent(properties, attribute){
    // add airport to popup content string
    var popupContent = "<p><b>Airport:</b> " + properties.Airport + "</p>";

    // add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    // formats popup content
    popupContent += "<p><b>" + year + ":</b> " + properties[attribute] + " Passengers</p>";

    // returns popupContent
    return popupContent;
};





// function to convert markers to circle markers
function pointToLayer(feature, latlng){ //attributes removed
    // Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

    // create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    // For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    // Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    // create circle marker layer
    var layer = L.circleMarker(latlng, options);

    // build popup content string
    var popupContent = createPopupContent(feature.properties, attribute);

    // bind the popup to the circle marker
    layer.bindPopup(popupContent, {  offset: new L.Point(0,-options.radius)    });

    // return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

// Add circle markers for point features to the map
function createPropSymbols(data){ //attributes removed
    // create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};



// Create new sequence controls
function createSequenceControls(attributes){   
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            // forward and reverse buttons and their symbols
            // Left arrow from the Noun Project. Created By: Rainbow Designs
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/left_arrow.png"></button>'); 


            // create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range" min="0" max="9">')

            // forward and reverse buttons and their symbols
            // Right arrow from the Noun Project. Created By: Rainbow Designs
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/right_arrow.png"></button>');

            // disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);


            return container;
        }
    });

    map.addControl(new SequenceControl());    
    // add listeners after adding control
    // click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            // increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                // if past the last attribute, wrap around to first attribute
                index = index > 9 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                // if past the first attribute, wrap around to last attribute
                index = index < 0 ? 9 : index;
            };

            // updates slider bar
            document.querySelector('.range-slider').value = index;

            // pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })
    });

    // input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        // get the new index value
        var index = this.value;

        // pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
}

// creates dynamic map legend
function createLegend(attributes){
    // creates legend container and positions it on bottom right of page
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        // when legend added, creates features in the legend and dynamically updates when the slider is clicked
        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');


            // creates containter for temporal legend
            container.innerHTML = '<p class="temporalLegend">Passengers in <span class="year">2013</span></p>'

            // start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="115" height="115">';

            // array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            // loop to add each circle and text to svg string
            for (var i=0; i<circles.length; i++){
                
                // assign the r and cy attributes  
                var radius = calcPropRadius(dataStats[attributes[0]][circles[i]]);  
                var cy = 59 - radius;  
                
                // circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';
            
                // evenly space out labels            
                var textY = i * 20 + 20;     
                
                let numberInMillions = dataStats[attributes[0]][circles[i]] / 1e6;

                let formattedNumber = numberInMillions.toFixed(2);

                // text string            
                svg += '<text id="' + circles[i] + '-text" x="57" y="' + textY + '">' + formattedNumber + " mil" + '</text>';
            
            };


            // close svg string
            svg += "</svg>";

            // add attribute legend svg to container
            container.insertAdjacentHTML('beforeend',svg);

            // disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });
    // adds legend control to map
    map.addControl(new LegendControl());
};


// function to update the legend with the temporal change induced by the temporal slider
function updateLegend(attribute) {
    document.querySelector(".temporalLegend .year").innerHTML = attribute.split("_")[1];

    // Access year-specific dataStats
    var yearStats = dataStats[attribute]; 


    // Update circle sizes and text
    var circles = ["max", "mean", "min"];
    for (var i = 0; i < circles.length; i++) {
        var radius = calcPropRadius(yearStats[circles[i]]); // Use yearStats
        document.getElementById(circles[i]).setAttribute("r", radius);
        document.getElementById(circles[i]).setAttribute("cy", 59 - radius);

        let numberInMillions = yearStats[circles[i]] / 1e6; // Use yearStats
        let formattedNumber = numberInMillions.toFixed(2);
        document.getElementById(circles[i] + "-text").textContent = formattedNumber + " mil";
    }
}


// builds an attributes array from the json data. renames json variable as data for this function
function processData(data){
    // empty array to hold attributes
    var attributes = [];

    // properties of the first feature in the dataset
    var properties = data.features[0].properties;

    // push each attribute name into attributes array
    for (var attribute in properties){
        // only take attributes with passenger(Pax) values
        if (attribute.indexOf("Pax") > -1){
            attributes.push(attribute);
        };
    };
    // returns attribues
    return attributes;
};





// resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    var year = attribute.split("_")[1];
        // update temporal legend
        document.querySelector("span.year").innerHTML = year;
    map.eachLayer(function(layer){
        // checks to see if attribute exists
        if (layer.feature && layer.feature.properties[attribute]){
            // access feature properties
            var props = layer.feature.properties;

            // update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            // add city to popup content string
            var popupContent = createPopupContent(props, attribute);    

            // update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent).update();
        };
    });
    // Update the legend with the new attribute values
    updateLegend(attribute);  
};




// Import GeoJSON data
function getData(){
    // load the data
    fetch("data/airport.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            // fill attributes variable with array from json file
            attributes = calcStats(json); //var removed
            // calculate minimum data value
            minValue = dataStats[attributes[0]].min;

            // Determine initial year index (assuming attributes are sorted by year)
            var initialYearIndex = attributes.findIndex(function(attr) {
                return attr.endsWith('_2013'); // Adjust logic based on your attribute naming convention
            });

            // call function to create proportional symbols
            createPropSymbols(json, attributes);
            // creates the sequencing buttons and slider
            createSequenceControls(attributes);
            // creates legend
            createLegend(attributes);
            // Set initial value of range slider
            document.querySelector('.range-slider').value = initialYearIndex;
            
            // Update proportional symbols based on initial attribute
            updatePropSymbols(attributes[initialYearIndex]);
        })
};


// gets the medium airports GeoJSON data
function getOtherData(){
    // load the data
    fetch("data/medium_airportsv2.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //creates markers from medium airports data
            createMarkers(json);


        })
}


document.addEventListener('DOMContentLoaded',createMap)