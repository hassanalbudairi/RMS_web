// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('d3Service', [])
    .factory('d3Service', function($http){
var _d3Service = function(snr){
d3.selectAll('svg').remove();
var char1_width = $(".chart1").width();
var char1_height = $(".chart1").height();
//read collection name
// Parse the date / time
var	parseDate = d3.time.format("%b-%y");
function format(str){
var a = str.toString();
var b = a.slice(0,2)+'-'.concat(a.slice(2,4))+'-'.concat(a.slice(4,8));
return b;
}

$http.post('/api/indSnrdb',snr).then(function(res, data){
	if(res.data.success){
		var data = [];
	for (var i in res.data.results){
		var timestamp = res.data.results[i]._id.toString().substring(0,8);
		a = new Date(parseInt(timestamp, 16)*1000);
		var b = a.getDate();
		if (b < 10) b = '0' + a.getDate();
		var c = a.getMonth()+1;//getMonth() starts from zero
		if (c < 10) c =  '0' + (a.getMonth()+1);
		var d = a.getFullYear();
		var dd = '' + b + c + d;
		data.push({
		date:+dd,
		charge:+res.data.results[i].charge
		});
	}
	return data;
	}
}).then(function(data1){
// chart1 - select only the last 10 elements in the array;
data = data1.slice(-10);
var margin = {top: 40, right: 10, bottom: 100, left: 70},
		width = char1_width - margin.left - margin.right,
		height = char1_height - margin.top - margin.bottom;

// Specify scales for the x and y axes		
var xScale = d3.scale.ordinal()
		.domain(data.map(function(d){return format(d.date);}))
		.rangeRoundBands([0, width], 0.2, 0.2);
var yScale = d3.scale.linear()
		.domain([0, d3.max(data, function(d){ return d.charge; })]).nice()   // .nice() make axis end in round number    
		.range([height, 0]);
//axes 
var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom");
var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.ticks(10, ".%");
		// draw bars
	
var svg = d3.select(".chart1")
        .append("svg")
        .attr({
		"width" : char1_width,
		"height" : char1_height
		})
        .append("g")
        .attr("transform", "translate("+ margin.left + "," + margin.top + ")");	
	svg.selectAll("rect")
		.data(data)
		.enter()
		.append("rect")
		.attr("height", 0)
		.attr("y", height)
		.attr({
		"width": xScale.rangeBand(),
		"height": function(d){ return height - yScale(d.charge);},
		"x":function(d){return xScale(format(d.date));},
		"y":function(d){return yScale(d.charge);},
		"fill": "yellow"
	});
// label the bars
	svg.selectAll("text")
		.data(data)
		.enter()
		.append("text")
		.text(function(d) {return d.charge;})
		.attr("x", function(d){return xScale(format(d.date)) + xScale.rangeBand()/2;})
		.attr("y", function(d)
		{
		var a = 20;
		if ((height - yScale(d.charge)) < 20) a = -20;
		return yScale(d.charge)+ a;})
		.style("fill", "red")
		.style("font-weight", "bold")
		.style("text-anchor", "middle");
//draw axes
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0,"+height+")")
		.call(xAxis)
		.selectAll("text")
		.attr("dx", "-0.2em")
		.attr("dy", "1.0em")
		.style("text-anchor","end")
		.style("font-size", "20px")
		.attr("transform", "rotate(-45)");
	svg.append("g")// graph title
		.attr("class", "axis")
		.call(yAxis)
		.append("text")
		.attr({
		"dx": "8em",
		"dy": "-1em"
		})
		.style("text-anchor","middle")
		.style("font-size", "20px")
		.text("Battery charging status");
	svg.append("g")// y axis title
        .attr("class", "axis")
        .append("text")
        .text("Relative charging (%)")
        .attr("transform", "translate(-50, 200), rotate(-90)");

		});
		};
return {
	d3Service: _d3Service
};
});
