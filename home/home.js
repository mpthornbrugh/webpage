'use strict';

angular.module('homePage.home', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/home', {
			templateUrl: 'home/homeView.html',
			controller: 'HomeViewCtrl'
		});
	}])

	.controller('HomeViewCtrl', ['$scope', '$window', function ($scope, $window) {
		$scope.goto = function (where) {
			if (where == 'database') {
				$window.location.href = 'database_entry/index.html';
			}
			else if (where == 'viewer') {
				$window.location.href = 'histViewer/index.html';
			}
		}
	}]);