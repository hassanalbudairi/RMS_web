angular.module('userControllers',['authServices','geolocation','gService', 'd3Service'])
/***********************************************************************************************************************/
/********************************************* REGISTER USERS CTRL ************************************************************/
/*********************************************************************************************************************/
.controller('regCtrl', function($http, $location, $timeout){
	var app = this;
	app.users = function(regData,e){
	var clk = e.target.getAttribute('data-value');
	//Add
	if (clk === 'add'){
	app.lst = app.successMsg = app.errorMsg = false;
	$http.post('/api/addUser',app.regData).then(function(data){
	if(data.data.success){
		app.successMsg = data.data.message;
	}else{
		app.errorMsg = data.data.message
	}
	});
	}
	//Load
	if (clk === 'load'){
	app.lst = app.successMsg = app.errorMsg = false;
	$http.post('/api/usersList')
	.then(function(data){
	if(data.data.success){
		app.successMsg = data.data.message;
		app.lst = data.data.data
	}else{
		app.errorMsg = data.data.message
	}
	});
	}
	//Find
	if (clk === 'find'){
	app.lst = app.successMsg = app.errorMsg = false;
	if (! app.regData || ! app.regData.id){
	app.errorMsg = 'Please provide user ID';
	return
	}else{
	$http.post('/api/findUser',app.regData)
	.then(function(data){
	if(data.data.success){
		app.successMsg = data.data.message;
		app.regData.id = data.data.data._id;
		app.regData.fname = data.data.data.fname;
		app.regData.lname = data.data.data.lname;
		app.regData.simNu = data.data.data.simNu;
		app.regData.email = data.data.data.email;
		app.regData.password = data.data.data.password;
		app.regData.role = data.data.data.role;
	}else{
		app.errorMsg = data.data.message
	}
	});
	}
	}
	//Update
	if (clk === 'update'){
	app.lst = app.successMsg = app.errorMsg = false;
	$http.post('/api/updateUser',app.regData).then(function(data){
	if(data.data.success){
		app.successMsg = data.data.message
	}else{
		app.errorMsg = data.data.message
	}
	});
	}
	//Delete
	if (clk === 'delete'){
	app.lst = app.successMsg = app.errorMsg = false;
	if (! app.regData || ! app.regData.id){
	app.errorMsg = 'Please provide the ID of the user';
	return
	}else{
	$http.post('/api/deleteUser',app.regData)
	.then(function(data){
	if(data.data.success){
		app.successMsg = data.data.message;
	}else{
		app.errorMsg = data.data.message
	}
	});
	}
	}
	}	
})
/***********************************************************************************************************************/
/********************************************* SENSORS CTRL ************************************************************/
/*********************************************************************************************************************/
.controller('snrslstCtrl', function($http,gService){
var app = this;
app.locationss = [];
app.lst = app.successMsg = app.errorMsg = false;
	$http.get('/api/snrslst')
	.then(function(data){
	if(data.data.success){
		app.successMsg = data.data.message;
		app.lst = data.data.data;
	for (var i in data.data.data){
		app.locationss.push({
		lat: + data.data.data[i].lat,
		lng: + data.data.data[i].lng,
	});
	}
	}else{
		app.errorMsg = data.data.message
	}
});
var a = null;
gService.googleMapService(a);
})

.controller('editSnrsCtrl', function($http, $location, $window, gService){
	$window.location.reload;
	var app = this;
	var a = null;
	gService.googleMapService(a);
	app.snrs = function(regData,e){
	var clk = e.target.getAttribute('data-value');
	//Add
	if (clk === 'add'){
	app.lst = app.successMsg = app.errorMsg = false;
	$http.post('/api/addsnrs',app.regData).then(function(data){
	if(data.data.success){
		app.successMsg = data.data.message
	}else{
		app.errorMsg = data.data.message
	}
	});
	}
	//Find
	if (clk === 'find'){
	app.lst = app.successMsg = app.errorMsg = false;
	if (! app.regData || ! app.regData.id){
	app.errorMsg = 'Please provide sensor ID';
	return
	}else{
	$http.post('/api/findsnr',app.regData)
	.then(function(data){
	if(data.data.success){
		app.successMsg = data.data.message;
		app.regData.id = data.data.data._id;
		app.regData.lat = data.data.data.lat;
		app.regData.lng = data.data.data.lng;
		app.regData.simNu = data.data.data.simNu;
		app.regData.loc = data.data.data.loc;
	}else{
		app.errorMsg = data.data.message
	}
	});
	}
	}
	//Update
	if (clk === 'update'){
	app.lst = app.successMsg = app.errorMsg = false;
	$http.post('/api/updatesnr',app.regData).then(function(data){
	if(data.data.success){
		app.successMsg = data.data.message
	}else{
		app.errorMsg = data.data.message
	}
	});
	}
	//Delete
	if (clk === 'delete'){
	app.lst = app.successMsg = app.errorMsg = false;
	if (! app.regData || ! app.regData.id){
	app.errorMsg = 'Please provide senosr ID';
	return
	}else{
	$http.post('/api/deletesnr',app.regData)
	.then(function(data){
	if(data.data.success){
		app.successMsg = data.data.message;
		app.regData = null;
	}else{
		app.errorMsg = data.data.message
	}
	});
	}
	}
	}	
})
/***********************************************************************************************************************/
/********************************************* LOGIN CTRL ************************************************************/
/*********************************************************************************************************************/
.controller('loginCtrl',function(Auth,$http,$location,$window,$route,$timeout,$rootScope){
	var usr = this;
	$rootScope.$on('$routeChangeStart',function(){
	if (Auth.isLoggedIn()){
		//get current user info
		usr.isLoggedin = true;
		Auth.getUser().then(function(data){
		if(data.data.message ==='Invalid token'){
	$window.localStorage.removeItem('token');
	$timeout(function() {
	$window.location.href = '/';
	$window.location.reload;
	 }, 100);
		}
		else{
		usr.fname=data.data.fname;
		usr.lname=data.data.lname;
		usr.role=data.data.role;
		}
		});
	}else{
		usr.isLoggedin = false;
	}
	});	
	usr.user = function(usrData){
	usr.successMsg = usr.errorMsg = false;
	$http.post('/api/auth',usr.usrData).then(function(data){
	if(data.data.success){
		usr.successMsg = data.data.token;
		$window.localStorage.setItem('token',data.data.token);
		$window.location.href = '/';//allows to redirect and refresh the whole page
		$window.location.reload;
	}else{
		usr.errorMsg = data.data.message
	}
	});
	}
	
})
.controller('logoutCtrl',function($route,$location,$window,$timeout){
	$window.localStorage.removeItem('token');
	$timeout(function() {
	$window.location.href = '/';
	$window.location.reload;
	 }, 100);
})
//------------------edit sensor list page controller
.controller('sensorslist', function($http,d3Service, gService){
	var app = this;	 
	app.lst = app.successMsg = app.errorMsg = false;
	$http.get('/api/snrslst')
	.then(function(data){
	if(data.data.success){
		app.lst = data.data.data
	}else{
		app.errorMsg = data.data.message
	}
	var a = null;
	gService.googleMapService(a);
	app.snrs = function(snrid,e){
		d3Service.d3Service(app.snrid);
		gService.googleMapService(app.snrid);
	}
});
})
/***********************************************************************************************************************/
/********************************************* WARNINGS CTRL ************************************************************/
/*********************************************************************************************************************/
.controller('warnings', function($http,$window,gService,$timeout,$location){
	var app = this;
	app.sts =['Active','Inspection','Fixed']; 
	app.lst2 = app.lst3 = app.successMsg = app.errorMsg = app.errorMsg2 = app.errorMsg3 = false;
	app.lst = [];
$http.get('/api/warnings')
	.then(function(data){
	if(data.data.success){
		app.lst = data.data.data
	}else{
		app.errorMsg = data.data.message
	}
	});
$http.get('/api/snrslst')
	.then(function(data){
	if(data.data.success){
		app.lst2 = data.data.data
	}else{
		app.errorMsg2 = data.data.message
	}
	});
	var a = null;
gService.googleMapService(a);

app.snrs = function(snrid,e){
	app.lst3 = app.errorMsg3 = false;
	gService.googleMapService(app.snrid);
	//load photos
$http.post('/api/photoswrns',app.snrid).then(function(data){
	if(data.data.success){
	app.lst3 = data.data.data;
	app.errorMsg3 = data.data.message;
	}
	else app.errorMsg3 = data.data.message;
	});
	//upload photos
	app.upload=function(data){
		$http.post('/api/uploadphotos',app.data).then(function(data){
	if(data.data.success) app.successMsg = data.data.message;
	else app.errorMsg = data.data.message;
		});
	}
	}
//temp to add data to warnings db
app.add = function(data){
$http.post('/api/addwarnings',app.data).then(function(data){
app.successMsg = data.data.message;
});
}
//warnings action	
app.action = function(wrn){
app.lst4 = wrn;
$window.ScopeToShare = app;
$timeout(function(){
	newpath= $location.$$path.slice(0,15).concat('action');
window.open(newpath,'newwindow','left=0,top=0,width=400,height=250,toolbar=no,menubar=no,scrollbars=yes,status=no,location=no');
	/*
var Newwindow = $window.open('app/action.html','newwindow','left=0,top=0,width=400,height=250,toolbar=no,menubar=no,scrollbars=yes,status=no,location=no');*/	
}, 200);
};
})
/***********************************************************************************************************************/
/********************************************* ACTION CTRL ************************************************************/
/*********************************************************************************************************************/
.controller('actions', function($window,$http,Auth){
ParentScope = $window.opener.ScopeToShare;//had problems with sharing $scope between child and parent window
var app2 = this;
app2.lt4 = ParentScope.lst4;
var d ={};
app2.successMsg =app2.lst = app2.photos = false;
//get the first and last photo from the photodb for this sensor

$http.post('/api/photoswrns',app2.lt4).then(function(photos){
	app2.photos = photos.data.data;
});

var a = app2.lt4.simNu.toString().slice(-5);
var b = app2.lt4.createdAt.toString().replace(':','').replace(':','').split(".")[0];
d.filename = 'W'.concat(a).concat('-').concat(b);
$http.post('/api/indwarns',d).then(function(results){
	app2.successMsg = results.data.success;
	app2.lst =results.data.results;
	});
app2.eidt =false;
app2.editAction = function(){	
//create an action db for each accident/ named by snr id and the date of accident
app2.edit=true;
app2.add = function(data){
Auth.getUser().then(function(data){	
		d.fname=data.data.fname;
		d.lname=data.data.lname;
		d.role=data.data.role;
	}).then (function(){
//create a warning database and name it W.simNu.slice(8)Date of warning
	d.msg = app2.data.msg;
	d.stat = app2.data.act;
	d.simNu = app2.lt4.simNu;
	d.snr_id = app2.lt4.snr_id;
	d.createdAt = app2.lt4.createdAt;
	//update status in warningsdb
	if(app2.data.act != null){
	$http.post('/api/updatewarnings',d).then(function(res){
	app2.successMsg = res.data.message;
	});
	}
	//add data to individual warning db
	$http.post('/api/action',d).then(function(res){
	app2.successMsg = res.data.message;
	});

});
}
}
})
/***********************************************************************************************************************/
/********************************************* SMS CTRL ************************************************************/
/*********************************************************************************************************************/
.controller('messages', function($http,$window){
var app = this;
app.lst2=false;
$http.get('/api/snrslst')
	.then(function(data){
	if(data.data.success){
		app.lst2 = data.data.data;
		app.successMsg = data.data.message
	}else{
		app.errorMsg = data.data.message
	}
	});
app.send= function(data){
$http.post('/api/twiliosms',app.data)
	.then(function(data){
	if(data.data.success){
		app.successMsg = data.data.message
	}else{
		app.errorMsg = data.data.message
	}
	});	
	}
app.clear =function(){
	$window.location.href = '/sms';
	$window.location.reload;
	
}
});