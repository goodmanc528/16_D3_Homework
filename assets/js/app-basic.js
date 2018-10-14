// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 150,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
var minPad = 0.9
var maxPad = 2-minPad

// Create an SVG wrapper
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append SVG group to wrapper
var chartRiskData = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.right})`);

//select initial plots
var selXAxis = "healthcare"
var selYAxis = "poverty"

//Update X Scale when changed
function updXScale(riskData, selXAxis) {
  var xLinear = d3.scaleLinear()
  .domain([d3.min(riskData, min => min[selXAxis])*minPad, d3.max(riskData, max => max[selXAxis])*maxPad])
  .range([0,width]); 
  return xLinear;
}

//Update X-Axis variable when new a label is selected
function updXVar(riskData, selXAxis) {
  var bottomAxis = d3.axisBottom()
}


d3.csv("./assets/data/data.csv").then(function(riskData) {
  riskData.forEach(function(data) { //parse the data being compared - healthcare v. poverty
    data.obesity = +data.obesity
    data.smokes = +data.smokes
    data.healthcare = +data.healthcare;

    data.poverty = +data.poverty
    data.income = +data.income
    data.age = +data.age;

    })

  //set the X and Y scales
  var xLinear = d3.scaleLinear()
    .domain([d3.min(riskData, min => min.healthcare)*minPad, d3.max(riskData, max => max.healthcare)*maxPad])
    .range([0,width]) 
  var yLinear = d3.scaleLinear()
    .domain([d3.min(riskData, min => min.poverty)*minPad, d3.max(riskData, max => max.poverty)*maxPad])
    .range([height,0])


  var setXAxis = d3.axisBottom(xLinear)
  var setYAxis = d3.axisLeft(yLinear)
  
  chartRiskData.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(setXAxis)
  
  chartRiskData.append("g")
    .call(setYAxis)
  
  var plotGroup = chartRiskData.selectAll("circle")
    .data(riskData)
    .enter()
    .append("circle")
  var plotAttr = plotGroup
    .attr("cx", d => xLinear(d.healthcare))
    .attr("cy", d => yLinear(d.poverty))
    .attr("r", "15")
    .attr("fill", "blue")
    .attr("opacity", ".5");

  var textGroup = chartRiskData.selectAll("text.labels")
    .data(riskData)
    .enter()
    .append("text")

  var textAttr = textGroup
    .attr("x", d => xLinear(d.healthcare)-10)
    .attr("y", d => yLinear(d.poverty)+5)
    .attr("fill", "pink")
    .attr("font-size", "12px")
    .attr("font-family","sans-serif")
    .text(state => state.abbr);

  //Add the Y axis labels - poverty, income, age  
  chartRiskData.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .classed("active", true)
    .text("In Poverty (%)");

    chartRiskData.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 25)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .classed("inactive", true)
    .text("Median Income");

    chartRiskData.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 10)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .classed("inactive", true)
    .text("Age (years)");

  // Add the X axis labels - healthcare, obestity, smokes
  chartRiskData.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
    .attr("class", "axisText")
    .classed("active", true)
    .text("Lacking Healthcare (%)");

  chartRiskData.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 45})`)
    .attr("class", "axisText")
    .classed("inactive", true)
    .text("Obesity (%)");

   chartRiskData.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 60})`)
    .attr("class", "axisText")
    .classed("inactive", true)
    .text("Smokes (%)");

  //Create ToolTip
  var toolTip = d3.tip()
    .attr("class","tooltip")
    .offset([90, -70])
    .html(function(d) {
      return (`${d.state}<br>Lacking Healthcare (%): ${d.healthcare} <br>In Poverty: ${d.poverty}%`)
    });
  
  chartRiskData.call(toolTip);

  plotGroup.on("mouseover", function(d) {
    toolTip.show(d, this);
  })
  .on("mouseout", function(d, index) {
    toolTip.hide(d);
  }); 
})  