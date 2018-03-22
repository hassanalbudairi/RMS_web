//import all controllers and every angularjs file
angular.module('userApp',['appRoutes','userControllers','authServices','gService','d3Service'])
.config(function($httpProvider){
$httpProvider.interceptors.push('AuthInterceptors');	
});