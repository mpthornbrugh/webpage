'use strict';

angular.module('databaseEntry.image', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/db/image', {
			templateUrl: 'database/dbImgs/images.html',
			controller: 'ImagesCtrl'
		});
	}])

	.controller('ImagesCtrl', ['$scope', '$location', '$http', 'DatabaseControlService', function ($scope, $location, $http, DatabaseControlService) {

		$(".se-pre-con").show();
		//Make sure that the initial data is populated.
		DatabaseControlService.ensureImagesPopulated().then(function () {
			$scope.allImages = DatabaseControlService.getImages();
			$(".se-pre-con").fadeOut();
		});

		$scope.goto = function (where) {
			$location.path("/" + where);
		};

		$scope.gotoDetail = function (name) {
			$location.path("/db/image/detail/" + name);
		}

	}]);