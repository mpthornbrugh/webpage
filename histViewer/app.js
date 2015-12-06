'use strict';

angular.module('histViewer', [
	'ngRoute',
	'histViewer.main',
	'histViewer.service'
])
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.otherwise({redirectTo: '/main'});
	}]);
