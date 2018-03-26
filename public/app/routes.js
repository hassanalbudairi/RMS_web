var app = angular.module('appRoutes',['ngRoute'])
.config(function($routeProvider, $locationProvider) {
    $routeProvider
    // Route: Home             
        .when('/', {
        templateUrl: 'app/views/pages/home.html'
    })
	// Route: About
    .when('/about', {
        templateUrl: 'app/views/pages/about.html'
	})
	//contact
	.when('/contact', {
        templateUrl: 'app/views/pages/contact.html'
	})
	//Sensors list
	.when('/rmsMonitoring/listSensors', {
        templateUrl: 'app/views/pages/snrsLst.html',
		controller: 'snrslstCtrl',
		controllerAs: 'snrlst',
		authonticated: true
	})
	//Edit sensors list
	.when('/rmsMonitoring/editlist', {
        templateUrl: 'app/views/pages/editlist.html',
		controller: 'editSnrsCtrl',
		controllerAs: 'editsnrs',
		authonticated: true
	})
	//Monitor Individual Sensor
	.when('/rmsMonitoring/monitorSensors', {
        templateUrl: 'app/views/pages/mntIndSnr.html',
		controller: 'sensorslist',
		controllerAs: 'snrslst',
		authonticated: true
	})
	//Warnings
	.when('/rmsMonitoring/warnings', {
        templateUrl: 'app/views/pages/warnings.html',
		controller: 'warnings',
		controllerAs: 'wrngs',
		authonticated: true
	})
	//register users
	.when('/register', {
        templateUrl: 'app/views/users/register.html',
		controller: 'regCtrl',
		controllerAs: 'register',
		authonticated: true
	})
	//login
	.when('/login', {
        templateUrl: 'app/views/users/login.html'
		//authonticated: false
	})
	.when('/logout', {
		templateUrl: 'app/views/users/logout.html',
        controller: 'logoutCtrl',
		authonticated: true
	})
	
	.when('/rmsMonitoring/action', {
		templateUrl: 'app/views/pages/action.html',
        controller: 'actions',
		controllerAs: 'acts',
		authonticated: true
	})
	
	.when('/sms', {
		templateUrl: 'app/views/pages/sms.html',
        controller: 'messages',
		controllerAs: 'sms',
		authonticated: true
	})
	
.otherwise({ redirectTo: '/' });
$locationProvider.html5Mode({ enabled: true, requireBase: false }); // Required to remove AngularJS hash from URL (no base is required in index file)
});
//here is on
app.run(['$rootScope','Auth','$location','$window', function($rootScope, Auth, $location, $window){
$rootScope.$on('$routeChangeStart', function(event, next, current){
	if(next.$$route.authonticated == true){
		if (!Auth.isLoggedIn()){
		event.preventDefault();
		//$location.path('/');
		//var myWindow = window.open("", "MsgWindow", "width=200,height=100");
		//myWindow.document.write("<p>Login is required</p>");
		$("#divpopup").dialog({
		width: 250,
		height:200,
		modal: true,
		buttons:{
			Close:
			function(){
			$(this).dialog('close');
			}
		},
		close: function(event){
		$location.path('/login');
		$rootScope.$apply();
		}
		});
		}
	}
});	
	
}]);