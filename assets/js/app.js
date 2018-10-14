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

//Set Initial Axes
function setXAxis(data, xAxis) {
  var xScale = d3.axisBottom(
    updXScale(data, xAxis)
  )
  return xScale
}

function setYAxis(data, yAxis) {
  var yScale = d3.axisLeft(
    updYScale(data, yAxis)
  )
  return yScale 
}

//update Axes upon click
function updateXAxis(newXAxis, xAxis) {
  var bottomAxis = d3.axisBottom(newXAxis)
    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

function updateYAxis(newYAxis, yAxis) {
  var leftAxis = d3.axisLeft(newYAxis)
    yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;

}

function updateYPlots(plotAttr, yLinear, selYAxis) {
  plotAttr.transition()
    .duration(1000)
    .attr("cy", d => yLinear(d[selYAxis]))
  return plotAttr;
}

function updateYPlotText(textAttr, yLinear, selYAxis) {
  textAttr.transition()
    .duration(1000)
    .attr("y", d => yLinear(d[selYAxis]))
  return textAttr;
}

function updateXPlots(plotAttr, xLinear, selXAxis) {
  plotAttr.transition()
    .duration(1000)
    .attr("cx", d => xLinear(d[selXAxis]))
  return plotAttr;
}

function updateXPlotText(textAttr, xLinear, selXAxis) {
  textAttr.transition()
    .duration(1000)
    .attr("x", d => xLinear(d[selXAxis]))
  return textAttr;
}


//Update X Scale when changed
function updXScale(data, xScale) {
  var xLinear = d3.scaleLinear()
  .domain([d3.min(data, min => min[xScale])*minPad, d3.max(data, max => max[xScale])*maxPad])
  .range([0,width]); 
  return xLinear;
}

//Update Y Scale when changed
function updYScale(data, yScale) {
  var yLinear = d3.scaleLinear()
  .domain([d3.min(data, min => min[yScale])*minPad, d3.max(data, max => max[yScale])*maxPad])
  .range([height, 0]); 
  return yLinear;
}

function updateToolTip(selXAxis, selYAxis, plotAttr) {
  //Create ToolTip 
  if (selYAxis === "poverty") {
    var yTTLabel = "In Poverty";
  }
  else if (selYAxis === "income") {
    var yTTLabel = "Median Income";
  }
  else if (selYAxis === "age") {
    var yTTLabel = "Average Age";
  }

  if (selXAxis === "healthcare") {
    var xTTLabel = "Lacking HC";
  }
  else if (selXAxis === "obesity") {
    var xTTLabel = "Obesity Rate";
  }
  else if (selXAxis === "smokes") {
    var xTTLabel = "Smoker Rate";
  }

  var toolTip = d3.tip()
    .attr("class","tooltip")
    .offset([90, -70])
    .html(function(d) {
      if (selYAxis === "income") {
        return (`${d.state}<br>${xTTLabel}: ${d[selXAxis]}% <br>${yTTLabel}: $${d[selYAxis]}`)  
      }
      else if (selYAxis === "age") {
        return (`${d.state}<br>${xTTLabel}: ${d[selXAxis]}% <br>${yTTLabel}: ${d[selYAxis]}`)
      }
      else{
        return (`${d.state}<br>${xTTLabel}: ${d[selXAxis]}% <br>${yTTLabel}: ${d[selYAxis]}%`)  
      }
      
    });
  
  plotAttr.call(toolTip);

  plotAttr.on("mouseover", function(d) {
    toolTip.show(d, this);
  })
  .on("mouseout", function(d, index) {
    toolTip.hide(d);
  });
  return plotAttr
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
  var xLinear = updXScale(riskData, selXAxis)
  var yLinear = updYScale(riskData, selYAxis)

  
  var xAxis = chartRiskData.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(setXAxis(riskData, selXAxis))
  
  var yAxis = chartRiskData.append("g")
    .call(setYAxis(riskData, selYAxis))
  
  var plotGroup = chartRiskData.selectAll("circle")
    .data(riskData)
    .enter()
    .append("circle")
  var plotAttr = plotGroup
    .attr("cx", d => xLinear(d[selXAxis]))
    .attr("cy", d => yLinear(d[selYAxis]))
    .attr("r", "12")
    .attr("class","stateCircle")

  var textGroup = chartRiskData.selectAll("text.labels")
    .data(riskData)
    .enter()
    .append("text")

  var textAttr = textGroup
    .attr("x", d => xLinear(d[selXAxis]))
    .attr("y", d => yLinear(d[selYAxis]))
    .attr("class", "stateText")
    .text(state => state.abbr);

  //Add the Y axis labels - poverty, income, age
  var yLabelsGroup = chartRiskData.append("g")
    .attr("transform", "rotate(-90)")

  var povertyLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .attr("value","poverty")
    .classed("active", true)
    .text("In Poverty (%)");

    
  var incomeLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 25)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .attr("value","income")
    .classed("inactive", true)
    .text("Median Income ($)");

  var ageLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left + 10)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .attr("value","age")
    .classed("inactive", true)
    .text("Age (years)");

  // Add the X axis labels - healthcare, obestity, smokes
  var xLabelsGroup = chartRiskData.append("g")
  .attr("transform", `translate(${width / 2}, ${height + margin.top})`)

  var healthcareLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 30)
    .attr("class", "axisText")
    .attr("value","healthcare")
    .classed("active", true)
    .text("Lacking Healthcare (%)");

    var obesityLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 50)
    .attr("class", "axisText")
    .attr("value","obesity")
    .classed("inactive", true)
    .text("Obesity Rate (%)");

    var smokesLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 70)
    .attr("class", "axisText")
    .attr("value","smokes")
    .classed("inactive", true)
    .text("Smoker Rate (%)");
  
  updToolTip = updateToolTip(selXAxis, selYAxis, plotAttr)

  yLabelsGroup.selectAll("text")
  .on("click", function() {
    var yLabelValue = d3.select(this).attr("value")

    if (yLabelValue !== selYAxis) {
      selYAxis = yLabelValue
      var yLinear = updYScale(riskData, selYAxis)
      yAxis = updateYAxis(yLinear, yAxis)
      plotAttr = updateYPlots(plotAttr, yLinear, selYAxis)
      textAttr = updateYPlotText(textAttr, yLinear, selYAxis)
      updToolTip = updateToolTip(selXAxis, selYAxis, plotAttr)
    };
  
    switch(selYAxis) {
      case "age":
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        break;
      case "income":
        ageLabel
        .classed("active", false)
        .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        break;
      case "poverty":
        ageLabel
        .classed("active", false)
        .classed("inactive", true);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
  }
  });

  xLabelsGroup.selectAll("text")
  .on("click", function() {
    var xLabelValue = d3.select(this).attr("value")
    if (xLabelValue !== selXAxis) {
      selXAxis = xLabelValue
      var xLinear = updXScale(riskData, selXAxis)
      xAxis = updateXAxis(xLinear, xAxis)
      plotAttr = updateXPlots(plotAttr, xLinear, selXAxis)
      textAttr = updateXPlotText(textAttr, xLinear, selXAxis)
      updToolTip = updateToolTip(selXAxis, selYAxis, plotAttr)
      
      switch(selXAxis) {
        case "healthcare":
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          break;
        case "obesity":
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          break;
        case "smokes":
          healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
    }
    };
    // updateAxisText(selXAxis, selYAxis);

    
  });
});

