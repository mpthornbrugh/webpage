'use strict';

angular.module('databaseEntry.list', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/list', {
			templateUrl: 'allItems.html',
			controller: 'ListCtrl'
		});
	}])

	.controller('ListCtrl', ['$scope', '$location', '$http', 'DatabaseControlService', function ($scope, $location, $http, DatabaseControlService) {

		$(".se-pre-con").show();
		//Make sure that the initial data is populated.
		DatabaseControlService.ensureDataPopulated().then(function () {
			$scope.items = DatabaseControlService.getItems();
			$(".se-pre-con").fadeOut("slow");

			for (var i in $scope.items) {
				$scope.items[i].when =  moment($scope.items[i].when).format('MMMM Do YYYY, h:mm:ss a');
			}
		});

		$scope.goto = function (where) {
			$location.path("/" + where);
		};

		$scope.goToDetail = function(id) {
			$location.path("/detail/" + id);
		};

	}]);