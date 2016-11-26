var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;
d3.select(window).on("resize", resize);

var margin = {top: 30, right: 5, bottom: 30, left: 60};
var width = viewWidth - margin.left - margin.right;
var height = viewHeight - margin.top - margin.bottom;

var svg = d3.select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Read the dataset from the csv file
var path = "data/asylum_seekers_monthly_all_data.csv";
d3.csv(path, function(csv_data) {
  drawScatterplot(getDataPerYear(csv_data))
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
function drawScatterplot(data) {

    //remove the pre-existing graph
    svg.selectAll("circle").remove()
    svg.selectAll("g").remove()


  var xValue = function(d) { return parseInt(d.key, 10);},
      xScale = d3.scale.linear().range([0, viewWidth]), // value -> display
      xMap = function(d) { return xScale(xValue(d));}, // data -> display
      xAxis = d3.svg.axis().scale(xScale).orient("bottom");
      //console.log(xValue)
  // setup y
  var yValue = function(d) { return d.values;},
      yScale = d3.scale.linear().range([viewHeight, 0]), // value -> display
      yMap = function(d) { return yScale(yValue(d));}, // data -> display
      yAxis = d3.svg.axis().scale(yScale).orient("left");

  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
//  xScale.domain([d3.min(data, xValue), d3.max(data, xValue)+1]);

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
      .attr("r", 15)//function(d){console.log(d); return d.values/60000})
      .attr("cx", xMap)
      .attr("cy", yMap)
      .on("click", function(d){
          console.log(d.key)
          d3.csv(path, function(csv_data) {
          //drawScatterplot(getDataPerMonth(csv_data, "2013"));
          drawScatterplot(getDataPerMonth(csv_data,d.key))
         });
       
      });



  //The svg is already defined, you can just focus on the creation of the scatterplot
  //you should at least draw the data points and the axes.
  console.log("Draw Scatterplot");

  //The data can be found in the boat_data.boats variable
  //console.log(boat_data.boats); //IMPORTANT - Remove this, it is here just to show you how to access the data

  //You can start with a simple scatterplot that shows the x and y attributes in boat_data.boats

  //Additional tasks are given at the end of this file
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
