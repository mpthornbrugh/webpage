'use strict';

angular.module('databaseEntry.list', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/db/list', {
			templateUrl: 'database/allItems/allItems.html',
			controller: 'ListCtrl'
		});
	}])

	.controller('ListCtrl', ['$scope', '$location', '$http', 'DatabaseControlService', function ($scope, $location, $http, DatabaseControlService) {

		$(".se-pre-con").show();
		//Make sure that the initial data is populated.
		DatabaseControlService.ensureDataPopulated().then(function () {
			$scope.items = DatabaseControlService.getItems();

			var str = "";
			for (var i = 0; i < $scope.items.length; i++) {
				var item = $scope.items[i];
				str += "Who: " + item.who + " ";
				str += "What: " + item.what + " ";
				str += "When: " + item.when + " ";
				str += "Where: " + item.where + "\n";
			}
			console.log(str);

			$(".se-pre-con").fadeOut("slow");
		});

		$scope.goto = function (where) {
			$location.path("/" + where);
		};

		$scope.goToDetail = function(id) {
			$location.path("/db/detail/" + id);
		};

	}]);