angular.module('userServices',[])
.factory('User', function($http){
	userFactory = {};
	//User.create(regData)
	userFactory.create = function(regData){
		return $http.post('/api/addUser', regData);
	}
	return userFactory;
});
