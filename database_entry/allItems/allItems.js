'use strict';

angular.module('databaseEntry.list', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/list', {
			templateUrl: 'allItems/allItems.html',
			controller: 'ListCtrl'
		});
	}])

	.controller('ListCtrl', ['$scope', '$location', '$http', 'DatabaseControlService', function ($scope, $location, $http, DatabaseControlService) {

		$(".se-pre-con").show();
		//Make sure that the initial data is populated.
		DatabaseControlService.ensureDataPopulated().then(function () {
			$scope.items = DatabaseControlService.getItems();
			$(".se-pre-con").fadeOut("slow");
		});

		$scope.goto = function (where) {
			$location.path("/" + where);
		};

		$scope.goToDetail = function(id) {
			$location.path("/detail/" + id);
		};

		var list = document.getElementById("allListContainer");
		var html = document.documentElement;

		var height = html.clientHeight;
		var width = html.clientWidth;

		list.setAttribute("style", "height:" + (height - 105) + "px;");

		window.onresize = function () {
			height = html.clientHeight;
			width = html.clientWidth;

			list.setAttribute("style", "height:" + (height - 105) + "px;");
		};

	}]);