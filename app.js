'use strict';

// Declare app level module which depends on views, and components
angular.module('homePage', [
	'ngRoute',
	'homePage.home'
])
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.otherwise({redirectTo: '/home'});
	}]);
