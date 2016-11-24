var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;
d3.select(window).on("resize", resize);

var margin = {top: 20, right: 100, bottom: 30, left: 65};
var width = viewWidth - margin.left - margin.right;
var height = viewHeight - margin.top - margin.bottom;

var svg = d3.select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
/*
d3.csv("data/asylum_seekers_monthly_all_data.csv", function(d) {
  return {
    hosting_country : d["Country / territory of asylum/residence"],
    origin : d.origin,
    year : d.year,
    month : d.month,
    value : +d.value
  };
}*/

/*d3.csv("data/asylum_seekers_monthly_all_data.csv", function(csv_data) {

  //data.filter(function(row){ return row["Year"] == "2001"})
    //console.log(data);
    //vis.datum(csv).call(chart);
    /*data.forEach(function(d) {
      var dataset
    console.log(d)
  });
  return d3.nest()
      .key(function(d) {return d.Year})
      .rollup(function(d) {return d3.sum(d, function(g){return g.Value})} )
      .entries(csv_data)
});*/


d3.csv("data/asylum_seekers_monthly_all_data.csv", function(csv_data) {


function getDataPerYear() {
  var temp = d3.nest()
              .key(function(d) {return d.Year})
              .rollup(function(d) {return d3.sum(d, function(g){return g.Value})} )
              .entries(csv_data)
  return temp;
}

function drawScatterplot(data) {
  var xValue = function(d) { return parseInt(d.key, 10);},
      xScale = d3.scale.linear().range([0, viewWidth]), // value -> display
      xMap = function(d) { return xScale(xValue(d));}, // data -> display
      xAxis = d3.svg.axis().scale(xScale).orient("bottom");

  // setup y
  var yValue = function(d) { return d.values;},
      yScale = d3.scale.linear().range([viewHeight, 0]), // value -> display
      yMap = function(d) { return yScale(yValue(d));}, // data -> display
      yAxis = d3.svg.axis().scale(yScale).orient("left");

  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale.domain([0, d3.max(data, yValue)+1]);

  // x-axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text("x");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Y");

  svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap);



  //The svg is already defined, you can just focus on the creation of the scatterplot
  //you should at least draw the data points and the axes.
  console.log("Draw Scatterplot");

  //The data can be found in the boat_data.boats variable
  //console.log(boat_data.boats); //IMPORTANT - Remove this, it is here just to show you how to access the data

  //You can start with a simple scatterplot that shows the x and y attributes in boat_data.boats

  //Additional tasks are given at the end of this file
}
var data = getDataPerYear();

drawScatterplot(data);

});
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
