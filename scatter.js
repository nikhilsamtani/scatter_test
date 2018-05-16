var SVG_SIZE = {width:700, height:480};
var MARGIN_SIZE = {left:50, bottom:20, top:20, right:50};
var displayWidth = SVG_SIZE.width - MARGIN_SIZE.left - MARGIN_SIZE.right; 
var displayHeight = SVG_SIZE.height - MARGIN_SIZE.bottom - MARGIN_SIZE.top;
var formatNumber = d3.format(",.2f");

var svg = d3.select('#figure1Container')
		.append('svg')
		.attr('height', SVG_SIZE['height'])
		.attr('width', SVG_SIZE['width'])

function groupByVariable(data, variable) {

	var groupedData = d3.nest()
						.key(function(d) { return d['YEAR']; })
						.key(function(d) { return d[variable]; })
						.rollup(function(g) { return d3.sum(g, function(d) { return d['Funding'];} )})
						.map(data)

    var groupedDataArray = []

    Object.keys(groupedData).forEach(function(key) {
    	Object.keys(groupedData[key]).forEach(function(type){
    		if(type != 'Not applicable') {
	    	groupedDataArray.push({"year":key,"type":type,"funding":groupedData[key][type]})    		    			
    		}
	    	});
    	});

    return groupedDataArray;
}

function drawViz(groupedDataArray) {

	var years = [];

	groupedDataArray.forEach(function(item) {
		years.push(item.year);
	})

	years = Array.from(new Set(years));

	var types = [];

	groupedDataArray.forEach(function(item) {
		types.push(item.type)
	})

	types = Array.from(new Set(types));

	var xScale = d3.scale.ordinal()
	        .domain(years)
	        .rangePoints([MARGIN_SIZE.left+20, displayWidth]);

	var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom");

	svg.append("g")
		.attr("class", "x axis")
	    .attr("transform", "translate(0," + displayHeight + ")")
	    .call(xAxis)
	     .append("text")
	      .attr("y", 40)
	      .attr("x",(displayWidth+MARGIN_SIZE.left)/2)
	      .attr("fill","grey")
	      .attr("font-size","13px")
	      .attr("font-weight","bold")
	      .text("Year");

	//y-axis
	var yScale = d3.scale.linear()
	        .domain([0,200])
	        .range([displayHeight,MARGIN_SIZE.bottom]);

	var yAxis = d3.svg.axis()
					.scale(yScale)
				    .ticks(5)
					.orient("left");


	svg.append("g")
	    .attr("class", "y axis")
	    .attr("transform", "translate(" + MARGIN_SIZE.left + ",0)")
	    .call(yAxis)
	    .append("text")
	      .attr("fill","grey")
	      .attr("y",-40)
	      .attr("x",-(displayHeight+MARGIN_SIZE.bottom)/2-50)
	   	  .attr("transform", "rotate(-90)")
	      .attr("font-size","13px")
	      .text("Funding (Million USD)");

	//color scale
	var cScale = d3.scale.category10().domain(types);

	var rScale = d3.scale.linear().domain([0,400]).range([5,15])

	var tooltip = d3.select("body").append("div")
    	.attr("class", "tooltip")
    	.style("opacity", 0);

	//draw circles
	       svg.selectAll('circle').data(groupedDataArray)
	          .enter().append('circle')
	            .attr('cx', d => xScale(d["year"]))
	            .attr('cy', d => yScale(d["funding"]))
	            .attr('fill', d => cScale(d["type"]))
	            .attr('fill-opacity', 0.6)
	            .attr('r', d => rScale(d["funding"]))
	            .on("mouseover", function(d) {
	            	  tooltip.transition()
			               .duration(200)
			               .style("opacity", .9)
			          tooltip.html(d["type"] + ", " + "$" + formatNumber(d["funding"]) + "M")
			               .style("left", (d3.event.pageX) + "px")
			               .style("top", (d3.event.pageY-25) + "px");
			    	  })
			      .on("mouseout", function(d) {
			          tooltip.transition()
			               .duration(500)
			               .style("opacity", 0);
			      });

    //Draw Legend
    var legend = d3.select('#legendContainer')
		    		.append('svg')
		    		.attr('id','legend')
					.attr('height', 300)
					.attr('width', 300)


	var rects =  legend.selectAll('rect').data(types)
    	.enter().append('rect')
    	.attr('x',50)
    	.attr('y',function(d,i) { return 50+i*20})
    	.attr("width", 10)
		.attr("height", 10)
    	.attr('fill', d => cScale(d))
    					

   legend.selectAll('text').data(types)
   		.enter().append('text')
   		.attr('x',70)
    	.attr('y',function(d,i) { return 58+i*20})
    	.attr('font-size','12px')
        .style("text-anchor", "start")
    	.text(function(d) { return d});



}

d3.csv('scatter.csv', function(data) {


//	drawViz(groupByVariable(data, 'Income Group'));
	var groupingMenu = d3.select('#groupingMenu');

	groupingMenu.on('change',function() {
		d3.select('#legend').remove();
		d3.selectAll('circle').remove();
		drawViz(groupByVariable(data, this.value));         
		});



});
  