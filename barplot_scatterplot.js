var viewWidth = 2*window.innerWidth/5;
var viewHeight = 2*window.innerHeight/5;
//d3.select(window).on("resize", resize);
var margin = {top: 20, right: 20, bottom: 20, left: 40}

/*var svg = d3.select("svg"),
    //width = +svg.attr("width") - margin.left - margin.right,
    width = viewWidth - margin.left - margin.right,

    height = +svg.attr("height") - margin.top - margin.bottom;
    console.log(height)
*/
var width = viewWidth - margin.left - margin.right;
var height = viewHeight - margin.top - margin.bottom;

var svg1 = d3.select("#barplotOutgoing") 
var svg2 = d3.select("#barplotIncoming") 

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

var refugeesPath = "data/asylum_seekers_monthly_all_data2.csv";

var data = null //global variable that contains all the dataset
var country = null
var year = null
var kind = null

d3.csv(refugeesPath, function(csv_data){

  var svg1 = createSvg("#barplotOutgoing", 0) 
  var svg2 = createSvg("#barplotIncoming", 1) 


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
            .attr("width", window.innerWidth)//viewWidth + margin.left + margin.right)
            .attr("height", 600)//viewHeight + margin.top + margin.bottom)
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
   
    countriesPerOrigin.sort(function(x, y){
        return d3.descending(x.value, y.value)})

    return countriesPerOrigin; //countriesPerOrigin[0].values.filter(function(d){return d.key == Year})[0].values
  }
  catch(err){
    console.log("Not exist", err)

  }

}

function drawBarplot(Origin, Year, flag){
  if (flag==0){
    svg = svg1
  }
  else{
    svg=svg2
  }
  //remove the previous barblot
  svg.selectAll("g").remove() 

  try{  

  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");  

   console.log(Origin, Year)
   //Get the data
   var countriesPerOriginPerYear = getcountriesPerOriginPerYear(data, Origin, Year, flag) 

  //  console.log(countriesPerOriginPerYear)

  x.domain(countriesPerOriginPerYear.map(function(d) { return d.key; }));
  y.domain([0, d3.max(countriesPerOriginPerYear, function(d) { return d.value; })]);


  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(90)")
      .style("text-anchor", "start");

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(20))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      //.text("Frequency");

  g.selectAll(".bar")
    .data(countriesPerOriginPerYear)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.key); })
      .attr("y", function(d) { console.log(height);return y(d.value); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.value); });
 }
 catch(err){
    svg.selectAll("g").remove()

    console.log("Not defined", err)
  }
};

