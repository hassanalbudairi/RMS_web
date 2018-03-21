// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gService', [])
    .factory('gService', function($http){
	var _googleMapService = function(a){
// If map has not been created already...
if (!map){
// Create a new map and place in the index.html page
var mapOptions = {
	zoom: 8,
	center: {lat:56.4907,lng:-4.2026},
//Add dropdwon menu to change the map style
	mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_CENTER
    }
	};
    var map = new google.maps.Map(document.getElementById('map'),mapOptions);	
	if (a !== null){
			map.setCenter(new google.maps.LatLng(a.lat, a.lng));
			map.setZoom(16);
		};
}
//Get locations coordinates from db.
var locations = [];
$http.get('/api/snrslst')
	.then(function(data){
	if(data.data.success){	
	for (var i in data.data.data){
		locations.push({
		lat: + data.data.data[i].lat,
		lng: + data.data.data[i].lng,
		snrid: + data.data.data[i]._id,
		message: new google.maps.InfoWindow({
                        content: data.data.data[i].loc,
                        maxWidth: 320
                    }),
	});
	};
//add Markers
var markers =[];
locations.forEach(function(n, i){
	var marker =  new google.maps.Marker({
            position: {lat:n.lat,lng:n.lng},
			map: map,
            label: "S"+n.snrid
		  });  
 // For each marker created, add a listener that checks for mouseover and mouseout
        google.maps.event.addListener(marker,'mouseover',function(e){
		n.message.open(map, marker);
        });
		google.maps.event.addListener(marker,'mouseout',function(e){
		n.message.close(map, marker);
		});
		markers.push(marker);
    });
	// Add a marker clusterer to manage the markers.
        var markerCluster = new MarkerClusterer(map, markers,
        {imagePath:'assets/images/m'});
	}else{
		//Add something here
	}
});
};
return{
	googleMapService: _googleMapService
};
});

