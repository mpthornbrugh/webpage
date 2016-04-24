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
	$scope.originalDescriptions = [];
	$scope.locations = [];
	$scope.infoWindowMulti;
	$scope.dates = [];
	$scope.filteredPlaces = [];

	var places = [];
	var address = "";

	var mapOfWho = $routeParams.who;
	if (mapOfWho == "") {
		mapOfWho = 'Ludwig van Beethoven';
	}
	$scope.title = $routeParams.who;

	DatabaseControlService.queryForWho(mapOfWho.toUpperCase()).then(function () {//Load the data from the place selected
		initialize();
		var mapItems = DatabaseControlService.getQueryItems();


		places.push(mapItems);
		$scope.latlngnum = places[0].length;
		$scope.latlngcnt = 0;

		$(".se-pre-con").show();

		x = 0;
		loopGeocodeArray(places[0]);

	});



	$scope.hideMap = function () {
		$location.path("/main");
	};

	$scope.setStartDate = function () {

		if(isNaN(document.getElementById("startDateInput").value)){
			alert("Please enter a valid start year.")
		}else{
			$scope.startDate = new Date(document.getElementById("startDateInput").value);
		}

	};

	$scope.setEndDate = function () {

		if(isNaN(document.getElementById("endDateInput").value)){
			alert("Please enter a valid end year.");
		}else{
			$scope.endDate = new Date(document.getElementById("endDateInput").value);
		}

	};

	$scope.setDateRange = function () {

		$scope.setStartDate();
		$scope.setEndDate();

		if(isNaN(document.getElementById("startDateInput").value) || isNaN(document.getElementById("endDateInput").value)){
			//do nothing
		}else{
			reinitialize($scope.startDate, $scope.endDate);
		}

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

	function replaceMarkers(startDate, endDate){
		//resets latlngnum to the amount of markers that will be placed.
		for (var i = 0; i < $scope.locations.length; i++) {
			if($scope.dates[i].getFullYear() >= startDate.getFullYear() && $scope.dates[i].getFullYear() <= endDate.getFullYear()){
				$scope.latlngnum++;
			}
		}

		for (var i = 0; i < $scope.locations.length; i++) {

			if($scope.dates[i].getFullYear() >= startDate.getFullYear() && $scope.dates[i].getFullYear() <= endDate.getFullYear()){
				$scope.filteredPlaces.push($scope.locations[i]);
				replaceMarker($scope.locations[i]);
			}

		}

		$(".se-pre-con").fadeOut();
	}

	function placeMarker(locationObj) {
		var displayString = '<ul style="list-style: none; padding-left: 10px;">'+
			'<li>' + locationObj.address.what + '</li>' +
			'<li>' + locationObj.address.when + '</li>';

		if(locationObj.address.ref != ""){
			displayString += '<li>' + '<a href=' + locationObj.address.ref + ' target=_blank>' + 'Reference' + '</a>' + '</li>' + '</ul>';
		}else{
			displayString += '</ul>';
		}

		$scope.originalDescriptions.push(displayString);
		$scope.dates.push(new Date(locationObj.address.when));

		$scope.map.setCenter(locationObj.location);

		var infowindow = new google.maps.InfoWindow({
			content: displayString
		});

		google.maps.event.addListener(infowindow, 'domready', function() {
			var iwOuter = $('.gm-style-iw');
			var iwBackground = iwOuter.prev();

			iwBackground.children(':nth-child(2)').css({'display' : 'none'});
			iwBackground.children(':nth-child(4)').css({'display' : 'none'});

			var iwCloseBtn = iwOuter.next();

			iwOuter.prev().children(':nth-child(3)').children(':nth-child(1)').css({
				'z-index': 2
			});
			iwOuter.prev().children(':nth-child(3)').children(':nth-child(2)').css({
				'z-index': 2
			});

			iwCloseBtn.css({
				width: '15px',
				height: '15px',
				opacity: '1',
				right: '28px',
				top: '10px',
				border: '1px solid #48b5e9',
				'border-radius': '13px',
				'box-shadow': '0 0 5px #3990B9'
			});

			iwCloseBtn.mouseout(function(){
				$(this).css({opacity: '1'});
			});
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

	function replaceMarker(locationObj){

		var displayString = '<ul style="list-style: none; padding-left: 10px;">'+
			'<li>' + locationObj.address.what + '</li>' +
			'<li>' + locationObj.address.when + '</li>';

		if(locationObj.address.ref != ""){
			displayString += '<li>' + '<a href=' + locationObj.address.ref + ' target=_blank>' + 'Reference' + '</a>' + '</li>' + '</ul>';
		}else{
			displayString += '</ul>';
		}

		$scope.map.setCenter(locationObj.location);

		var infowindow = new google.maps.InfoWindow({
			content: displayString
		});

		google.maps.event.addListener(infowindow, 'domready', function() {
			var iwOuter = $('.gm-style-iw');
			var iwBackground = iwOuter.prev();

			iwBackground.children(':nth-child(2)').css({'display' : 'none'});
			iwBackground.children(':nth-child(4)').css({'display' : 'none'});

			var iwCloseBtn = iwOuter.next();

			iwOuter.prev().children(':nth-child(3)').children(':nth-child(1)').css({
				'z-index': 2
			});
			iwOuter.prev().children(':nth-child(3)').children(':nth-child(2)').css({
				'z-index': 2
			});

			iwCloseBtn.css({
				width: '15px',
				height: '15px',
				opacity: '1',
				right: '28px',
				top: '10px',
				border: '1px solid #48b5e9',
				'border-radius': '13px',
				'box-shadow': '0 0 5px #3990B9'
			});

			iwCloseBtn.mouseout(function(){
				$(this).css({opacity: '1'});
			});
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

		refitView(locationObj.location);

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

	function reinitialize(startDate, endDate){
		$scope.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: -34.397, lng: 150.644},
			scrollwheel: false,
			zoom: 12
		});

		$scope.markers = [];
		$scope.consolidatedMarkers = [];
		$scope.latlng = [];
		$scope.descriptions = [];
		$scope.filteredPlaces = [];

		$scope.latlngnum = 0;
		$scope.latlngcnt = 0;

		replaceMarkers(startDate, endDate);
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

			if($scope.latlngnum == 1){
				$scope.map.setCenter($scope.latlng[0]);
			}else{
				$scope.map.fitBounds(latlngbounds);
			}
		}
	}

	function refitView(loc){

		$scope.latlng.push(loc);
		$scope.consolidatedMarkers.push(false);
		$scope.latlngcnt++;

		if($scope.latlngcnt == $scope.latlngnum) {
			var latlngbounds = new google.maps.LatLngBounds();
			for (var i = 0; i < $scope.latlngnum; i++) {

				for(var j = 0; j < i; j++){
					if($scope.latlng[i].equals($scope.latlng[j])){
						reconsolidateMarkers(i, j);
						break;
					}
				}

				latlngbounds.extend($scope.latlng[i]);

			}

			if($scope.latlngnum == 1){
				$scope.map.setCenter($scope.latlng[0]);
			}else{
				$scope.map.fitBounds(latlngbounds);
			}
		}
	}


	$scope.linkClickedUpdate = function(index){

		$scope.infoWindowMulti.setContent($scope.originalDescriptions[index]);

		$scope.markers[index].addListener('click', function () {
			$scope.infoWindowMulti.open($scope.map, this);
		});
	}

	function consolidateMarkers(i, j){


		if($scope.consolidatedMarkers[j] == false){

			//create new marker and overwrite

			$scope.descriptions[j] = "";
			$scope.descriptions[j] = "<a onclick='markerLinkClicked(" + j + ");'>" +places[0][j].who + " " + places[0][j].what + "</a></br>";
			$scope.descriptions[j] +=  "<a onclick='markerLinkClicked(" + i + ");'>" +places[0][i].who + " " + places[0][i].what + "</a></br>";

			$scope.infoWindowMulti = new google.maps.InfoWindow({
				pane: "mapPane",
				enableEventPropagation: false
			});

			$scope.marker = new google.maps.Marker({

				position: $scope.latlng[j],
				title: "Multiple Events"
			});


			google.maps.event.addListener($scope.marker,'click',(function(marker, j) {
				return function() {
					$scope.infoWindowMulti.setContent($scope.descriptions[j]);
					$scope.infoWindowMulti.open($scope.map, marker);
				}
			})($scope.marker, j));

			$scope.markers[i].setMap(null);
			$scope.markers[j].setMap(null);

			$scope.marker.setMap($scope.map);

			$scope.markers[j] = $scope.marker;


			$scope.consolidatedMarkers[j] = true;

		}else{


			$scope.descriptions[j] += "<a onclick='markerLinkClicked(" + i + ");'>" +places[0][i].who + " " + places[0][i].what + "</a></br>";

			$scope.infoWindowMulti = new google.maps.InfoWindow({
				pane: "mapPane",
				enableEventPropagation: false
			});

			$scope.marker = new google.maps.Marker({

				position: $scope.latlng[j],
				title: "Multiple Events"
			});

			google.maps.event.addListener($scope.marker,'click',(function(marker, j) {
				return function() {

					$scope.infoWindowMulti.setContent($scope.descriptions[j]);
					$scope.infoWindowMulti.open($scope.map, marker);
				}
			})($scope.marker, j));


			$scope.markers[i].setMap(null);
			$scope.markers[j].setMap(null);

			$scope.marker.setMap($scope.map);

			$scope.markers[j] = $scope.marker;


		}
	}

	function reconsolidateMarkers(i, j){
		if($scope.consolidatedMarkers[j] == false){

			//create new marker and overwrite

			$scope.descriptions[j] = "";
			$scope.descriptions[j] = "<a onclick='markerLinkClicked(" + j + ");'>" + $scope.filteredPlaces[j].address.who + " " + $scope.filteredPlaces[j].address.what + "</a></br>";
			$scope.descriptions[j] +=  "<a onclick='markerLinkClicked(" + i + ");'>" + $scope.filteredPlaces[i].address.who + " " + $scope.filteredPlaces[i].address.what + "</a></br>";

			$scope.infoWindowMulti = new google.maps.InfoWindow({
				pane: "mapPane",
				enableEventPropagation: false
			});

			$scope.marker = new google.maps.Marker({

				position: $scope.latlng[j],
				title: "Multiple Events"
			});


			google.maps.event.addListener($scope.marker,'click',(function(marker, j) {
				return function() {
					$scope.infoWindowMulti.setContent($scope.descriptions[j]);
					$scope.infoWindowMulti.open($scope.map, marker);
				}
			})($scope.marker, j));

			$scope.markers[i].setMap(null);
			$scope.markers[j].setMap(null);

			$scope.marker.setMap($scope.map);

			$scope.markers[j] = $scope.marker;


			$scope.consolidatedMarkers[j] = true;

		}else{


			$scope.descriptions[j] += "<a onclick='markerLinkClicked(" + i + ");'>" + $scope.filteredPlaces[i].address.who + " " + $scope.filteredPlaces[i].address.what + "</a></br>";

			$scope.infoWindowMulti = new google.maps.InfoWindow({
				pane: "mapPane",
				enableEventPropagation: false
			});

			$scope.marker = new google.maps.Marker({

				position: $scope.latlng[j],
				title: "Multiple Events"
			});

			google.maps.event.addListener($scope.marker,'click',(function(marker, j) {
				return function() {

					$scope.infoWindowMulti.setContent($scope.descriptions[j]);
					$scope.infoWindowMulti.open($scope.map, marker);
				}
			})($scope.marker, j));


			$scope.markers[i].setMap(null);
			$scope.markers[j].setMap(null);

			$scope.marker.setMap($scope.map);

			$scope.markers[j] = $scope.marker;


		}
	}


	var map_container = $('#map');
	map_container.height($(document).height());

}]);



function markerLinkClicked(index){

	var scope = angular.element(document.getElementById("map")).scope();

	scope.$apply(function(){
		scope.linkClickedUpdate(index);
	});

	return false;

}

