'use strict';

// Declare app level module which depends on views, and components
angular.module('tljs', [
	'ngRoute',
	'tljs.home',
	'tljs.about',
	'tljs.blog',
	'tljs.blog.detail'
])
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.otherwise({redirectTo: '/home'});
	}]);
