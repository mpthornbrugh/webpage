'use strict';

angular.module('databaseEntry.detail', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/detail/:id', {
			templateUrl: 'detail/detail.html',
			controller: 'DetailCtrl'
		});
	}])

	.controller('DetailCtrl', ['$scope', '$location', '$routeParams', 'DatabaseControlService', function ($scope, $location, $routeParams, DatabaseControlService) {
		var itemId = $routeParams.id;

		$(".se-pre-con").show();
		//Make sure that the initial data is populated.
		DatabaseControlService.ensureDataPopulated().then(function () {
			$scope.item = DatabaseControlService.getItemByIndex(itemId);
			$scope.when = new Date($scope.item.when);
			$(".se-pre-con").fadeOut("slow");
		});

		$scope.goto = function (where) {
			$location.path("/" + where);
		};

		$scope.updateItem = function (id) {
			if (!$scope.item.who || !$scope.item.what || !$scope.when || !$scope.item.where || !$scope.item.ranking) {
				return;
			}

			var when = $scope.when.toDateString();

			//TODO: Instead of replacing all ' with / try encodeURIComponent and then decodeURIComponent when it's used
			var updateItem = {
				who: $scope.item.who.replace("'", "/"),
				what: $scope.item.what.replace("'", "/"),
				when: when,
				where: $scope.item.where.replace("'", "/"),
				ranking: $scope.item.ranking
			};

			DatabaseControlService.updateItem(id, updateItem).then(function (data) {
				alert("Successfully updated.");
			});
		};

		$scope.deleteItem = function (id) {
			DatabaseControlService.removeItem(id).then(function (data) {
				$location.path('/list');
			});
		};

	}]);