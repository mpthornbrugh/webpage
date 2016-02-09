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
			else if (where == '565_mini_1') {
				$window.location.href = '565_Projects/Mini_Project_1/index.html';
			}
		}
	}]);