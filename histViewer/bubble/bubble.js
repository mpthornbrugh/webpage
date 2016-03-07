'use strict';

angular.module('histViewer.bubble', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/bubble/:id', {
				templateUrl: 'bubble/bubble.html',
				controller: 'BubbleCtrl'
			});
	}])

	.controller('BubbleCtrl', ['$scope', 'DatabaseControlService', '$location', '$routeParams', function ($scope, DatabaseControlService, $location, $routeParams) {
		$scope.currentView = 'bubble';
		//All the events should still be stored in the service.
		$scope.allItems = DatabaseControlService.getItems();

		$scope.goBackToTimeline = function () {
			$location.path('/main');
		};

		var currentItem;
		$scope.history = [];
		var currentBubble;

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
			var items = [];
			$scope.allItems.forEach(function(item) {
				var typeString = item[type];
				if(wildcard(typeString, "*" + currItem[type] + "*")) {
					items.push(item);
				}
			});

			if(items.length > 9) {
				items = shuffle(items).slice(0,9);
			}

			return items;
		}

		function getEventById (id) {
			for (var i in $scope.allItems) {
				if ($scope.allItems[i].id == id) {
					return $scope.allItems[i];
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
				degreeVals.startDegree += degreeVals.degreeSpacing;
			}

			$scope.bubbles = assocItems;
			$scope.bubbleClick = function (index) {
				var currentBubble = $scope.bubbles[index];
				generateAspectBubbles(currentBubble.id, true);
			};
		}

		if ($scope.allItems.length < 1) {
			$(".se-pre-con").show();
			DatabaseControlService.ensureDataPopulated().then(function () {
				$scope.allItems = DatabaseControlService.getItems();
				$(".se-pre-con").fadeOut("slow");
				generateAspectBubbles(parseInt($routeParams.id), false);
			});
		}
		else {
			generateAspectBubbles(parseInt($routeParams.id), false);
		}

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