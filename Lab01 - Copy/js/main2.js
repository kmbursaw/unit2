//Created by Kevin M Bursaw for GEOG 575 at Unversity of Wisconsin-Madison

//declare map variable globally so all functions have access
var map;
var minValue;
var attributes;
var dataStats = {};

//step 1 create map
function createMap(){

    //create the map
    map = L.map('map', {
        center: [35.50, -110.35],
        zoom: 3
    });

    //add OSM base tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20

    }).addTo(map);

    //call getData function
    getData(map);
};

//calculate minimum values of each property. Changed from calculateMinValue
function calcStats(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var airport of data.features){
        //loop through each year
        for(var year = 2013; year <= 2022; year++){
              //get population for current year
              var value = airport.properties["Pax_"+ String(year)];
              //add value to array
              if (!isNaN(value))
                allValues.push(value);
        }
    }

    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);

    //calculate meanValue
    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;

    //get minimum value of our array
    var minValue = Math.min(...allValues)
    //returns minValue from function
    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    //returns radius from function
    return radius;
};


function createPopupContent(properties, attribute){
    //add airport to popup content string
    var popupContent = "<p><b>Airport:</b> " + properties.Airport + "</p>";

    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    //popupContent += "<p><b>Airport:</b> " + feature.properties.Airport + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + " Passengers" + "</p>";
    popupContent += "<p><b>" + year + ":</b> " + properties[attribute] + " Passengers</p>";

    return popupContent;
};





//function to convert markers to circle markers
function pointToLayer(feature, latlng){ //attributes removed
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

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
    var popupContent = createPopupContent(feature.properties, attribute);

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {  offset: new L.Point(0,-options.radius)    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data){ //attributes removed
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};



//Create new sequence controls
function createSequenceControls(attributes){   
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //forward and reverse buttons and their symbols
            //Left arrow from the Noun Project. Created By: Rainbow Designs
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/left_arrow.png"></button>'); 


            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range" min="0" max="9">')

            //forward and reverse buttons and their symbols
            //Right arrow from the Noun Project. Created By: Rainbow Designs
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/right_arrow.png"></button>');

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);


            return container;
        }
    });

    map.addControl(new SequenceControl());    
    // add listeners after adding control
    //Step 5: click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            //increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //if past the last attribute, wrap around to first attribute
                index = index > 9 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //if past the first attribute, wrap around to last attribute
                index = index < 0 ? 9 : index;
            };

            //updates slider bar
            document.querySelector('.range-slider').value = index;

            //pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })
    });

    //input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        //get the new index value
        var index = this.value;

        //pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
}


function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');


            //PUT YOUR SCRIPT TO CREATE THE TEMPORAL LEGEND HERE
            container.innerHTML = '<p class="temporalLegend">Passengers in <span class="year">2013</span></p>'

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="100" height="100">';

            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //Step 2: loop to add each circle and text to svg string
            for (var i=0; i<circles.length; i++){
                
                //Step 3: assign the r and cy attributes  
                var radius = calcPropRadius(dataStats[circles[i]]);  
                var cy = 59 - radius; 
                
                
                //circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';
            
                console.log(circles[i]);

                //evenly space out labels            
                var textY = i * 20 + 20;            

                //text string            
                svg += '<text id="' + circles[i] + '-text" x="5" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " million" + '</text>';
            
            
            };


            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            container.insertAdjacentHTML('beforeend',svg);

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new LegendControl());
};



//builds an attributes array from the json data. renames json variable as data for this function
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with passenger(Pax) values
        if (attribute.indexOf("Pax") > -1){
            attributes.push(attribute);
        };
    };



    return attributes;
};



//resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    var year = attribute.split("_")[1];
        //update temporal legend
        document.querySelector("span.year").innerHTML = year;
    map.eachLayer(function(layer){
        //checks to see if attribute exists
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = createPopupContent(props, attribute);    

            
            //add formatted attribute to panel content string
            //var year = attribute.split("_")[1];
            //popupContent += "<p><b>Passengers in " + year + ":</b> " + props[attribute] + " million</p>";
            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent).update();
        };
    });
};


//Import GeoJSON data
function getData(){
    //load the data
    fetch("data/airport.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //fill attributes variable with array from json file
            attributes = processData(json); //var removed
            //calculate minimum data value
            minValue = calcStats(json);
            //call function to create proportional symbols
            createPropSymbols(json, attributes);
            //creates the sequencing buttons and slider
            createSequenceControls(attributes);
            //creates legend
            createLegend(attributes);
        })
};

document.addEventListener('DOMContentLoaded',createMap)