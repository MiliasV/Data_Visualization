var viewWidth = 3*window.innerWidth/7;
var viewHeight = 3*window.innerHeight/7;
d3.select(window).on("resize", resize);

var margin = {top: 20, right: 60, bottom: 30, left: 80};
var width = viewWidth - margin.left - margin.right;
var height = viewHeight - margin.top - margin.bottom;

var svg1 = d3.select("#svgFirst")
    .attr("width", viewWidth + margin.left + margin.right)
    .attr("height", viewHeight + margin.top + margin.bottom)
    .append("g")
    .attr("id","year")
    .attr("transform", "translate(" + margin.left  + "," + margin.top + ")");

var svg2 = d3.select("#svgSecond")
    .attr("width", viewWidth + margin.left + margin.right)
    .attr("height", viewHeight + margin.top + margin.bottom)
    .append("g")
    .attr("id","month")
    .attr("transform", "translate(" + margin.left  + "," + margin.top + ")");

// Read the dataset from the csv file
var path = "data/asylum_seekers_monthly_all_data.csv";
d3.csv(path, function(csv_data) {
  drawScatterplot(getDataPerYear(csv_data), "Year")
});


// Get the year as key and the sum of the number of refugees in that year
function getDataPerYear(csv_data) {
  var temp = d3.nest()
              .key(function(d) {return d.Year})
              .rollup(function(d) {return d3.sum(d, function(g){return g.Value})} )
              .entries(csv_data)
  //console.log(typeof(temp))
  //temp.forEach(function(d){console.log(d)})
  return temp;
}


function getDataPerMonth(csv_data, Year){
  var dataPerMonth = d3.nest()
            .key(function(d) {return d.Year})
            .key(function(d){ return d.Month})
            .rollup(function(d) {return d3.sum(d, function(g){return g.Value})})
            .entries(csv_data).filter(function(d){ return d.key == Year})
            
            //console.log(typeof(dataPerMonth[0].values))           
            var tmp = dataPerMonth[0]
            for (d in tmp.values){
         
              switch (tmp.values[d].key.toString()) {
                case "December": tmp.values[d].key = 12; break;
                case "January": tmp.values[d].key = 01; break;
                case "February": tmp.values[d].key = 02; break;
                case "March": tmp.values[d].key = 03; break;
                case "April": tmp.values[d].key = 04; break;
                case "May": tmp.values[d].key = 05; break;
                case "June": tmp.values[d].key = 06; break;
                case "July": tmp.values[d].key = 07; break;
                case "August": tmp.values[d].key = 08; break;
                case "September": tmp.values[d].key = 09; break;
                case "October": tmp.values[d].key = 10; break;
                case "November": tmp.values[d].key = 11; break;

              }   
            }
   
  return tmp.values
};


// Draw a scatter plot using the given data
function drawScatterplot(data, xName) {

    //remove the pre-existing graph
    //svg.selectAll("circle").remove()
    //svg.selectAll(svg2).remove()
    //d3.select("#svgSecond").remove()

  var yName = "Number of refugees"
  var xValue = function(d) { return parseInt(d.key, 10);}
  var yValue = function(d) { return d.values;}
  var xMin = d3.min(data, xValue)
  var xMax = d3.max(data, xValue)
  var yMin = d3.min(data, yValue)
  var yMax = d3.max(data, yValue)

  var xScale = d3.scale.linear().range([0, viewWidth]), // value -> display
      xMap = function(d) { return xScale(xValue(d));}, // data -> display
      xAxis = d3.svg
                .axis()
                .scale(xScale)
                .orient("bottom")
                .ticks(xMax - xMin);
      //console.log(xValue)
  // setup y
  var yScale = d3.scale.linear().range([viewHeight, 0]), // value -> display
      yMap = function(d) { return yScale(yValue(d));}, // data -> display
      yAxis = d3.svg
                .axis()
                .scale(yScale)
                .orient("left")

  xScale.domain([xMin, xMax]);
  yScale.domain([yMin-(yMax-yMin)/10, yMax+(yMax-yMin)/10]);


  if(xName =="Year"){
    var svg = svg1;
  }
  else{
    var svg = svg2;
    if(!d3.select("#month").empty()){
      svg.selectAll("circle").remove();
      svg.selectAll("text").remove();

      console.log("non empty");
    }
  }
  // x-axis
  svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + viewHeight + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", 0)
    .style("text-anchor", "end")
    .text("x");

  // y-axis
  svg.append("g")
      .attr("class", "yAxis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Y");

//Title of the graph
  svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top - 50))
        .attr("text-anchor", "middle")  
        .style("font-size", "30px") 
        .style("text-decoration", "underline")  
        .text("Refugees bla bla per " + xName);

  svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 10)//function(d){console.log(d); return d.values/60000})
      .attr("cx", xMap)
      .attr("cy", yMap)
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", click);


 var tooltip =  d3.select("body").append("div")
                  .attr("class", "tooltip")
                  .style("display", "inline");


  
  function mouseOver(d) {
    tooltip.transition()
         .duration(200)
         .style("opacity", .9);
    d3.select(this).style("fill", "aqua"); 
  }

  function mouseOut(d) {
    tooltip.transition()
           .duration(500)
           .style("opacity", 0);
    d3.select(this).style("fill", "LightSkyBlue"); 
  }

  function click(d) {
    d3.csv(path, function(csv_data) {
      drawScatterplot(getDataPerMonth(csv_data,d.key), d.key.toString())
      return 1;
    });
  }
}

function resize() {
  //This function is called if the window is resized
  //You can update your scatterplot here
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;
}




//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
////////////////////    ADDITIONAL TASKS   ///////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
/*
Once that you have implemented your basic scatterplot you can work on new features
  * Color coding of the points based on a third attribute
  * Legend for the third attribute with color scale
  * Interactive selection of the 3 attributes visualized in the scatterplot
  * Resizing of the window updates the scatterplot
*/
