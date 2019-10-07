/* d3 Demo GEOG 575 Nicki Smith */
//execute script when the window is loaded
window.onload = function() {

    var container = d3.select("body") //get the body element from the DOM
  
        .append("svg") //put a new svg in the body
        .attr("width", 1000) //assign the width
        .attr("height", 550) //assign the height
        .attr("class", "container") //always assign a class (as the block name) for styling and future selections
        .style("background-color", "rgba(0,0,0,0.2)"); //only put a semicolon at the end of the block!

    //innerRect block
    var innerRect = container.append("rect") //put a new rect in the svg
        .datum(400) //bind a single data value
        .attr("width", function(d) {
            return d * 2; //400 * 2 = 800
        }) //rectangle width
        .attr("height", function(d) {
            return d; //400
        }) //rectangle height
        .attr("class", "innerRect") //class name
        .attr("x", 50) //position from left on the x (horizontal) axis
        .attr("y", 50) //position from top on the y (vertical) axis
        .style("fill", "#FFFFFF"); //fill color

    //var dataArray = [10,20,30,40,50];

    var cityPop = [
        {
            city: 'Madison',
            population: 233209
        },
        {
            city: 'Milwaukee',
            population: 594833
        },
        {
            city: 'Green Bay',
            population: 104057
        },
        {
            city: 'Superior',
            population: 27244
        }
    ];

    
    var x = d3.scaleLinear()  //create the scale
        .range([90, 720]) //output min and max
        .domain([0, 3]); //input min and max

    //find the minimum value of the array
    var minPop = d3.min(cityPop, function(d) {
        return d.population;
    });

   
    //find the maximum value of the array
    var maxPop = d3.max(cityPop, function(d) {
        return d.population;
    });

    //scale for circles center y coordinate
    var y = d3.scaleLinear()
        .range([450, 50])
        .domain([0, 700000]);
    //color scale generator
    var color = d3.scaleLinear()
        .range([
            "#FDBE85",
            "#D94701"
        ])
        .domain([
            minPop,
            maxPop
        ]);
   
    var circles = container.selectAll(".circles") //creating an empty selection since circles don't exist yet
        .data(cityPop) //pass in the array
        .enter() //function that creates an array of placeholders for each array item -- everything in the block after this is essentially a loop
        .append("circle") //add a circule for each datum
        .attr("class", "circles") //apply a class name to all circles
        .attr("id", function(d) {
            return d.city;
        })
        .attr("r", function(d){ //calculate the radius
            var area = d.population * 0.01;
            return Math.sqrt(area/Math.PI);
        })
        .attr("cx", function(d, i){ //use the index to place each circle horizontally
          return x(i);
        })
        .attr("cy", function(d){ //subtract value from 450 to "grow" circles up from the bottom instead of down from the top of the SVG
            return y(d.population);
        })
        .style("fill", function(d, i) { //add a fill color based on the color scale generator
            return color(d.population);
        })
        .style("stroke", "#000"); //black circle stroke
 

    var yAxis = d3.axisLeft(y);

    //add a Y axis to the chart
    var axis = container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(50, 0)")
        .call(yAxis);

    //add a chart title
    var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("City Populations");

    //add city labels to the circles
    var labels = container.selectAll(".labels")
        .data(cityPop)
        .enter()
        .append("text")
        .attr("class", "labels")
        .attr("text-anchor", "left")
        .attr("x", function(d, i) {
            //horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) +5;
        })
        .attr("y", function(d) {
            //vertical position centered on each circle
            return y(d.population) - 2.5;
        })

    //first line of label
    var nameLine = labels.append("tspan")
        .attr("class", "nameLine")
        .attr("x", function(d,i){
            //horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
        })
        .text(function(d){
            return d.city;
        });

    //create format generator
    var format = d3.format(",");

   //second line of label
    var popLine = labels.append("tspan")
        .attr("class", "popLine")
        .attr("x", function(d,i){
            //horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
        })
        .attr("dy", "15") //vertical offset
        .text(function(d){
            return "Pop. " + format(d.population);
        });
}


