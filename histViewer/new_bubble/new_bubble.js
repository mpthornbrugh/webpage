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

		$scope.goBackToTimeline = function () {
			$location.path('/main');
		};

		$scope.goToCircleHistory = function(history, index) {
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
			addCircle((parentRad + childRad + 10), parent.x, parent.y, 45, childRad, "aspect", parentId, "Who");
			addCircle((parentRad + childRad + 10), parent.x, parent.y, 135, childRad, "aspect", parentId, "What");
			addCircle((parentRad + childRad + 10), parent.x, parent.y, 225, childRad, "aspect", parentId, "When");
			addCircle((parentRad + childRad + 10), parent.x, parent.y, 315, childRad, "aspect", parentId, "Where");
		}

		function start () {
			circles[0] = {
				"id":0,
				"x":docWidth/2,
				"y":docHeight/2,
				"radius":Math.min(docHeight, docWidth)/5,
				"attr": "center",
				"parent":-1,
				"text":"Was Born"
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

		function addCircle (distance, curX, curY, angle, newRad, attribute, parentNum, text) {
			var moveX = getX(distance, angle);
			var moveY = getY(distance, angle);
			circles.push({
				"id":circles.length,
				"x":curX + moveX,
				"y":curY + moveY,
				"radius":newRad,
				"attr": attribute,
				"parent":parentNum,
				"text":text,
				"hasChild":false
			});
		}

		function zoomCircle (id) {
			var newCircArr = [];
			for (var i = 0; i < circles.length; i++) {
				if (circles[i].id == id) {
					newCircArr.push(circles[i]);
				}
			}
			//Now newCircArr is the circle above the magnification spot. Need to set this as the center bubble

			newCircArr[0] = {
				"id":0,
				"x":docWidth/2,
				"y":docHeight/2,
				"radius":Math.min(docHeight, docWidth)/5,
				"attr": "center",
				"parent":-1,
				"text":newCircArr[0].text,
				"hasChild":false
			};
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
			switch (circles[id].attr) {
				case "center":
					addCircle((parentRad + childRad + 10), currentX, currentY, 45, childRad, "bottomRight", id, "Bonn, Electorate of Cologne");
					addCircle((parentRad + childRad + 10), currentX, currentY, 135, childRad, "bottomLeft", id, "Was Born");
					addCircle((parentRad + childRad + 10), currentX, currentY, 225, childRad, "topLeft", id, "Wed Dec 12 1770");
					addCircle((parentRad + childRad + 10), currentX, currentY, 315, childRad, "topRight", id, "Ludwig van Beethoven");
					break;
				case "bottomRight":
					addCircle((parentRad + childRad + 5), currentX, currentY, 45, childRad, "bottomRight", id, "test1");
					addCircle((parentRad + childRad + 5), currentX, currentY, 135, childRad, "bottomLeft", id, "test2");
					addCircle((parentRad + childRad + 5), currentX, currentY, 315, childRad, "topRight", id, "test3");
					break;
				case "bottomLeft":
					addCircle((parentRad + childRad + 5), currentX, currentY, 45, childRad, "bottomRight", id, "test1");
					addCircle((parentRad + childRad + 5), currentX, currentY, 135, childRad, "bottomLeft", id, "test2");
					addCircle((parentRad + childRad + 5), currentX, currentY, 225, childRad, "topLeft", id, "test3");
					break;
				case "topLeft":
					addCircle((parentRad + childRad + 5), currentX, currentY, 135, childRad, "bottomLeft", id, "test1");
					addCircle((parentRad + childRad + 5), currentX, currentY, 225, childRad, "topLeft", id, "test2");
					addCircle((parentRad + childRad + 5), currentX, currentY, 315, childRad, "topRight", id, "test3");
					break;
				case "topRight":
					addCircle((parentRad + childRad + 5), currentX, currentY, 45, childRad, "bottomRight", id, "test1");
					addCircle((parentRad + childRad + 5), currentX, currentY, 225, childRad, "topLeft", id, "test2");
					addCircle((parentRad + childRad + 5), currentX, currentY, 315, childRad, "topRight", id, "test3");
					break;
			}
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

		function replaceWhoWhatWhenWhere(id) {
			var parent = circles[circles[id].parent];
			var typeOfCheck = circles[id].text;
			hideChildren(circles[id].parent, true);
			debugger;
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
						if (circles[id].attr == "aspect") {
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