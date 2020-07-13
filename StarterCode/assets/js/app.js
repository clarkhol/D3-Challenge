var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  //.select(".chart")
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obese";

// function used for updating x-scale var upon click on axis label
function xScale(hairData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(hairData, d => d[chosenXAxis]) - (.10 * d3.min(hairData, d => d[chosenXAxis])),
      d3.max(hairData, d => d[chosenXAxis])
    ])
    .range([0, width]);
	
  return xLinearScale;

}

function yScale(hairData, chosenYAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    //.domain([d3.min(hairData, d => d[chosenYAxis]),
	.domain([0,
      d3.max(hairData, d => d[chosenYAxis])
    ])
    .range([height, 0]);
  
  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newXScale, yAxis) {
  var leftAxis = d3.axisLeft(newXScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

function renderAxes(newXScale, xAxis, newYScale, yAxis) {
	var bottomAxis = d3.axisBottom(newXScale);

	xAxis.transition()
		.duration(1000)
		.call(bottomAxis);
	
	var leftAxis = d3.axisLeft(newYScale);

	yAxis.transition()
		.duration(1000)
		.call(leftAxis);
		
	return xAxis, yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
	
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
	
  return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
	
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "In Poverty (%)";
  }
  else if (chosenXAxis === "poverty") {
	label = "Household Income (Median)";
  }
  else {
    label = "Age (Median)";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(hairData, err) {
  if (err) throw err;

  // parse data
  hairData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
	
	data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(hairData, chosenXAxis);

  // Create y scale function
  //var yLinearScale = d3.scaleLinear()
  //  .domain([0, d3.max(hairData, d => d.obesity)])
  //  .range([height, 0]);
  var yLinearScale = yScale(hairData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  // chartGroup.append("g")
  //  .call(leftAxis);
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0, 0)`)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(hairData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    //.attr("cy", d => yLinearScale(d.obesity))
	.attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "#89bdd3")
	.attr("stroke", "#e3e3e3");
    //.attr("opacity", ".5");
	
  texts = circlesGroup.append("text")
	.text(function(d){d["abbr"]})
	.attr("font-family",  "Courier")
	.attr("fill", "black")
	.style("opacity", "1")
	.attr("font-size", "0.8em")
	.attr("text-anchor",  "middle");

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");
	
  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");
	

  var labelsYGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)", `translate(${width + 20}, ${height / 2})`);
	
  var obeseLabel = labelsYGroup.append("text")
    .attr("x", -200)
    .attr("y", -80)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obese (%)");

  var smokesLabel = labelsYGroup.append("text")
    .attr("x", -200)
    .attr("y", -60)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");
	
  var healthLabel = labelsYGroup.append("text")
    .attr("x", -200)
    .attr("y", -40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  // append y axis
  //chartGroup.append("text")
  //  .attr("transform", "rotate(-90)")
  //  .attr("y", 0 - margin.left)
  //  .attr("x", 0 - (height / 2))
  //  .attr("dy", "1em")
  //  .classed("aText", true)
  //  .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup;// = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
		console.log("X", value);
        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(hairData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);
		
		//yLinearScale = yScale(hairData, chosenYAxis);
		//yAxis = renderYAxes(yLinearScale, yAxis);
		
		//xAxis, yAxis = renderAxes(xLinearScale, xAxis, yLinearScale, yAxis);
		
        // updates circles with new x values
        //circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
		circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        // TBD circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
		  incomeLabel
		    .classed("active", false)
            .classed("inactive", true);
        }
		else if (chosenXAxis === "income") {
		  ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
		  incomeLabel
		    .classed("active", true)
            .classed("inactive", false);
		}
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
		  incomeLabel
		    .classed("active", false)
            .classed("inactive", true);
        }
      }
	  
    });
	
	
	labelsYGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
		console.log("Y", value);
        // replaces chosenXAxis with value
        chosenYAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
		yLinearScale = yScale(hairData, chosenYAxis);

        // updates x axis with transition
		yAxis = renderYAxes(yLinearScale, yAxis);
		
		//xLinearScale = xScale(hairData, chosenXAxis);
        //xAxis = renderAxes(xLinearScale, xAxis);
		
		//xAxis, yAxis = renderAxes(xLinearScale, xAxis, yLinearScale, yAxis);

        // updates circles with new x values
        //circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
		circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        // TBD circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
		  healthLabel
		    .classed("active", false)
            .classed("inactive", true);
        }
		else if (chosenYAxis === "smokes") {
		  obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
		  healthLabel
		    .classed("active", false)
            .classed("inactive", true);
		}
        else {
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
		  healthLabel
		    .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
	
}).catch(function(error) {
  console.log(error);
});
