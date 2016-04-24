'use strict';

angular.module('databaseEntry.view', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/db/main', {
			templateUrl: 'database/view.html',
			controller: 'ViewCtrl'
		});
	}])

	.controller('ViewCtrl', ['$scope', '$location', '$http', 'DatabaseControlService', function ($scope, $location, $http, DatabaseControlService) {
		//Make sure that the initial data is populated.
		DatabaseControlService.ensureDataPopulated().then(function () {
			$(".se-pre-con").fadeOut("slow");
		});

		$scope.get = function () {
			//console.log(DatabaseControlService.getTasks());
		};

		$scope.add = function () {
			if (!$scope.who || !$scope.action || !$scope.when || !$scope.where) {
				return;
			}

			$scope.who = $scope.who.toUpperCase();

			if (!$scope.ranking) {
				$scope.ranking = 1;
			}

			if (!$scope.compliment1) {
				$scope.compliment1 = "";
			}

			if (!$scope.compliment2) {
				$scope.compliment2 = "";
			}

			if (!$scope.ref) {
				$scope.ref = "";
			}

			var what = $scope.action;
			if ($scope.compliment1 != "") {
				what += " " + $scope.compliment1;
			}
			if ($scope.compliment2 != "") {
				what += " " + $scope.compliment2;
			}

			var partiallySupported = false;

			var addItem = {
				who: $scope.who,
				what: what,
				action: $scope.action,
				compliment1:$scope.compliment1,
				compliment2:$scope.compliment2,
				when: $scope.when,
				where: $scope.where,
				ranking: $scope.ranking,
				ref: $scope.ref
			};

			DatabaseControlService.addItem(addItem).then(function (x, y) {
				if (partiallySupported) {
					alert("Data successfully added although date is only partially supported. Please go to the list to verify that it saved correctly.");
				}
				else {
					alert("Success!");
				}
			});
		};

		$scope.goto = function (where) {
			$location.path('/db/' + where);
		};
	}]);