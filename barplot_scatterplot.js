var viewWidth = 3*window.innerWidth/5;
var viewHeight = 3*window.innerHeight/5;
//d3.select(window).on("resize", resize);
var margin = {top: 30, right: 60, bottom: 100, left: 80}
var width = viewWidth - margin.left - margin.right;
var height = viewHeight - margin.top - margin.bottom;

var tooltip =  d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("display", "inline");

var svg1 = createSvg("#barplotOutgoing", 0) 
var svg2 = createSvg("#barplotIncoming", 1) 

//var x = d3.scaleBand().rangeRound([0, viewWidth]).padding(0.1),
  //  y = d3.scaleLinear().rangeRound([viewHeight, 0]);

var refugeesPath = "data/asylum_seekers_monthly_all_data2.csv";

var data = null //global variable that contains all the dataset
var country = null
var year = null
var kind = null


d3.csv(refugeesPath, function(csv_data){

  country ="Afghanistan"
  year = 1999

  //var qs = new Querystring();

  country = getURLParameter("country");
  year = getURLParameter("year");
  kind = getURLParameter("kind")

  console.log(country)
  console.log(year)
 
  data = csv_data
  createDropdown(data);

  drawBarplot(country, year, 0)
  drawBarplot(country, year, 1)

});


function createSvg(text, kind){
   return d3.select(text)
            .attr("width",viewWidth + margin.left + margin.right)//viewWidth + margin.left + margin.right)
            .attr("height", viewHeight + margin.top + margin.bottom)//viewHeight + margin.top + margin.bottom)
            .append("g")
            .attr("id", kind)
            .attr("transform", "translate(" + margin.left  + "," + margin.top + ")");
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

//Creation of the Dropdown menu, with the data from
//the column that is specified in the variable menu
function createDropdown(csv_data){
  console.log("createDropdown")
  var distinctMenus = 0
  var str=""
  var menu = ["OriginCountries", "UniqueYear", "Ingoing", "UniqueYear"]
  menu.forEach(function(value, index, array){

      csv = csv_data.filter(function(row){
          return row[value]
      })

      csv.forEach(function(row){
        if(value =="UniqueYear"){
          if (distinctMenus==1){
            str = "#" + value + "2"
          }
          else{
            str = "#" + value
          }
        }
        else{
          str = "#"  +value 
          }
          console.log(str)

          d3.select(str)
            .append("option")
            .attr("label",row[value])
            .attr("id", row[value])
      });
      if(value == "UniqueYear"){
          if(distinctMenus == 0){
              distinctMenus=1;
              str = ""
          }
        }
        console.log("done",str)
        /*
        d3.select(str)
          .append("option")
          .attr("label","")
          .attr("selected", "selected") 
      */
  
     
  } 

     )

  //Preselection (We can use a function) 

  //First country dropdown Selection
    try{
      var thisId = "[id = '" + country +"']"
      var selectString = "" + thisId

      d3.select("#OriginCountries")
        .select(selectString)        
        .attr("selected","selected")
    }
    catch(err){
      console.log("Not exist: ",err)
    }   

  //Second country dropdown Selection

    try{
      var thisId = "[id = '" + country +"']"
      var selectString = "" + thisId

      d3.select("#Ingoing")
        //.append("option")
        .select(selectString)
        .attr("selected","selected")
        //.attr("label",country)
    }
    catch(err){
      console.log("Not exist: ",err)
    }   

  //First year dropdown Selection

    try{
      var thisId = "[id = '" + year +"']"
      var selectString = "" + thisId

      d3.select("#UniqueYear")
        //.selectAll("#option")
        .select(selectString)//("#" + 2010)// + year.toString())
        .attr("selected","selected")
        //.attr("label",year)
    }
    catch(err){
      console.log("Not exist: ",err)
    }

  //Second year dropdown Selection

    try{
      var thisId = "[id = '" + year +"']"
      var selectString = "" + thisId
      d3.select("#UniqueYear2")
        //.append("option")
         .select(selectString)
          .attr("selected","selected")
        //attr("label",year)
      }
      catch(err){
      console.log("Not exist: ",err)
    }

}

//Initialization - global variables
var flag = 0 //flag to define if we draw a barplot for 
                // outgoing or incoming refugees
                //flag=0 => outgoing
                //flag=1 => incoming

//If someone changes the country, the drawBarplot is called
//with input this country and the year that has been selected last
function dropdownSelectionOutgoing(s){
  country = s[s.selectedIndex].id; 
  drawBarplot(country,year, 0) //the third argument is the flag
}

//If someone changes the year, the drawBarplot is called
//with input this year and the country that has been selected last
function dropdownSelectionYearOutgoing(s){
  year = s[s.selectedIndex].id; 
 drawBarplot(country, year, 0) //the third argument is the flag
}

function dropdownSelectionIncoming(s){
  country = s[s.selectedIndex].id; 
  drawBarplot(country,year, 1) //the third argument is the flag
}

//If someone changes the year, the drawBarplot is called
//with input this year and the country that has been selected last
function dropdownSelectionYearIncoming(s){
  year = s[s.selectedIndex].id; 
 drawBarplot(country, year, 1) //the third argument is the flag
}


//return the data for a specific country in a specific year
function getcountriesPerOriginPerYear(data, Origin, Year, flag){

  if (flag==0){
    var fromColumn = "Origin"
    var toColumn = "Country"
  }
  else{
    var fromColumn = "Country"
    var toColumn = "Origin"
  }
  try{
    var countriesPerOrigin = d3.nest()
              .key(function(d) {return d[fromColumn]})
              .key(function(d){ return d.Year})
              .key(function(d) {return d[toColumn]})
              .rollup(function(d) {return d3.sum(d, function(g){return g.Value})})
              .entries(data)
              .filter(function(d){ return d.key == Origin})[0].values
              .filter(function(d){return d.key == Year})[0].values
    console.log(countriesPerOrigin)
   
  countriesPerOrigin.sort(function(a, b){
                                            if(a.values < b.values) return 1;
                                            if(a.values > b.values) return -1;
                                            return 0;
                                        });
    countriesPerOrigin = countriesPerOrigin.slice(0,20);
    var result = []
    for (i=0; i<countriesPerOrigin.length; i++){
      if(countriesPerOrigin.values != "0"){
        result.push(countriesPerOrigin[i]);
      }
    }

    return result; //countriesPerOrigin[0].values.filter(function(d){return d.key == Year})[0].values
  }
  catch(err){
    console.log("Not exist", err)

  }

}

function drawBarplot(Origin, Year, flag){
  if (flag==0){
    svg = svg1
    title = "Outgoing refugees from " + Origin + " in " + Year
  }
  else{
    svg=svg2
    title = "Incoming refugees to " + Origin + " in " + Year

  }

  var yName = "Number of refugees"
  var xName = "Country"
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
  //remove the previous barblot
  svg.selectAll("g").remove() 
  svg.selectAll("text").remove()

  try{  

  var g = svg.append("g")
  //.attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 
      //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");  

   console.log(Origin, Year)
   //Get the data
   var countriesPerOriginPerYear = getcountriesPerOriginPerYear(data, Origin, Year, flag) 

  //  console.log(countriesPerOriginPerYear)

  console.log(countriesPerOriginPerYear)
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
        .attr("x", (width*0.6))             
        .attr("y", 0 - (margin.top - 30))
        .attr("text-anchor", "middle")  
        .attr("class", "title")
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
    var result =  "<big>" + xName + ": " + d.key + "</br>" + 
                  yName + ": " + d.values + "</big>";
    return result;
  }

  function mouseOut(d) {
    tooltip.transition()
           .duration(500)
           .style("opacity", 0);
    d3.select(this).style("fill", "steelblue"); 
  }}
 catch(err){
    svg.selectAll("g").remove()

    console.log("Not defined", err)
  }
};

