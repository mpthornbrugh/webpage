'use strict';

angular.module('databaseEntry.query', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/query', {
			templateUrl: 'query/query.html',
			controller: 'QueryCtrl'
		});
	}])

	.controller('QueryCtrl', ['$scope', '$location', 'DatabaseControlService', function ($scope, $location, DatabaseControlService) {

		$(".se-pre-con").hide();

		$scope.goto = function (where) {
			$location.path("/" + where);
		};

		$scope.queryForWho = function () {
			DatabaseControlService.queryForWho($scope.queryBy).then(function () {
				var queryItems = DatabaseControlService.getQueryItems();
				$scope.items = queryItems;
				console.log(queryItems);
			});
		};

		$scope.queryForWhat = function () {
			DatabaseControlService.queryForWhat($scope.queryBy).then(function () {
				var queryItems = DatabaseControlService.getQueryItems();
				$scope.items = queryItems;
				console.log(queryItems);
			});
		};

	}]);