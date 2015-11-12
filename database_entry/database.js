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
			console.log(DatabaseControlService.getTasks());
		};

		$scope.add = function () {
			if (!$scope.who || !$scope.what || !$scope.when || !$scope.where || !$scope.significance) {
				return;
			}

			var when = $scope.when.toDateString();

			//TODO: Instead of replacing all ' with / try encodeURIComponent and then decodeURIComponent when it's used
			var addItem = {
				who: $scope.who.replace("'", "/"),
				what: $scope.what.replace("'", "/"),
				when: when,
				where: $scope.where.replace("'", "/"),
				ranking: $scope.ranking
			};

			DatabaseControlService.addItem(addItem).then(function () {
				alert("Success!");
			});
		};

		$scope.goto = function (where) {
			$location.path('/' + where);
		};
	}]);