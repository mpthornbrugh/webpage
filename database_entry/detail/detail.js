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
			if (!$scope.item.who || !$scope.item.what || !$scope.when || !$scope.item.where) {
				return;
			}

			if (!$scope.item.ranking) {
				$scope.item.ranking = 1;
			}

			if (!$scope.item.ref) {
				$scope.item.ref = "";
			}

			var when = $scope.when.toDateString();

			var updateItem = {
				who: $scope.item.who,
				what: $scope.item.what,
				when: when,
				where: $scope.item.where,
				ranking: $scope.item.ranking,
				ref: $scope.item.ref
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