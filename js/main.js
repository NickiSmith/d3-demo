//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap() {


    var promises = [];
    
    promises.push(d3.json("data/countiesUS.topojson"));
    
    Promise.all(promises).then(callback2)
    
    
   /* //use queue to parallelize asynchronous data loading
    d3.queue()

        //.defer(d3.csv, "data/d3JoinedData.csv") //load attributes from csv
         //load spatial data
        .defer(d3.json, "data/countiesUS.topopjson")

        //.await(callback);
        .await(callback2);*/

    function callback2(results){
        console.log("hello");
        console.log(results);
    }
    
    function callback(error, csvData, counties) {
        console.log(error);
        console.log(csvData);
        console.log(counties);
        
        
    };
};