'use strict';

angular.module('histViewer.newBubble', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/newbub/:id', {
			templateUrl: 'new_bubble/new_bubble.html',
			controller: 'NewBubbleCtrl'
		});
	}])

	.controller('NewBubbleCtrl', ['$scope', 'DatabaseControlService', '$location', '$routeParams', function ($scope, DatabaseControlService, $location, $routeParams) {
		//All the events should still be stored in the service.
		$scope.allItems = DatabaseControlService.getItems();

		var docHeight = 0;
		var docWidth = 0;
		var circles = [];
		var canvas = $("#svgCanvas");
		$scope.circleHistory = [];

		function getEventById (id) {
			for (var i in $scope.allItems) {
				if ($scope.allItems[i].id == id) {
					return $scope.allItems[i];
				}
			}
			return {}; //Should never hit this case
		}

		$scope.goBackToTimeline = function () {
			$location.path('/main');
		};

		$scope.goToCircleHistory = function(history, index) {
			var event = getEventById(circles[0].eventId);
			circles[0].historyText = event.who;
			$scope.circleHistory.push(circles);
			$scope.circleHistory.splice(index, 1);
			circles = history;
			drawCircles();
		};

		$(document).ready(function() {
			docHeight = $(document).height();
			docWidth = $(document).width();
			if ($scope.allItems.length < 1) {
				$(".se-pre-con").show();
				DatabaseControlService.ensureDataPopulated().then(function () {
					$scope.allItems = DatabaseControlService.getItems();
					$(".se-pre-con").fadeOut("slow");
					start();
				});
			}
			else {
				start();
			}
		});

		function createWhoWhatWhenWhereBubbles (parentId) {
			var parent = circles[parentId];
			var parentRad = parent.radius;
			var childRad = parentRad/2;
			var parentEvent = getEventById(parent.eventId);
			switch (parent.attr) {
				case "center":
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 45, childRad, "aspect-who", parentId, parentEvent.who);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 135, childRad, "aspect-what", parentId, parentEvent.what);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 225, childRad, "aspect-when", parentId, parentEvent.when);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 315, childRad, "aspect-where", parentId, parentEvent.where);
					break;
				case "bottomRight":
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 315, childRad, "aspect-who", parentId, parentEvent.who);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 15, childRad, "aspect-what", parentId, parentEvent.what);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 75, childRad, "aspect-when", parentId, parentEvent.when);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 135, childRad, "aspect-where", parentId, parentEvent.where);
					break;
				case "bottomLeft":
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 225, childRad, "aspect-who", parentId, parentEvent.who);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 165, childRad, "aspect-what", parentId, parentEvent.what);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 105, childRad, "aspect-when", parentId, parentEvent.when);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 45, childRad, "aspect-where", parentId, parentEvent.where);
					break;
				case "topLeft":
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 315, childRad, "aspect-who", parentId, parentEvent.who);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 255, childRad, "aspect-what", parentId, parentEvent.what);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 195, childRad, "aspect-when", parentId, parentEvent.when);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 135, childRad, "aspect-where", parentId, parentEvent.where);
					break;
				case "topRight":
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 225, childRad, "aspect-who", parentId, parentEvent.who);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 285, childRad, "aspect-what", parentId, parentEvent.what);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 345, childRad, "aspect-when", parentId, parentEvent.when);
					addCircle((parentRad + childRad + 5), parent.x, parent.y, 45, childRad, "aspect-where", parentId, parentEvent.where);
					break;
			}
		}

		function start () {
			var event = getEventById($routeParams.id);
			circles[0] = {
				"id":0,
				"x":docWidth/2,
				"y":docHeight/2,
				"radius":Math.min(docHeight, docWidth)/5,
				"attr": "center",
				"parent":-1,
				"text":event.who + "<br><br>" + event.what,
				"hasChild":true,
				"eventId":$routeParams.id
			};
			createWhoWhatWhenWhereBubbles(0);
			drawCircles();
		}

		function toRadians (angle) {
			return angle * (Math.PI / 180);
		}

		//Sin(angle) = Opposite/Hypotenuse
		function getX (distance, degrees) { //Degree 0 is pointing to the right.
			degrees = toRadians(degrees);
			if (degrees > 90 && degrees < 270) {
				return distance * Math.cos(degrees % 90) * -1;
			}
			else {
				return distance * Math.cos(degrees % 90);
			}
		}

		//Cosine(angle) = Adjacent/Hypotenuse
		function getY (distance, degrees) { //Degree 0 is pointing to the right.
			degrees = toRadians(degrees);
			if (degrees > 180 && degrees < 360) {
				return distance * Math.sin(degrees % 90) * -1;
			}
			else {
				return distance * Math.sin(degrees % 90);
			}
		}

		function addCircle (distance, curX, curY, angle, newRad, attribute, parentNum, text, eventId) {
			var moveX = getX(distance, angle);
			var moveY = getY(distance, angle);
			var obj = {
				"id":circles.length,
				"x":curX + moveX,
				"y":curY + moveY,
				"radius":newRad,
				"attr": attribute,
				"parent":parentNum,
				"text":text,
				"hasChild":false
			};
			if (eventId) {
				obj.eventId = eventId;
			}
			circles.push(obj);
		}

		function zoomCircle (id) {
			var newCircArr = [];
			for (var i = 0; i < circles.length; i++) {
				if (circles[i].id == id) {
					newCircArr.push(circles[i]);
				}
			}
			//Now newCircArr is the circle above the magnification spot. Need to set this as the center bubble
			var event = getEventById(newCircArr[0].eventId);
			var midText = "";
			if (event.who == newCircArr[0].text) {
				midText = newCircArr[0].text;
			}
			else {
				midText = event.who + "<br><br>" + newCircArr[0].text;
			}
			newCircArr[0] = {
				"id":0,
				"x":docWidth/2,
				"y":docHeight/2,
				"radius":Math.min(docHeight, docWidth)/5,
				"attr": "center",
				"parent":-1,
				"text":midText,
				"hasChild":false,
				"eventId":newCircArr[0].eventId
			};
			var event = getEventById(circles[0].eventId);
			circles[0].historyText = event.who;
			$scope.circleHistory.push(circles);
			$scope.$apply();

			circles = newCircArr;
			drawCircles();
		}

		function splitCircle (id) {
			circles[id].hasChild = true;
			var parentRad = circles[id].radius;
			var childRad = parentRad/2;
			var currentX = circles[id].x;
			var currentY = circles[id].y;
			createWhoWhatWhenWhereBubbles(id);
			drawCircles();
		}

		function hideChildren (id, noRedraw) {
			var remove = [];
			for (var i = 0; i < circles.length; i++) {
				if (circles[i].parent == id) {
					if (circles[i].hasChild) {
						return;
					}
					remove.push(i);
				}
			}

			for (var i = remove.length - 1; i >= 0; i--) {
				circles.splice(remove[i], 1);
			}
			circles[id].hasChild = false;
			if (noRedraw) {
				return;
			}
			drawCircles();
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

		function getAssociatedItems (parent, type, maxNum) {
			var retArr = [];
			var parentEvent = getEventById(parent.eventId);
			var parentMomentDate = moment(new Date(parentEvent.when));
			for (var i = 0; i < $scope.allItems.length; i++) {
				var curItem = $scope.allItems[i];
				switch (type) {
					case "who":
						var splitName = parentEvent.who.split(" ");
						for (var j = 0; j < splitName.length; j++) {
							if (curItem.who.toUpperCase().indexOf(splitName[j].toUpperCase()) > -1) {
								retArr.push(curItem);
							}
						}
						break;
					case "what":
						if (curItem.action == parentEvent.action) {
							retArr.push(curItem);
						}
						break;
					case "where":
						//Temporary until we have input latitude and longitude
						var where = parentEvent.where.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
						var splitWhere = where.split(" ");
						for (var j = 0; j < splitWhere.length; j++) {
							if (curItem.where.toUpperCase().indexOf(splitWhere[j].toUpperCase()) > -1) {
								retArr.push(curItem);
							}
						}
						break;
					case "when":
						if ((parentMomentDate.diff(moment(new Date(curItem.when)))) < 31557600000 ) {
							retArr.push(curItem);
						}
						break;
				}
			}

			retArr = jQuery.unique(retArr);

			if (retArr.length > maxNum) {
				retArr = shuffle(retArr).slice(0, maxNum);
			}

			return retArr;
		}

		function replaceWhoWhatWhenWhere(id) {
			var parent = circles[circles[id].parent];
			var typeOfCheck = circles[id].attr.split("-")[1];
			hideChildren(circles[id].parent, true);
			var associated;
			var parentRad = parent.radius;
			var childRad = parentRad/2;
			var currentX = parent.x;
			var currentY = parent.y;
			var parId = parent.id;
			parent.hasChild = true;
			switch (parent.attr) {
				case "center":
					associated = getAssociatedItems(parent, typeOfCheck, 4);
					if (associated.length > 0) {
						addCircle((parentRad + childRad + 5), currentX, currentY, 45, childRad, "bottomRight", parId, (typeOfCheck == 'what' ? (associated[0].who.split(" ")[0] + "<br><br>" + associated[0][typeOfCheck.toLowerCase()]) : associated[0][typeOfCheck.toLowerCase()]), associated[0].id);
						if (associated.length > 1) {
							addCircle((parentRad + childRad + 5), currentX, currentY, 225, childRad, "topLeft", parId, (typeOfCheck == 'what' ? (associated[1].who.split(" ")[0] + "<br><br>" + associated[1][typeOfCheck.toLowerCase()]) : associated[1][typeOfCheck.toLowerCase()]), associated[1].id);
							if (associated.length > 2) {
								addCircle((parentRad + childRad + 5), currentX, currentY, 135, childRad, "bottomLeft", parId, (typeOfCheck == 'what' ? (associated[2].who.split(" ")[0] + "<br><br>" + associated[2][typeOfCheck.toLowerCase()]) : associated[2][typeOfCheck.toLowerCase()]), associated[2].id);
								if (associated.length > 3) {
									addCircle((parentRad + childRad + 5), currentX, currentY, 315, childRad, "topRight", parId, (typeOfCheck == 'what' ? (associated[3].who.split(" ")[0] + "<br><br>" + associated[3][typeOfCheck.toLowerCase()]) : associated[3][typeOfCheck.toLowerCase()]), associated[3].id);
								}
							}
						}
					}
					break;
				case "bottomRight":
					associated = getAssociatedItems(parent, typeOfCheck, 3);
					if (associated.length > 0) {
						addCircle((parentRad + childRad + 5), currentX, currentY, 315, childRad, "topRight", parId, (typeOfCheck == 'what' ? (associated[0].who.split(" ")[0] + "<br><br>" + associated[0][typeOfCheck.toLowerCase()]) : associated[0][typeOfCheck.toLowerCase()]), associated[0].id);
						if (associated.length > 1) {
							addCircle((parentRad + childRad + 5), currentX, currentY, 45, childRad, "bottomRight", parId, (typeOfCheck == 'what' ? (associated[1].who.split(" ")[0] + "<br><br>" + associated[1][typeOfCheck.toLowerCase()]) : associated[1][typeOfCheck.toLowerCase()]), associated[1].id);
							if (associated.length > 2) {
								addCircle((parentRad + childRad + 5), currentX, currentY, 135, childRad, "bottomLeft", parId, (typeOfCheck == 'what' ? (associated[2].who.split(" ")[0] + "<br><br>" + associated[2][typeOfCheck.toLowerCase()]) : associated[2][typeOfCheck.toLowerCase()]), associated[2].id);
							}
						}
					}
					break;
				case "bottomLeft":
					associated = getAssociatedItems(parent, typeOfCheck, 3);
					if (associated.length > 0) {
						addCircle((parentRad + childRad + 5), currentX, currentY, 225, childRad, "topLeft", parId, (typeOfCheck == 'what' ? (associated[0].who.split(" ")[0] + "<br><br>" + associated[0][typeOfCheck.toLowerCase()]) : associated[0][typeOfCheck.toLowerCase()]), associated[0].id);
						if (associated.length > 1) {
							addCircle((parentRad + childRad + 5), currentX, currentY, 45, childRad, "bottomRight", parId, (typeOfCheck == 'what' ? (associated[1].who.split(" ")[0] + "<br><br>" + associated[1][typeOfCheck.toLowerCase()]) : associated[1][typeOfCheck.toLowerCase()]), associated[1].id);
							if (associated.length > 2) {
								addCircle((parentRad + childRad + 5), currentX, currentY, 135, childRad, "bottomLeft", parId, (typeOfCheck == 'what' ? (associated[2].who.split(" ")[0] + "<br><br>" + associated[2][typeOfCheck.toLowerCase()]) : associated[2][typeOfCheck.toLowerCase()]), associated[2].id);
							}
						}
					}
					break;
				case "topLeft":
					associated = getAssociatedItems(parent, typeOfCheck, 3);
					if (associated.length > 0) {
						addCircle((parentRad + childRad + 5), currentX, currentY, 315, childRad, "topRight", parId, (typeOfCheck == 'what' ? (associated[0].who.split(" ")[0] + "<br><br>" + associated[0][typeOfCheck.toLowerCase()]) : associated[0][typeOfCheck.toLowerCase()]), associated[0].id);
						if (associated.length > 1) {
							addCircle((parentRad + childRad + 5), currentX, currentY, 135, childRad, "bottomLeft", parId, (typeOfCheck == 'what' ? (associated[1].who.split(" ")[0] + "<br><br>" + associated[1][typeOfCheck.toLowerCase()]) : associated[1][typeOfCheck.toLowerCase()]), associated[1].id);
							if (associated.length > 2) {
								addCircle((parentRad + childRad + 5), currentX, currentY, 225, childRad, "topLeft", parId, (typeOfCheck == 'what' ? (associated[2].who.split(" ")[0] + "<br><br>" + associated[2][typeOfCheck.toLowerCase()]) : associated[2][typeOfCheck.toLowerCase()]), associated[2].id);
							}
						}
					}
					break;
				case "topRight":
					associated = getAssociatedItems(parent, typeOfCheck, 3);
					if (associated.length > 0) {
						addCircle((parentRad + childRad + 5), currentX, currentY, 215, childRad, "topLeft", parId, (typeOfCheck == 'what' ? (associated[0].who.split(" ")[0] + "<br><br>" + associated[0][typeOfCheck.toLowerCase()]) : associated[0][typeOfCheck.toLowerCase()]), associated[0].id);
						if (associated.length > 1) {
							addCircle((parentRad + childRad + 5), currentX, currentY, 315, childRad, "topRight", parId, (typeOfCheck == 'what' ? (associated[1].who.split(" ")[0] + "<br><br>" + associated[1][typeOfCheck.toLowerCase()]) : associated[1][typeOfCheck.toLowerCase()]), associated[1].id);
							if (associated.length > 2) {
								addCircle((parentRad + childRad + 5), currentX, currentY, 45, childRad, "bottomRight", parId, (typeOfCheck == 'what' ? (associated[2].who.split(" ")[0] + "<br><br>" + associated[2][typeOfCheck.toLowerCase()]) : associated[2][typeOfCheck.toLowerCase()]), associated[2].id);
							}
						}
					}
					break;
			}
			drawCircles();
		}

		function drawCircles () {
			canvas.empty();
			$("#overallDiv").empty();
			for (var i = 0; i < circles.length; i++) {
				var x = d3.select("svg")
					.append("circle")
					.attr("id", circles[i].id)
					.attr("cx", circles[i].x)
					.attr("cy", circles[i].y)
					.attr("r", circles[i].radius)
					.style("fill", "blue");

				if (circles[i].radius < 20) {
					$(x[0]).on("click", function () {
						zoomCircle(circles[parseInt($(this)[0].id)].parent);
					});
					drawTextDiv(circles[i].x, circles[i].y, circles[i].radius, "<i class='fa fa-search-plus'></i>");
				}
				else {
					$(x[0]).on("click", function () {
						var id = parseInt($(this)[0].id);
						if (circles[id].attr.indexOf("aspect") > -1) {
							replaceWhoWhatWhenWhere(id);
						}
						else {
							if (circles[id].hasChild) {
								hideChildren(id);
							}
							else {
								splitCircle(id);
							}
						}
					});
					drawTextDiv(circles[i].x, circles[i].y, circles[i].radius, circles[i].text);
				}
			}
		}

		function drawTextDiv(cx, cy, r, text) {
			var d = $("<div class='unclickableDiv'><span class='unclickableSpan'>"+text+"</span></div>");
			if (r < 40 && r > 20) {
				d.css("font-size", "15px");
			}
			d.css("width", r*2);
			d.css("height", r*2);
			d.css("left", (cx - r));
			d.css("top", (cy - r));
			$("#overallDiv").append(d);
		}

		$(".se-pre-con").hide();

	}]);