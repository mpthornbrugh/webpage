'use strict';

angular.module('databaseEntry.query', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/db/query', {
			templateUrl: 'database/query/query.html',
			controller: 'QueryCtrl'
		});
	}])

	.controller('QueryCtrl', ['$scope', '$location', 'DatabaseControlService', function ($scope, $location, DatabaseControlService) {

		$(".se-pre-con").hide();

		$scope.goto = function (where) {
			$location.path("/db/" + where);
		};

		$scope.queryForWho = function () {
			if (!$scope.queryBy) {
				alert("The query field is empty.");
				$scope.items = [];
				return;
			}
			$(".se-pre-con").show();
			DatabaseControlService.queryForWho($scope.queryBy).then(function () {
				var queryItems = DatabaseControlService.getQueryItems();
				$scope.items = queryItems;
				console.log(queryItems);
				$(".se-pre-con").fadeOut("slow");
			});
		};

		$scope.queryForWhat = function () {
			if (!$scope.queryBy) {
				alert("The query field is empty.");
				$scope.items = [];
				return;
			}
			$(".se-pre-con").show();
			DatabaseControlService.queryForWhat($scope.queryBy).then(function () {
				var queryItems = DatabaseControlService.getQueryItems();
				$scope.items = queryItems;
				console.log(queryItems);
				$(".se-pre-con").fadeOut("slow");
			});
		};

		$scope.writeQuery = function () {
			if (!$scope.queryBy) {
				alert("The query field is empty.");
				$scope.items = [];
				return;
			}
			$(".se-pre-con").show();
			DatabaseControlService.writtenQuery($scope.queryBy).then(function () {
				var queryItems = DatabaseControlService.getQueryItems();
				$scope.items = queryItems;
				console.log(queryItems);
				$(".se-pre-con").fadeOut("slow");
			});
		};

	}]);