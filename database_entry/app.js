'use strict';

// Declare app level module which depends on views, and components
angular.module('databaseEntry', [
	'ngRoute',
	'databaseEntry.view',
	'databaseEntry.list',
	'databaseEntry.detail',
	'databaseEntry.service'
])
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.otherwise({redirectTo: '/view'});
	}]);
