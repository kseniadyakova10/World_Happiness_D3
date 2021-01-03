// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 620;

var margin = {
    top:20,
    right:40,
    bottom:200,
    left:100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//svg wrapper, group that holds chart
var chart = d3.select("#scatter")
    .append("div")
    .classed("chart", true);

var svg = chart.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "freedom";

//function for scaleLinear for x-axis
function xScale(happyData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(happyData, d => d[chosenXAxis]) * 0.8,
        d3.max(happyData, d => d[chosenXAxis]) * 1.2
    ])
        .range([0, width]);
    return xLinearScale;
}

//function for axis rendering
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;
}

//function that re-draws all the circles that hold data w/ new data for chosen axis
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

//function for text abreviation inside the circles
function renderText(textGroup, newXScale, chosenXAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));

    return textGroup;
}

//function for updating toolTip base on the selected x axis
function updateToolTip(chosenXAxis, circlesGroup) {

    var label;

    if (chosenXAxis === "freedom") {
        label = "Freedom score: ";
    }
    else {
        label = "GDP Score: ";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-19, 0])
        .html(function(d) {
            return(`${d.country}<br>${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", toolTip.show).on("mouseout", toolTip.hide);
    
    return circlesGroup;
}

//load csv and execute all functions

d3.csv("assets/data/data.csv").then(function (happyData, err) {
    if (err) throw err;
    //log data
    console.log(happyData);

    //parse data
    happyData.forEach(function(data) {
        data.score = +data.score;
        data.freedom = +data.freedom;
        data.gdp = +data.gdp;
    });

    //create xlinearScale with xScale fucntion
    var xLinearScale = xScale(happyData, chosenXAxis);

    //create yLinearScale
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(happyData, d => d.score)])
        .range([height, 0]);
    
    //intial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform",  `translate(0, ${height})`)
        .call(bottomAxis);

    //append y axis
    chartGroup.append("g")
        .call(leftAxis);

    //append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(happyData)
        .enter()
        .append("circle")
        .classed("countryCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.score))
        .attr("r", 14)
        //.attr("fill", "blue")
        .attr("opacity", ".5");

    //append initial text
    var textGroup = chartGroup.selectAll(".countryText")
        .data(happyData)
        .enter()
        .append("text")
        .classed("countryText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d.score))
        .attr("dy", 3)
        .attr("font-size", "10px")
        .text(function(d) {
            return d.abrr
        });

    //create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 10 + margin.top})`);

    var freedomScore = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "freedom")
        .classed("active", true)
        .text("World Happiness Report Freedom Score");

    var gdpScore = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "gdp")
        .classed("inactive", true)
        .text("World Happiness Report GDP score");

    //append y-axis label
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Countrie's Happiness score");

    //add tooltip to cirles
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    //create event listener on "click" events on text elements(labels)
    labelsGroup.selectAll("text")
        .on("click", function() {

            //get value of selection
            var value = d3.select(this).attr("value");

            if (value != chosenXAxis){

                //replace chosenXAxis w/ value
                chosenXAxis = value;

                //create new scale for x-axis
                xLinearScale = xScale(happyData, chosenXAxis);

                //update x-axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                //update circles with new values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                //update circle text
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis);

                //update tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);


                //change classes to change bold text
                if (chosenXAxis === "freedom") {
                    freedomScore
                        .classed("active", true)
                        .classed("inactive", false);

                    gdpScore
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    freedomScore
                        .classed("active", false)
                        .classed("inactive", true)

                    gdpScore
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }

        });

}).catch(function (error) {
    console.log(error);
});