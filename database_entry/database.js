'use strict';

angular.module('databaseEntry.view', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/view', {
			templateUrl: 'view.html',
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
			if (!$scope.who || !$scope.what || !$scope.when || !$scope.where) {
				return;
			}

			if (!$scope.ranking) {
				$scope.ranking = 1;
			}

			if (!$scope.ref) {
				$scope.ref = "";
			}

			var partiallySupported = false;

			if ($("#databaseWhen").prop('type') != 'date') {
				$scope.when = new Date($scope.when);
				partiallySupported = true;
			}

			var when = $scope.when.toDateString();

			var addItem = {
				who: $scope.who,
				what: $scope.what,
				when: when,
				where: $scope.where,
				ranking: $scope.ranking,
				ref: $scope.ref
			};

			DatabaseControlService.addItem(addItem).then(function () {
				if (partiallySupported) {
					alert("Data successfully added although date is only partially supported. Please go to the list to verify that it saved correctly.");
				}
				else {
					alert("Success!");
				}
			});
		};

		$scope.goto = function (where) {
			$location.path('/' + where);
		};
	}]);