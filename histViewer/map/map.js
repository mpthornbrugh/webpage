'use strict';

var histViewerMap = angular.module('histViewerMap', ['ngRoute']);

histViewerMap.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/map/:who', {
		templateUrl: 'map/map.html',
		controller: 'testController'
	});
}]);

histViewerMap.controller('testController', ['$scope', 'DatabaseControlService', '$location', '$routeParams', function ($scope, DatabaseControlService, $location, $routeParams) {
	$(".se-pre-con").hide();

	$scope.currentView = 'map';
	$scope.latlng = [];
	$scope.latlngcnt;
	$scope.latlngnum;
	$scope.markers = [];
	$scope.consolidatedMarkers = [];
	$scope.descriptions = [];

	$scope.locations = [];

	var places = [];
	var address = "";

	var mapOfWho = $routeParams.who;
	if (mapOfWho == "") {
		mapOfWho = 'Ludwig van Beethoven';
	}

	DatabaseControlService.queryForWho(mapOfWho).then(function () {//Load the data from the place selected
		initialize();
		var mapItems = DatabaseControlService.getQueryItems();


		places.push(mapItems);
		$scope.latlngnum = places[0].length;
		$scope.latlngcnt = 0;

		$(".se-pre-con").show();

		x = 0;
		loopGeocodeArray(places[0]);

		/*for(var i=0; i < places[0].length; i++) {
		 geoCoder(places[0][i].where, places[0][i].who + " -- " + places[0][i].what + " -- " + places[0][i].when);
		 }*/
	});

	$scope.hideMap = function () {
		$location.path("/main");
	};

	//Asynchronous geocoding call for checking valid input
	var x;
	var loopGeocodeArray = function (arr) {
		if (x < arr.length) {
			doGeocode(arr[x], x, function () {
				// set x to next item
				x++;

				loopGeocodeArray(arr);
			});
		}
		else {
			placeMarkers();
		}
	};

	function placeMarkers() {
		for (var i = 0; i < $scope.locations.length; i++) {
			placeMarker($scope.locations[i]);
		}

		$(".se-pre-con").fadeOut();

	}

	function placeMarker(locationObj) {
		var displayString = locationObj.address.who + " -- " + locationObj.address.what + " -- " + locationObj.address.when;

		$scope.map.setCenter(locationObj.location);

		var infowindow = new google.maps.InfoWindow({
			content: displayString
		});

		$scope.marker = new google.maps.Marker({

			position: locationObj.location,
			title: displayString
		});


		$scope.marker.addListener('click', function () {
			infowindow.open($scope.map, this);
		});

		$scope.marker.setMap($scope.map);

		$scope.markers.push($scope.marker);

		fitView(locationObj.location);
	}

	//Used along with the above function.
	function doGeocode(address, index, callback) {
		var addr = address.where;
		// Get geocoder instance
		var geocoder = new google.maps.Geocoder();

		// Geocode the address
		geocoder.geocode({'address': addr}, function (results, status) {
			if (status === google.maps.GeocoderStatus.OK && results.length > 0) {

				$scope.locations.push({
					'address':address,
					'location': results[0].geometry.location
				});

				setTimeout(function(){
					callback();
				}, 200);


			}
			else {
				console.log(status);
				setTimeout(function(){
					callback();
				}, 50);
			}
		});
	}



	function initialize () {
		$scope.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: -34.397, lng: 150.644},
			scrollwheel: false,
			zoom: 12
		});
	}

	function geoCoder(place, description) {
		$scope.geoCoder = new google.maps.Geocoder();

		$scope.geoCoder.geocode({'address': place}, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {

				$scope.map.setCenter(results[0].geometry.location);

				var infowindow = new google.maps.InfoWindow({
					content: description
				});

				$scope.marker = new google.maps.Marker({

					position: results[0].geometry.location,
					title: description
				});

				$scope.markers.push($scope.marker);

				$scope.marker.addListener('click', function () {
					infowindow.open($scope.map, this);
				});

				$scope.marker.setMap($scope.map);

				fitView(results[0].geometry.location);
			}
			else {
				alert("Geocode was not successful for the following reason: " + status);
			}
		});

	}

	function fitView(loc) {
		$scope.latlng.push(loc);
		$scope.consolidatedMarkers.push(false);
		$scope.latlngcnt++;

		if($scope.latlngcnt == $scope.latlngnum) {
			var latlngbounds = new google.maps.LatLngBounds();
			for (var i = 0; i < $scope.latlngnum; i++) {

				for(var j = 0; j < i; j++){
					if($scope.latlng[i].equals($scope.latlng[j])){
						consolidateMarkers(i, j);
						break;
					}
				}

				latlngbounds.extend($scope.latlng[i]);

			}

			$scope.map.fitBounds(latlngbounds);
		}
	}

	function consolidateMarkers(i, j){


		if($scope.consolidatedMarkers[j] == false){

			//create new marker and overwrite

			$scope.descriptions[j] = "";
			$scope.descriptions[j] = "<a href='#'>" +places[0][j].who + " " + places[0][j].what + "</a></br>";
			$scope.descriptions[j] += "<a href='#'>" +places[0][i].who + " " + places[0][i].what + "</a></br>";

			$scope.marker = new google.maps.Marker({

				position: $scope.latlng[j],
				title: "Multiple Events"
			});

			var infowindow = new google.maps.InfoWindow({
				content: $scope.descriptions[j]
			});

			$scope.marker.addListener('click', function () {
				infowindow.open($scope.map, this);
			});

			$scope.markers[i].setMap(null);
			$scope.markers[j].setMap(null);

			$scope.marker.setMap($scope.map);

			$scope.markers[j] = $scope.marker;


			$scope.consolidatedMarkers[j] = true;

		}else{

			//add link to partially consolidated marker.
			$scope.descriptions[j] += "<a href='#'>" +places[0][i].who + " " + places[0][i].what + "</a></br>";

			$scope.marker = new google.maps.Marker({

				position: $scope.latlng[j],
				title: "Multiple Events"
			});

			var infowindow = new google.maps.InfoWindow({
				content: $scope.descriptions[j]
			});

			$scope.marker.addListener('click', function () {
				infowindow.open($scope.map, this);
			});

			$scope.markers[i].setMap(null);
			$scope.markers[j].setMap(null);

			$scope.marker.setMap($scope.map);

			$scope.markers[j] = $scope.marker;


		}

		//Google.map.trigger(markers[x], 'click');
	}

	var map_container = $('#map');
	map_container.height($(document).height());

}]);

