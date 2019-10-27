(function(){
    //pseudo-global variables for data join
    var attrArray = ["GreenBeans", "Potatoes", "Pumpkins", "SweetPotatoes", "Turkeys"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){

    //map frame dimensions
    //lab has "responsive" design using window.innerWidth, but this works very poorly because the map and chart don't actually resize
    var width = 750,
        //width = window.innerWidth * 0.5,
        height = 550;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);
    
    //create Albers equal area conic projection centered on the US (update d3 namespace to v4 syntax geoAlbers not geo.albers -- https://stackoverflow.com/questions/42846588/uncaught-typeerror-cannot-read-property-albersusa-of-undefined)
    var projection = d3.geoAlbers()
        .center([-4, 40])
        .rotate([93, 0, 0])
        .parallels([45.00, 33.00])
        .scale(1000)
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

        //create the color scale
        var colorScale = makeColorScale(csv);


        //call setEnumerationUnits() to add enumeration units (states) to the map
        setEnumerationUnits(statesUS, map, path, colorScale);
        
        //add coordinated viz to the map
        setChart(csv, colorScale);
        
    } //end of the callback() function

} //end of setMap()

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

        console.log(us);
        return us;

} //end of joinData()

    function setEnumerationUnits(statesUS, map, path, colorScale){
        //add US states to map
        var statesPath = map.selectAll(".statesPath")
        .data(statesUS)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "statesPath " + d.properties.state;
        })
        .attr("d", path)
        .style("fill", function(d){
            return choropleth(d.properties,colorScale);
        });
    } //end of setEnumerationUnits

    //function to create color scale generator
    function makeColorScale(data){
        var colorClasses = [
            "#ffffcc",
            "#c2e699",
            "#78c679",
            "#31a354",
            "#006837"
        ];

        //create color scale generator
        var colorScale = d3.scaleThreshold()
          .range(colorClasses);

        //build array of all values of the expressed attribute
        var domainArray = [];
        for (var i=0; i<data.length; i++){
            var val = parseFloat(data[i][expressed]);
            domainArray.push(val);
        };

        //cluster data using ckmeans clustering algorithm to create natural breaks
        var clusters = ss.ckmeans(domainArray, 5);
        //reset domain array to cluster minimums
        domainArray = clusters.map(function(d){
            return d3.min(d);
        });
        //remove first value from domain array to create class breakpoints
        domainArray.shift();


        //assign array of expressed values as scale domain
        colorScale.domain(domainArray);

        return colorScale;

    } //end of makeColorScale()

    //function to test for data value and return color
    function choropleth(props, colorScale){
      //make sure attribute value is a number
      var val = parseFloat(props[expressed]);
      //if attribute value exists, assign a color; otherwise assign gray; values designed as undisclosed in USDA dataset (D) have been replaced by 999999. These values should be assigned a separate color and explained in legend
      if (typeof val == 'number' && !isNaN(val)){
          return colorScale(val);
        } else if (val == 999999) {
            return "black"
        } else {
          return "#CCC";
        };
      }; //end of choropleth
    
    //function to create coordinated bar chart
    function setChart(csv, colorScale){
        //chart frame dimensions
        var chartWidth = 600,
            chartHeight = 525,
            leftPadding = 50,
            rightPadding = 2,
            topBottomPadding = 5,
            chartInnerWidth = chartWidth - leftPadding - rightPadding,
            chartInnerHeight = chartHeight - topBottomPadding * 2,
            translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

        //create a second svg element to hold the bar chart
        var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");
        
        //create a rectangle for chart background fill
        var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
        
        /*//create a scale to size bars proportionally to frame
        var yScale = d3.scaleLinear()
        .range([0, chartHeight])
        .domain([0, 100000]);*/
        
        //create a scale to size bars proportionally to frame
        var csvmax = d3.max(csv, function(d) { return parseFloat(d[expressed]); });
        console.log(csvmax);
        
        var yScale = d3.scaleLinear()
        .range([chartHeight-10, 0])
        .domain([0, csvmax + 20]);
        
        //set bars for each state
        var bars = chart.selectAll(".bars")
        .data(csv)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bars " + d.StateName;
        })
        .attr("width", chartInnerWidth / csv.length - 1)
        .attr("x", function(d, i){
            return i * (chartInnerWidth / csv.length) + leftPadding;
        })
        .attr("height", function(d){
            return chartHeight - 10 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .style("fill", function(d){
            return choropleth(d, colorScale);
        });
        
        //create a text element for the chart title
        var chartTitle = chart.append("text")
        .attr("x", 120)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text("Acres of " + expressed + " grown in each state");
        
        //create vertical axis generator
        var yAxis = d3.axisLeft()
        .scale(yScale)
        //.orient("left");

        //place axis
        var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);
        
    
        //create frame for chart border
        var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
        
    }; //end of setChart()
    
})(); //end of self-executing anonymous function wrap which moves pseudo-global variables to local scope
