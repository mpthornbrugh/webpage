'use strict';

angular.module('databaseEntry.images.detail', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/db/image/detail/:name', {
			templateUrl: 'database/dbImgs/detail/detail.html',
			controller: 'ImageDetailCtrl'
		});
	}])

	.controller('ImageDetailCtrl', ['$scope', '$location', '$http', 'DatabaseControlService', '$routeParams', function ($scope, $location, $http, DatabaseControlService, $routeParams) {

		$(".se-pre-con").show();
		//Make sure that the initial data is populated.
		DatabaseControlService.ensureImagesPopulated().then(function () {
			$scope.allImages = DatabaseControlService.getImages();
			var searchName = $routeParams.name;
			var person;
			for (var i in $scope.allImages) {
				if ($scope.allImages[i].name == searchName) {
					person = $scope.allImages[i];
					break;
				}
			}
			$scope.person = person;
			$(".se-pre-con").fadeOut();
		});

		$scope.goto = function (where) {
			$location.path("/" + where);
		};

		$scope.updateImage = function () {
			DatabaseControlService.updateImage({
				"name":$scope.person.name,
				"url":$scope.person.url
			})
				.then(function () {
					alert("Successfully Updated!");
				})
		};

	}]);