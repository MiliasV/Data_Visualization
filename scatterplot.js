var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;
d3.select(window).on("resize", resize);

var margin = {top: 30, right: 5, bottom: 30, left: 100};
var width = viewWidth - margin.left - margin.right;
var height = viewHeight - margin.top - margin.bottom;


//Creation of the svgs
var svg1 = createSvg("#svgFirst", "year") //Whole world per Year, kind = 1
var svg2 = createSvg("#svgSecond", "month") //Whole world per Month, kind = 2
var svg3 = createSvg("#svgThird", "year") //Country per Year, kind = 3
var svg4 = createSvg("#svgFourth", "year") //Country per Month, kind = 4

// Read the dataset from the csv file
var path = "data/asylum_seekers_monthly_all_data2.csv";

var the_csv_data = null;

d3.csv(path, function(csv_data) {
//Create the Dropdown List (one option for each country)
  createDropdown(csv_data);
  //Draw the First plot (All countries per Year)
  drawScatterplot(getDataPerYear(csv_data), 1, "Year")
  the_csv_data = csv_data;
});

function createDropdown(csv_data){
  csv = csv_data.filter(function(row){
          return row["OriginCountries"]
        })
            csv.forEach(function(row){
              d3.selectAll("select")
                .append("option")
                .attr("label",row.OriginCountries)
                .attr("id", row.OriginCountries)

            });
        };

function dropdownSelection(s){
  var country = s[s.selectedIndex].id; 
  //console.log(country)
  //console.log(the_csv_data)
  drawScatterplot(getDataPerOrigin(the_csv_data, country),3, country)
}


// Get the year as key and the sum of the number of refugees in that year
function getDataPerYear(csv_data) {
  var temp = d3.nest()
              .key(function(d) {return d.Year})
              .rollup(function(d) {return d3.sum(d, function(g){return g.Value})} )
              .entries(csv_data)
  return temp;
}

function monthsToNumbers(month){
   switch (month) {
                case "December": month = 12; break;
                case "January": month = 01; break;
                case "February": month = 02; break;
                case "March": month = 03; break;
                case "April": month = 04; break;
                case "May": month = 05; break;
                case "June": month = 06; break;
                case "July": month = 07; break;
                case "August": month = 08; break;
                case "September": month = 09; break;
                case "October": month = 10; break;
                case "November": month = 11; break;
              } 
  return month

}

function getDataPerMonth(csv_data, Year){
  var dataPerMonth = d3.nest()
            .key(function(d) {return d.Year})
            .key(function(d){ return d.Month})
            .rollup(function(d) {return d3.sum(d, function(g){return g.Value})})
            .entries(csv_data)
            .filter(function(d){ return d.key == Year})
            
            //console.log(typeof(dataPerMonth[0].values))           
            var tmp = dataPerMonth[0]
            for (d in tmp.values){
              tmp.values[d].key = monthsToNumbers(tmp.values[d].key)    
            }
   
  return tmp.values
};

function getDataPerOrigin(csv_data, Origin){
  var dataPerOrigin = d3.nest()
            .key(function(d) {return d.Origin})
            .key(function(d){ return d.Year})

            .rollup(function(d) {return d3.sum(d, function(g){return g.Value})})
            .entries(csv_data)
            .filter(function(d){ return d.key == Origin})
  console.log(dataPerOrigin[0].values)
  return dataPerOrigin[0].values; 
}

function getDataPerOriginPerMonth(csv_data, Origin, Year){
  console.log(Origin)
  var dataPerOrigin = d3.nest()
            .key(function(d) { return d.Origin})
            .key(function(d){ return d.Year})
            .key(function(d){ return d.Month})
            .rollup(function(d) {return d3.sum(d, function(g){return g.Value})})
            .entries(csv_data)
            .filter(function(d){  return (d.key == Origin)})
  var dataPerOriginPerMonth = dataPerOrigin[0].values
                                              .filter(function(d){return d.key == Year})
  console.log(dataPerOriginPerMonth[0].values)

  var tmp = dataPerOriginPerMonth[0]
           for (d in tmp.values){
              tmp.values[d].key = monthsToNumbers(tmp.values[d].key)    
            }  
  return tmp.values
  //return dataPerOrigin[0].values; 
}

function createSvg(text, kind){
 return d3.select(text)
          .attr("width", viewWidth-5)
          .attr("height", viewHeight-5)
          .append("g")
          .attr("id",kind)
          .attr("transform", "translate(" + margin.left  + "," + margin.top + ")");
}

// Draw a scatter plot using the given data
function drawScatterplot(data, kind, txt, country) {

  if(kind == 1){
    var svg = svg1;
    svg.selectAll("circle").remove();
    svg.selectAll("text").remove()
    text = "Year (World)"
  }

  else if (kind ==2){
    var svg = svg2;
    if(!d3.select("#month").empty()){
      svg.selectAll("circle").remove();
      svg.selectAll("text").remove()
      console.log("non empty");
      text = "Month (" + txt + ")"
    }
  }
   
  else if (kind == 3){
    var svg = svg3;
    svg.selectAll("g").remove()
    svg.selectAll("circle").remove();
    svg.selectAll("text").remove()
    text = "Year (" + txt + ")"
  }

   else if (kind == 4){
    var svg = svg4;
    //if(!d3.select("#month").empty()){
    svg.selectAll("circle").remove();
    svg.selectAll("text").remove()
    console.log("non empty");
    text = "Month (" + txt + ") " + country;
    
  }

  var xValue = function(d) { return parseInt(d.key, 10);},
      xScale = d3.scale.linear().range([100, viewWidth-200]), // value -> display
      xMap = function(d) { return xScale(xValue(d));}, // data -> display
      xAxis = d3.svg.axis().scale(xScale).orient("bottom");
      //console.log(xValue)
  // setup y
  var yValue = function(d) { return d.values;},
      yScale = d3.scale.linear().range([viewHeight-100, 0]), // value -> display
      yMap = function(d) { return yScale(yValue(d));}, // data -> display
      yAxis = d3.svg.axis().scale(yScale).orient("left");

  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
//  xScale.domain([d3.min(data, xValue), d3.max(data, xValue)+1]);

  yScale.domain([d3.min(data, yValue)/1.3, d3.max(data, yValue)+1]);


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


//Title of the graph
  svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top - 50))
        .attr("text-anchor", "middle")  
        .style("font-size", "30px") 
        .style("text-decoration", "underline")  
        .text("Refugees  per " + text);//+ kind + "(" + text + ")");

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
         // d3.csv(path, function(csv_data) {
            if (kind==1){
              drawScatterplot(getDataPerMonth(the_csv_data,d.key), 2, d.key.toString())
            }
            else if(kind==3){
              drawScatterplot(getDataPerOriginPerMonth(the_csv_data, txt, d.key), 4, d.key.toString(),txt)
            }
         //});
       
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

function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");


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
