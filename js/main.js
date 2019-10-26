(function(){
    //pseudo-global variables for data join
    var attrArray = ["GreenBeans", "BrusselsSprouts", "Potatoes", "Pumpkins", "SweetPotatoes", "Turkeys"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
    
    //map frame dimensions
    var width = 900,
        height = 700;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on the US (update d3 namespace to v4 syntax geoAlbers not geo.albers -- https://stackoverflow.com/questions/42846588/uncaught-typeerror-cannot-read-property-albersusa-of-undefined)
    var projection = d3.geoAlbers()
        .center([-4, 35])
        .rotate([93, 0, 0])
        .parallels([45.00, 33.00])
        .scale(1100)
        .translate([width / 2, height / 2]);
    
    /*//would like to utilize the geoAlbersUSA projection to include Alaska and Hawaii, but doesn't work yet
    var projection = d3.geo.albersUSA()
        .scale(1000)
        .translate([width /2, height / 2]);*/
    
    var path = d3.geoPath()
        .projection(projection);
    
    //use queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/ThanksgivingCrops.csv") //load attributes from csv
        .defer(d3.json, "data/states.json") //load background spatial data
        .await(callback);

    function callback(error, csv, us){
        //translate France regions TopoJSON
        var statesUS = topojson.feature(us, us.objects.states).features;

        //call joinData() to join csv data to GeoJson enumeration units (US states)
        statesJoin = joinData(csv, statesUS);
        
        //call setEnumerationUnits() to add enumeration units (states) to the map
        setEnumerationUnits(statesUS, map, path);

        //examine the results
        console.log(error);
        console.log(csv)
        console.log(statesUS);
        console.log(statesJoin);

    } //end of the callback() function
    
    function joinData(csv, us){
        //loop through csv to assign each set of csv attribute values to geojson region
        for (var i=0; i<csv.length; i++){
        var csvRegion = csv[i]; //the current region
        var csvKey = csvRegion.StateName; //the CSV primary key
            
            //loop through geojson regions to find correct region
            for (var a=0; a<us.length; a++){

                var geojsonProps = us[a].properties; //the current region geojson properties
                var geojsonKey = geojsonProps.name; //the geojson primary key

                //where primary keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey){

                    //assign all attributes and values
                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvRegion[attr]); //get csv attribute value
                        geojsonProps[attr] = val; //assign attribute and value to geojson properties
                    }); //end of .forEach anonymous function
                } //end of if statement
            } //end of inner for loop
        } //end of outer for loop
} //end of joinData()
    
    function setEnumerationUnits(statesUS, map, path){
        //add US states to map
        var statesPath = map.selectAll(".statesPath")
        .data(statesUS)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "statesPath " + d.properties.state;
        })
        .attr("d", path);
    } //end of setEnumerationUnits
    
} //end of the setMap() function
})(); //end of self-executing anonymous function wrap which moves pseudo-global variables to local scope