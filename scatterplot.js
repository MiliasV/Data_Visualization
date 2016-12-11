var viewWidth = 2*window.innerWidth/5;
var viewHeight = 2*window.innerHeight/5;
d3.select(window).on("resize", resize);

var margin = {top: 20, right: 60, bottom: 50, left: 80};
var width = viewWidth - margin.left - margin.right;
var height = viewHeight - margin.top - margin.bottom;


 var tooltip =  d3.select("body").append("div")
                  .attr("class", "tooltip")
                  .style("display", "inline");

//initialization of empty array
zeroArr = [];

for (var i = 1999; i < 2016; i++) {
    zeroArr.push({
        key: i,
        values: 0,
    });
}

function addMissingValues(array){
  for (i =1999; i<2016; i++){
    var contains = false
    for(i=0; i<array.length ; i++){
      if(array[i].values == i) contains = true;
    }
    if (!contains){
      array.splice(i-1999, 0, {key:i, values:0});
    }
  }
  return array;
}

function createSvg(text, kind){
   return d3.select(text)
            .attr("width", viewWidth + margin.left + margin.right)
            .attr("height", viewHeight + margin.top + margin.bottom)
            .append("g")
            .attr("id", kind)
            .attr("transform", "translate(" + margin.left  + "," + margin.top + ")");
}

//Creation of the svgs
var svg1 = createSvg("#svgFirst", "year") //Whole world per Year, kind = 1
var svg2 = createSvg("#svgSecond", "month") //Whole world per Month, kind = 2
var svg3 = createSvg("#svgThird", "year") //Outgoing-Country per Year, kind = 3
var svg4 = createSvg("#svgFourth", "year") //Incoming-Country per Year, kind = 4
var svg5 = createSvg("#svgFifth", "year") //Outgoing-Country per Month, kind = 5
var svg6 = createSvg("#svgSixth", "year") //Incoming-Country per Month, kind = 6

// Read the dataset from the csv file
var refugeesPath = "data/asylum_seekers_monthly_all_data2.csv";
var gdpPath = "data/gdp_per_capita.csv"

var gdp_csv = null;
d3.csv(gdpPath, function(csv) {
  gdp_csv = csv;
});

function getGdp(country){
  result = null;
  for (i =0; i<gdp_csv.length; i++){
    if (gdp_csv[i]["Country"] == country){
      result = gdp_csv[i];
    }
  }
  return result;
}

var the_csv_data = null;

d3.csv(refugeesPath, function(csv_data) {
//Create the Dropdown List (one option for each country)
  createDropdown(csv_data);
  //Draw the First plot (All countries per Year)
  drawScatterplot(getDataPerYear(csv_data), 1, "Year")
  the_csv_data = csv_data;
});

function createDropdown(csv_data){
  var menu = ["OriginCountries", "Ingoing"]
  menu.forEach(function(value, index, array){
    csv = csv_data.filter(function(row){
          return row[value]
        })
    csv.forEach(function(row){
      str = "#" + value
      d3.selectAll(str)
        .append("option")
        .attr("label",row[value])
        .attr("id", row[value])

    });

  })
  
    
        };

function dropdownSelectionOutgoing(s){
  var country = s[s.selectedIndex].id; 
  drawScatterplot(getDataPerOrigin(the_csv_data, country, "Origin"),3, country)
  drawScatterplot(getDataPerOrigin(the_csv_data, country, "Country"),4, country)
}

/*
function dropdownSelectionIncoming(s){
  var country = s[s.selectedIndex].id; 
  drawScatterplot(getDataPerOrigin(the_csv_data, country, "Country"),3, country)
}
*/
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
  var tmp = dataPerMonth[0]
  for (d in tmp.values){
    tmp.values[d].key = monthsToNumbers(tmp.values[d].key)    
  }
  return tmp.values
};

function getDataPerOrigin(csv_data, Origin, column){
  var dataPerOrigin = d3.nest()
            .key(function(d) {return d[column]})
            .key(function(d){ return d.Year})
            .rollup(function(d) {return d3.sum(d, function(g){return g.Value})})
            .entries(csv_data)
            .filter(function(d){ return d.key == Origin})

  console.log(dataPerOrigin)
  console.log(Origin, column)
  if (dataPerOrigin.length==0){
    return zeroArr;
  }
  /*
  else if(dataPerOrigin.length != 17){
    console.log(dataPerOrigin[0].values)
    //return addMissingValues(dataPerOrigin[0].values)
  }*/
  //console.log(dataPerOrigin[0].values)
  else return dataPerOrigin[0].values; 
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

// kind can be "outgoing" or "incoming"
function getDataPerYearPerOrigin(year, kind){
  var countriesPerOrigin = d3.nest()
          .key(function(d) {return d["Year"]})
          .key(function(d){ return d["Origin"]})
          .rollup(function(d) {return d3.sum(d, function(g){return g.Value})})
          .entries(the_csv_data)
          .filter(function(d){ return d.key == year})[0].values
  countriesPerOrigin.sort(function(a, b){
                                            if(a.values < b.values) return 1;
                                            if(a.values > b.values) return -1;
                                            return 0;
                                        });

  return countriesPerOrigin.slice(0, 20);
}


function getDataPerCountryPerMonth(csv_data, Country, Year, flag){
  if (flag==0){
    var fromColumn = "Origin"
  }
  else{
    var fromColumn = "Country"
  }
  var dataPerOrigin = d3.nest()
            .key(function(d) { return d[fromColumn]})
            .key(function(d){ return d.Year})
            .key(function(d){ return d.Month})
            .rollup(function(d) {return d3.sum(d, function(g){return g.Value})})
            .entries(csv_data)
            .filter(function(d){  return (d.key == Country)})
  var dataPerOriginPerMonth = dataPerOrigin[0].values
                                              .filter(function(d){return d.key == Year})

  var tmp = dataPerOriginPerMonth[0]
           for (d in tmp.values){
              tmp.values[d].key = monthsToNumbers(tmp.values[d].key)    
            }  
  return tmp.values
  //return dataPerOrigin[0].values; 
}


function drawBarPlot(year){
  var yName = "Number of refugees"
  var xName = "Country"
  var title = "Outgoing refugees per country in " + year
  var xScale = d3.scale.ordinal().rangeRoundBands([0, viewWidth], .05); // value -> display
      xMap = function(d) { return xScale(d.key);}, // data -> display
      xAxis = d3.svg
                .axis()
                .scale(xScale)
                .orient("bottom")
  // setup y
  var yScale = d3.scale.linear().range([viewHeight, 0]), // value -> display
      yMap = function(d) {return yScale(d.values);}, // data -> display
      yAxis = d3.svg
                .axis()
                .scale(yScale)
                .orient("left");

  var svg = svg2;

  if(!d3.select("#month").empty()){
    svg.selectAll(".bar").remove();
    svg.selectAll("text").remove();
  }

  var g = svg.append("g")
      //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
   //Get the data
  var countriesPerOriginPerYear = getDataPerYearPerOrigin(year, "outgoing")

  xScale.domain(countriesPerOriginPerYear.map(function(d) { return d.key; }));
  var yMax = d3.max(countriesPerOriginPerYear, function(d) { return d.values; });
  yScale.domain([0, yMax + 0.1*yMax]);

  g.append("g")
      .attr("class", "xAxis")
      .attr("transform", "translate(0," + viewHeight + ")")
      .call(xAxis)
      .selectAll("text")
      .attr("y", 6)
      .attr("x", 0)
      .attr("dy", ".75em")
      .attr("transform", "rotate(25)")
      .style("text-anchor", "start");

  g.append("g")
      .attr("class", "yAxis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")

//Title of the graph
  svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top - 20))
        .attr("text-anchor", "middle")  
        .style("font-size", "15px") 
        .style("text-decoration", "underline")  
        .text(title);

  g.selectAll(".bar")
    .data(countriesPerOriginPerYear)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {  return xMap(d); })
      .attr("y", function(d) {  return yMap(d); })
      .attr("width", xScale.rangeBand())
      .attr("height", function(d) { return viewHeight - yMap(d); })
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut);

  function mouseOver (d){
    tooltip.transition()
         .duration(200)
         .style("opacity", .9);
    d3.select(this).style("fill", "LightSkyBLue"); 
    tooltip.html(getTextMouseOver(d))
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
  }

  function getTextMouseOver(d) {
    var result =  xName + ": " + d.key + "</br>" + 
                  yName + ": " + d.values;
    return result;
  }

  function mouseOut(d) {
    tooltip.transition()
           .duration(500)
           .style("opacity", 0);
    d3.select(this).style("fill", "steelblue"); 
  }
}


// Draw a scatter plot using the given data
function drawScatterplot(data, kind, txt, country) {

  var xName = ""
  var gdpCountry = null
  //console.log(data)
  // Whole world per Year
  if(kind == 1){
    var svg = svg1;
    svg.selectAll("circle").remove();
    svg.selectAll("text").remove()
    text = "Refugees per Year - World"
    xName = "Year"
  }
  // Whole world per Month
  else if (kind ==2){
    var svg = svg2;
    if(!d3.select("#month").empty()){
      svg.selectAll("circle").remove();
      svg.selectAll("text").remove();
      //console.log("non empty");
      //text = "Month (" + txt + ")"
      text = "Refugees per Month (" + txt + ") - World"

      xName = "Month"
    }
  }
  // Country per Year
  else if (kind == 3){
    var svg = svg3;
    svg.selectAll("g").remove()
    svg.selectAll("circle").remove();
    svg.selectAll("text").remove()
    //text = "Year (" + txt + ")"
    text = "Outgoing Refugees per Year - " + txt  

    xName = "Year"
    gdpCountry = getGdp(txt)

  }
  // Incoming Refugees per Year
   else if (kind == 4){
    var svg = svg4;
    svg.selectAll("g").remove()
    svg.selectAll("circle").remove();
    svg.selectAll("text").remove()
    //console.log("non empty");
    //text = "Month (" + txt + ") " + country;
    text = "Incoming Refugees per Year - " + txt ;

    xName = "Year"
    gdpCountry = getGdp(txt)
  }

  else if (kind == 5){
    var svg = svg5;
    svg.selectAll("circle").remove();
    svg.selectAll("text").remove()
    //console.log("non empty");
    text = "Outgoing Refugees in " + txt + " - " + country;
    //text = "Incoming Refugees per Year - " + txt ;

    xName = "Year"
    gdpCountry = getGdp(txt)
  }

   else if (kind == 6){
    var svg = svg6;
    svg.selectAll("circle").remove();
    svg.selectAll("text").remove()
    //console.log("non empty");
    text = "Incoming Refugees in " + txt + " - " + country;
    //text = "Incoming Refugees per Year - " + txt ;
    xName = "Year"
    gdpCountry = getGdp(txt)
  }

  var yName = "Number of Refugees"
  var xValue = function(d) { return parseInt(d.key, 10);}
  var yValue = function(d) { return d.values;}
  var xMin = d3.min(data, xValue)//1998//
  var xMax = d3.max(data, xValue)//2016//
  var yMin = d3.min(data, yValue)
  var yMax = Math.max(d3.max(data, yValue), 10)

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

  xScale.domain([xMin - 1, xMax + 1]);
  yScale.domain([yMin-(yMax-yMin)/10, yMax+(yMax-yMin)/10]);

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
        .attr("y", 0 - (margin.top - 20))
        .attr("text-anchor", "middle")  
        .style("font-size", "15px") 
        .style("text-decoration", "underline")  
        .text(text);//+ kind + "(" + text + ")");
        //.text("Refugees  per " + text);//+ kind + "(" + text + ")");

  svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", getRadius)//function(d){console.log(d); return d.values/60000})
      .attr("cx", xMap)
      .attr("cy", yMap)
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)


  function getRadius(d){
    var result = 10;
    if ((kind == 3 || kind == 4) && gdpCountry != null) {
      var gdp = Math.round(+gdpCountry[xValue(d)])
      var array = [];
      for(i=1999; i<2016; i++){
        array[i-1999] = Math.round(+gdpCountry[i]);
      }
      var min = d3.min(array)
      var max = d3.max(array)*(1/0.7)
      //console.log(data)
      //console.log(max, gdp, gdpCountry)

      result = 5 + ((gdp-min)*(1/0.7)/(max-min)) * 10
    }
    console.log(result)
    return result;
  }


  
  function mouseOver(d) {
    tooltip.transition()
         .duration(200)
         .style("opacity", .9);
    d3.select(this).style("fill", "LightSkyBLue"); 
    tooltip.html(getTextMouseOver(d))
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    if (kind==1){
      //drawScatterplot(getDataPerMonth(the_csv_data,d.key), 2, d.key.toString())
      drawBarPlot(d.key)
    }
    else if(kind==3){
      drawScatterplot(getDataPerCountryPerMonth(the_csv_data, txt, d.key, 0), 5, d.key.toString(),txt)
    }
    else if(kind==4){
      drawScatterplot(getDataPerCountryPerMonth(the_csv_data, txt, d.key, 1), 6, d.key.toString(),txt)
    }
  }

  function getTextMouseOver(d) {
    var result = xName + ": " + xValue(d) + "</br>" + yName + ": " + yValue(d);
    if ((kind == 3 || kind == 4)) {
      if (gdpCountry != null){
        result += "</br>" + "GDP per capia:" + Math.round(+gdpCountry[xValue(d)]) + " US dollar";
      }
      else{
        result += "</br>" + "GDP per capia: Unknown";
      }
    }
    return result;
  }

  function mouseOut(d) {
    tooltip.transition()
           .duration(500)
           .style("opacity", 0);
    d3.select(this).style("fill", "steelblue"); 
  }

  function click(d) {
    if (kind==1){
      drawScatterplot(getDataPerMonth(the_csv_data,d.key), 2, d.key.toString())
    }
    else if(kind==3){
      drawScatterplot(getDataPerOriginPerMonth(the_csv_data, txt, d.key), 4, d.key.toString(),txt)
    }
  }
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
