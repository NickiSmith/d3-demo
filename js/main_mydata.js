//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap() {
    
    
    //map frame dimensions
    var width = 960,
        height = 460;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on the US (update d3 namespace to v4 syntax geoAlbers not geo.albers -- https://stackoverflow.com/questions/42846588/uncaught-typeerror-cannot-read-property-albersusa-of-undefined)
    var projection = d3.geoAlbers()
        .center([-3, 35])
        .rotate([93, 0, 0])
        .parallels([45.00, 33.00])
        .scale(550)
        .translate([width / 2, height / 2]);
    
    var path = d3.geoPath()
        .projection(projection);
    
    
    
    var promises = [];
    promises.push(d3.json("data/EuropeCountries.topojson")); //load the cartographic boundaries data (US counties)
    promises.push(d3.csv("data/d3JoinedData.csv")); //load the csv data (USDA and US Census data)
    
    
    Promise.all(promises).then(callback2)
   
    function callback2(data){
        countries = data[0];
        csvData = data[1];
        
        //translate counties TopoJSON
        //I have no idea what is happening in this code block: topology is first parameter and points directy to json data, "object" is second parameter and confusing. API documentation https://github.com/topojson/topojson-client/blob/master/README.md#feature
		var usCounties = topojson.feature(countries, countries.objects.EuropeCountries).features;

        
        //add US counties to map
        var counties = map.selectAll(".regions")
            .data(usCounties)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "counties " + d.properties.geoid;
            })
            .attr("d", path);
         
        //test to see if callback function is being called
        console.log("hello");
        console.log(counties);
        console.log(csvData);
    }
    
    
   /* This does not work! Replaced with code above using promises to load data.
   
   //use queue to parallelize asynchronous data loading
    d3.queue()

        //.defer(d3.csv, "data/d3JoinedData.csv") //load attributes from csv
         //load spatial data
        .defer(d3.json, "data/countiesUS.topopjson")

        //.await(callback);
        .await(callback2);
        
        function callback(error, csvData, counties) {
            console.log(error);
            console.log(csvData);
            console.log(counties);
        };
        
    */
};