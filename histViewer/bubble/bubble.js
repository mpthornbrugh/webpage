'use strict';

angular.module('histViewer.bubble', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/bubble/:id', {
				templateUrl: 'bubble/bubble.html',
				controller: 'BubbleCtrl'
			});
	}])

	.controller('BubbleCtrl', ['$scope', 'DatabaseControlService', 'HistoryService', '$location', '$routeParams', function ($scope, DatabaseControlService, HistoryService, $location, $routeParams) {
		$scope.currentView = 'bubble';
		//All the events should still be stored in the service.
		$scope.allItems = DatabaseControlService.getItems();
		//All the images should still be stored in the service.
		var images = DatabaseControlService.getImages();
		$scope.allImages = {};

		$scope.goBackToTimeline = function () {
			$location.path('/main');
		};

		$scope.history = [];

		function correctCapitalization(name) {
			var newName = "";
			var words = name.split(" ");
			for (var i = 0; i < words.length; i++) {
				var word = words[i].toLowerCase();
				word = word.charAt(0).toUpperCase() + word.slice(1);
				newName += word + " ";
			}
			newName = newName.substr(0, newName.length-1);
			return newName;
		}

		function wildcard(str, rule) {
			return new RegExp("^" + rule.replace("*", ".*") + "$").test(str);
		}

		function shuffle(array) {
			var currentIndex = array.length, temporaryValue, randomIndex;

			while (0 !== currentIndex) {
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}

			return array;
		}

		function getAssociatedItems(currItem, type) {
			if (type.toLowerCase() == "where") {
				HistoryService.setLeavingView('bubble');
				HistoryService.setLastBubble(currItem.id);
				$location.path("/map/" + currItem.who);
			}
			var items = [];
			var currItemMoment = moment(new Date(currItem.when));
			var currYear = currItemMoment.year();
			$scope.allItems.forEach(function(item) {
				switch (type.toLowerCase()) {
					case "who":
						var typeString = item[type];
						if(wildcard(typeString, "*" + currItem[type] + "*")) {
							items.push(item);
						}
						break;
					case "when":
						var thisMomentDate = moment(new Date(item.when));
						var thisYear = thisMomentDate.year();
						if (Math.abs(currYear - thisYear) < 6) {
							items.push(item);
						}
						break;
				}
			});

			if(items.length > 9) {
				items = shuffle(items).slice(0,9);
			}

			return items;
		}

		function getEventById (id) {
			for (var i in $scope.allItems) {
				if ($scope.allItems.hasOwnProperty(i)) {
					if ($scope.allItems[i].id == id) {
						return $scope.allItems[i];
					}
				}
			}
			return {}; //Should never hit this case
		}

		function getDegreeValues(linkAmount) {
			var values = {
				"startDegree": 0,
				"degreeSpacing": 0
			};

			switch (linkAmount) {//cases 2 and 6 remain at 0
				case 1:
					values.startDegree = 270;
					break;
				case 3:
					values.startDegree = 30;
					break;
				case 4:
					values.startDegree = 45;
					//startDegree = 0;
					break;
				case 5:
					values.startDegree = 54; //The extra one will be at angle 270 (top)
					//startDegree = 18; //The extra one will be at angle 90 (bottom)
					break;
				case 7:
					values.startDegree = 39; //The extra one will be at the bottom
					//startDegree = 15; //The extra one will be at the top
					break;
				case 8:
					values.startDegree = 23; //There are 2 bubbles in each quadrant
					//startDegree = 0; //There are 4 on the axes and 4 in the quadrants
					break;
				case 9:
					values.startDegree = 10; //The extra one will be at the bottom
					//startDegree = 30; //The extra one will be at the top
					break;
			}

			if (linkAmount != 0) {
				values.degreeSpacing = Math.floor(360/linkAmount);
			}

			$scope.bubble1 = false;
			$scope.bubble2 = false;
			$scope.bubble3 = false;
			$scope.bubble4 = false;
			$scope.bubble5 = false;
			$scope.bubble6 = false;
			$scope.bubble7 = false;
			$scope.bubble8 = false;
			$scope.bubble9 = false;

			if (linkAmount > 0) {
				$scope.bubble1 = true;
			}
			if (linkAmount > 1) {
				$scope.bubble2 = true;
			}
			if (linkAmount > 2) {
				$scope.bubble3 = true;
			}
			if (linkAmount > 3) {
				$scope.bubble4 = true;
			}
			if (linkAmount > 4) {
				$scope.bubble5 = true;
			}
			if (linkAmount > 5) {
				$scope.bubble6 = true;
			}
			if (linkAmount > 6) {
				$scope.bubble7 = true;
			}
			if (linkAmount > 7) {
				$scope.bubble8 = true;
			}
			if (linkAmount > 8) {
				$scope.bubble9 = true;
			}

			return values;
		}

		function generateAspectBubbles(eventId, updateHistory) {
			var currentItem = getEventById(eventId),
				aspects = ["who", "when", "where"],
				degreeVals = getDegreeValues(aspects.length),
				aspectItems = [];

			if (updateHistory) {
				var itemToAdd = {
					"num": $scope.history.length,
					"id": currentItem.id,
					"name": currentItem.what
				};
				$scope.history.push(itemToAdd);
			}

			//Do work on generating the background picture or some sort of picture
			var centerDiv = document.getElementById("centerDiv");
			if (currentItem.imgUrl != "") {
				$scope.hasPicture = true;
				centerDiv.setAttribute("style", "background-image:url('" + currentItem.imgUrl + "')");
			}

			$scope.centerBubbleText = currentItem.what;
			//$scope.centerBubbleTitle = "WHAT";

			for(var i = 0; i < aspects.length; i++) {
				var type = aspects[i],
					aspect = {
						"id": currentItem.id,
						"type": type,
						"title": type.toUpperCase(),
						"text": currentItem[type],
						"class": "deg-" + degreeVals.startDegree
					};

				degreeVals.startDegree += degreeVals.degreeSpacing;
				aspectItems.push(aspect)
			}

			$scope.bubbles = aspectItems;
			$scope.bubbleClick = function (index) {
				var currentBubble = $scope.bubbles[index];
				generateAssocBubbles(currentBubble.id, true, currentBubble.type);
			};
		}

		function generateAssocBubbles(eventId, updateHistory, type) {
			if (type.toLowerCase() == "where") {
				HistoryService.setLeavingView('bubble');
				HistoryService.setLastBubble(eventId);
				$location.path("/map/" + getEventById(eventId).who);
				return;
			}
			var currentItem = getEventById(eventId),
				assocItems = getAssociatedItems(currentItem,type),
				degreeVals = getDegreeValues(assocItems.length);

			if (updateHistory) {
				var itemToAdd = {
					"num": $scope.history.length,
					"id": currentItem.id,
					"name": currentItem[type]
				};
				$scope.history.push(itemToAdd);
			}

			//Do work on generating the background picture or some sort of picture
			var centerDiv = document.getElementById("centerDiv");

			$scope.centerBubbleText = currentItem[type];
			//Commented this for now because I just want to focus on what I clicked, and just displaying related bubbles.
			//$scope.centerBubbleTitle = currentItem.who;

			for(var i = 0; i < assocItems.length; i++) {
				var link = assocItems[i];
				link.text = link.what;
				link.class = "deg-" + degreeVals.startDegree;
				var url = $scope.allImages[link.who];
				if (url.length > 0) {
					link.url = "url(" + url + ")";
				}
				degreeVals.startDegree += degreeVals.degreeSpacing;
			}

			$scope.bubbles = assocItems;
			$scope.bubbleClick = function (index) {
				var currentBubble = $scope.bubbles[index];
				generateAspectBubbles(currentBubble.id, true);
			};
		}

		$scope.numReady = 0;

		function readyUp() {
			$scope.numReady++;
			if ($scope.numReady > 1) {
				for (var i = 0; i < $scope.allItems.length; i++) {
					$scope.allItems[i].imgUrl = $scope.allImages[$scope.allItems[i].who];
				}
				generateAspectBubbles(parseInt($routeParams.id), false);
			}
		}

		var load = $(".se-pre-con");

		load.show();
		DatabaseControlService.ensureDataPopulated().then(function () {
			$scope.allItems = DatabaseControlService.getItems();
			for (var i = 0; i < $scope.allItems.length; i++) {
				$scope.allItems[i].who = correctCapitalization($scope.allItems[i].who);
			}
			load.fadeOut("slow");
			readyUp();
		});

		load.show();
		DatabaseControlService.ensureImagesPopulated().then(function () {
			images = DatabaseControlService.getImages();
			load.fadeOut("slow");
			for (var i = 0; i < images.length; i++) {
				var image = images[i];
				var newName = correctCapitalization(image.name);
				$scope.allImages[newName] = image.url;
			}
			readyUp();
		});

		//Calculate the font-size for the view
		var container = document.getElementById("bubble-container");
		var control_container = document.getElementById("control-container");
		var history_list = document.getElementById("history-list");
		var html = document.documentElement;

		var height = html.clientHeight;

		var neededFontSize = Math.floor(height/37);
		container.setAttribute("style", "font-size:" + neededFontSize + "px;");

		control_container.setAttribute("style", "height:" + (height - (2 * neededFontSize)) + "px");
		history_list.setAttribute("style", "height:" + (height - (2 * neededFontSize) - 100) + "px");

		window.onresize = function () {
			height = html.clientHeight;

			var neededFontSize = Math.floor(height/37);

			control_container.setAttribute("style", "height:" + (height - (2 * neededFontSize)) + "px");

			container.setAttribute("style", "font-size:" + neededFontSize + "px;");
			history_list.setAttribute("style", "height:" + (height - (2 * neededFontSize) - 100) + "px");
		};

	}]);