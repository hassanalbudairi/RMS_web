// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('d3Service', [])
    .factory('d3Service', function($http){
var _d3Service = function(snr){
d3.selectAll('svg').remove();
var char1_width = $(".chart1").width();
var char1_height = $(".chart1").height();

$http.post('/api/indSnrdb',snr).then(function(res, data){
	if(res.data.success){
		const data = [];
	for (var i in res.data.results){
		const timestamp = res.data.results[i]._id.toString().substring(0,8);
		a = new Date(parseInt(timestamp, 16)*1000);
		const d = a.getDate();// the day
		const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		const m = monthNames[a.getMonth()];//getMonth() starts from zero
		//console.log(d);
		//console.log(m);
		
		const dd = d + '-'.concat(m).toString();
		//console.log(dd);
		data.push({
		date:dd,
		charge:+res.data.results[i].charge,
		sgn:+res.data.results[i].sgn
		});
	}
	return data;
	}
}).then(function(data1){
	data = data1.slice(-10);// chart1 - select only the last 10 elements in the array;
	console.log(data);
//Specify scales for the x and y axes	
var margin = {top: 40, right: 10, bottom: 100, left: 70},
	width = char1_width - margin.left - margin.right,
	height = char1_height - margin.top - margin.bottom;
var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);
//axes
	x.domain(data.map(function(d) { return d.date; }));
	y.domain([0, d3.max(data, function(d) { return d.charge; })]).nice();//.nice() axis values end by rounded numbers
var xAxis = d3.axisBottom(x).tickFormat(function(d){ return d.date;});
var yAxis = d3.axisLeft(y);
var svg = d3.select(".chart1")
        .append("svg")
        .attr("width",char1_width)
		.attr("height",char1_height)
        .append("g")
        .attr("transform", "translate("+ margin.left + "," + margin.top + ")");	
	
	svg.selectAll("rect")
		.data(data)
		.enter()
		.append("rect")
		.attr("height", 0)
		.attr("y", height)
		.attr("width", x.bandwidth())
		.attr("height", function(d){ return height - y(d.charge);})
		.attr("x",function(d){return x(d.date);})
		.attr("y",function(d){return y(d.charge);})
		.attr("fill", "yellow");
// label the bars
	svg.selectAll("text")
		.data(data)
		.enter()
		.append("text")
		.text(function(d) {return d.charge;})
		.attr("x", function(d){return x(d.date) + x.bandwidth()/2;})
		.attr("y", function(d){
		var a = 20;
		if ((height - y(d.charge)) < 20) a = -20;
		return y(d.charge)+ a;})
		.style("fill", "red")
		.style("font-weight", "bold")
		.style("text-anchor", "middle");
		//draw axes
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0,"+height+")")
		.call(d3.axisBottom(x))
		.selectAll("text")
		.attr("dx", "0.5em")
		.attr("dy", "1.0em")
		.style("text-anchor","end")
		.style("font-size", "20px")
		.attr("transform", "rotate(-45)");
	svg.append("g")// graph title
		.attr("class", "axis")
		.style("font-size", "16px")
		.call(yAxis)
		.append("text")
		.attr("dx",(x.bandwidth()/2))
		.attr("dy", "-1em")
		.style("text-anchor","middle")
		.style("font-size", "20px")
		.style("fill", "red")
		.text("Battery charging status");
	svg.append("g")// y axis title
        .attr("class", "axis")
        .append("text")
		.style("fill", "red")
        .text("Relative charging (%)")
        .attr("transform", "translate(-50, 200), rotate(-90)");
		
		
		
		
// signal strength graph
y.domain([0, d3.max(data, function(d) { return d.sgn; })]).nice();
yAxis = d3.axisLeft(y);
var svg2 = d3.select(".chart2")
        .append("svg")
        .attr("width",char1_width)
		.attr("height",char1_height)
        .append("g")
        .attr("transform", "translate("+ margin.left + "," + margin.top + ")");	
	svg2.selectAll("rect")
		.data(data)
		.enter()
		.append("rect")
		.attr("height", 0)
		.attr("y", height)
		.attr("width", x.bandwidth())
		.attr("height", function(d){ return height - y(d.sgn);})
		.attr("x",function(d){return x(d.date);})
		.attr("y",function(d){return y(d.agn);})
		.attr("fill", "yellow");
// label the bars
	svg2.selectAll("text")
		.data(data)
		.enter()
		.append("text")
		.text(function(d) {return d.sgn;})
		.attr("x", function(d){return x(d.date) + x.bandwidth()/2;})
		.attr("y", function(d){
		a = 20;
		if ((height - y(d.sgn)) < 20) a = -20;
		return y(d.sgn)+ a;})
		.style("fill", "red")
		.style("font-weight", "bold")
		.style("text-anchor", "middle");
		//draw axes
	svg2.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0,"+height+")")
		.call(d3.axisBottom(x))
		.selectAll("text")
		.attr("dx", "0.5em")
		.attr("dy", "1.0em")
		.style("text-anchor","end")
		.style("font-size", "20px")
		.attr("transform", "rotate(-45)");
	svg2.append("g")// graph title
		.attr("class", "axis")
		.style("font-size", "16px")
		.call(yAxis)
		.append("text")
		.attr("dx",(x.bandwidth()/2))
		.attr("dy", "-1em")
		.style("text-anchor","middle")
		.style("font-size", "20px")
		.style("fill", "red")
		.text("GSM signal status");
	svg2.append("g")// y axis title
        .attr("class", "axis")
        .append("text")
		.style("fill", "red")
        .text("GSM signal strength")
        .attr("transform", "translate(-50, 200), rotate(-90)");
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		});
		};
return {
	d3Service: _d3Service
};
});
