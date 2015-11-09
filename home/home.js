'use strict';

angular.module('homePage.home', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/home', {
			templateUrl: 'home/homeView.html',
			controller: 'HomeViewCtrl'
		});
	}])

	.controller('HomeViewCtrl', ['$scope', function ($scope) {

	}]);