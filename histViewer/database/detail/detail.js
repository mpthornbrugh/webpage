'use strict';

angular.module('databaseEntry.detail', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/db/detail/:id', {
			templateUrl: 'database/detail/detail.html',
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
			$location.path("/db/" + where);
		};

		$scope.updateItem = function (id) {
			if (!$scope.item.who || !$scope.item.action || !$scope.when || !$scope.item.where) {
				return;
			}

			$scope.item.who = $scope.item.who.toUpperCase();

			if (!$scope.item.ranking) {
				$scope.item.ranking = 1;
			}

			if (!$scope.item.ref) {
				$scope.item.ref = "";
			}

			if (!$scope.item.compliment1) {
				$scope.item.compliment1 = "";
			}

			if (!$scope.item.compliment2) {
				$scope.item.compliment2 = "";
			}

			var what = $scope.item.action + " " + $scope.item.compliment1 + " " + $scope.item.compliment2;

			var updateItem = {
				who: $scope.item.who,
				what: what,
				when: $scope.item.when,
				where: $scope.item.where,
				action: $scope.item.action,
				compliment1: $scope.item.compliment1,
				compliment2: $scope.item.compliment2,
				ranking: $scope.item.ranking,
				ref: $scope.item.ref
			};

			DatabaseControlService.updateItem(id, updateItem).then(function (data) {
				alert("Successfully updated.");
			});
		};

		$scope.deleteItem = function (id) {
			DatabaseControlService.removeItem(id).then(function (data) {
				$location.path('/db/list');
			});
		};

	}]);