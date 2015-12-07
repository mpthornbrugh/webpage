'use strict';

angular.module('histViewer.main', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/main', {
			templateUrl: 'main/main.html',
			controller: 'MainCtrl'
		});
	}])

	.directive('timeline', function () {
		return {
			restrict: "E",
			replace: true,
			templateUrl: "timeline/timeline.html"
		};
	})

	.directive('bubble', function () {
		return {
			restrict: "E",
			replace: true,
			templateUrl: "bubble/bubble.html"
		}
	})

	.controller('MainCtrl', ['$scope', 'DatabaseControlService', function ($scope, DatabaseControlService) {
		$scope.currentView = 'timeline';

		var isFirstTimeline = true;

		$scope.generateTimeline = function (person) {
			//Need to adjust this when we do multiple timelines
			isFirstTimeline = true;
			$("#timelineContainer").empty(); //Delete any other timelines that are currently shown.
			$(".se-pre-con").show(); //Show the loading spinner
			$scope.person = person;
			DatabaseControlService.queryForWho(person).then(function () {//Load the data from the person selected
				var timelineEvents = DatabaseControlService.getQueryItems();
				createTimeline(timelineEvents);
				$(".se-pre-con").fadeOut("slow"); //Hide the loading spinner
			});
		};

		//This function takes information that is calculated in the createTimeline function and dynamically adds an event circle and popup
		function drawEvent (event, yearGap, timelineHeight, minYear, maxYear, blankAreaOnSideOfTimeline) {
			var sectionMinYear;
			for (var i = minYear; i < maxYear; i += yearGap) {
				if (moment(event.when).year() >= i) { //
					sectionMinYear = i;
				}
			}

			var sectionsSkipped = (sectionMinYear - minYear)/yearGap;

			var momentMin = moment("Jan 01 " + sectionMinYear + "");
			var momentMax = moment("Jan 01 " + (sectionMinYear + yearGap) + "");
			var momentEvent = moment(event.when);

			var percentDistBetween = ((momentEvent - momentMin)/(momentMax - momentMin));
			var xPos = blankAreaOnSideOfTimeline + (120 * sectionsSkipped) + (120 * percentDistBetween);

			var div = '<div class="eventCircle" style="top:' + (timelineHeight - 6) + 'px;left:' + (xPos - 7.5) + 'px;">';

			var innerdiv = '<div class="timelinePopup" ';
			if ((momentEvent.year() - minYear)/yearGap <= 2) { //Circle is within the first 2 timeline sections
				innerdiv += 'style="left:0;>"';
			}
			else if ((maxYear - momentEvent.year())/yearGap <= 2) { //Circle is within the last 2 timeline sections
				innerdiv += 'style="left:-300px;>"';
			}
			else { //Circle is in the middle of the timeline
				innerdiv += 'style="left:-150px;>"';
			}
			innerdiv += "</br>";//Dummy thing to make first line show.
			innerdiv += "<b>Who</b>: " + event.who + "</br>" + "<b>What</b>: " + event.what + "</br>" + "<b>When</b>: " + event.when + "</br>" + "<b>Where</b>: " + event.where;
			innerdiv += '</div>';

			div += innerdiv;
			div += '</div>';
			$("#scrolling-timeline").append(div);
		}

		//This function draws text on the timeline space centered at the given coordinates
		function drawText(x, y, text) {
			var div = '<div style="position:absolute;height:12px;width:30px;font-size:12px;top:' + (y - 6) + 'px;left:' + (x - 15) + 'px;">' + text + '</div>';
			$("#scrolling-timeline").append(div);
		}

		//This function draws the lines for the timeline. It has the ability to draw lines between any two given points.
		function DrawLine(x1, y1, x2, y2) {
			if (y1 < y2) {
				var pom = y1;
				y1 = y2;
				y2 = pom;
				pom = x1;
				x1 = x2;
				x2 = pom;
			}

			var a = Math.abs(x1 - x2);
			var b = Math.abs(y1 - y2);
			var c;
			var sx = (x1 + x2) / 2;
			var sy = (y1 + y2) / 2;
			var width = Math.sqrt(a * a + b * b);
			var x = sx - width / 2;
			var y = sy;

			a = width / 2;

			c = Math.abs(sx - x);

			b = Math.sqrt(Math.abs(x1 - x) * Math.abs(x1 - x) + Math.abs(y1 - y) * Math.abs(y1 - y));

			var cosb = (b * b - a * a - c * c) / (2 * a * c);
			var rad = Math.acos(cosb);
			var deg = (rad * 180) / Math.PI;

			var htmlns = "http://www.w3.org/1999/xhtml";
			var div = document.createElementNS(htmlns, "div");
			div.setAttribute('style', 'border:2px solid black;width:' + width + 'px;height:0px;-moz-transform:rotate(' + deg + 'deg);-webkit-transform:rotate(' + deg + 'deg);position:absolute;top:' + y + 'px;left:' + x + 'px;');

			document.getElementById("scrolling-timeline").appendChild(div);

		}

		//This function returns the lowest date out of all of the events.
		function getMinDate(events) {
			var minDate;
			for (var i in events) {
				if (!minDate) {
					minDate = moment(events[i].when);
				}
				else if (moment(events[i].when) < minDate) {
					minDate = moment(events[i].when);
				}
			}
			return minDate;
		}

		//This function returns the highest date out of all the events.
		function getMaxDate(events) {
			var maxDate;
			for (var i in events) {
				if (!maxDate) {
					maxDate = moment(events[i].when);
				}
				else if (moment(events[i].when) > maxDate) {
					maxDate = moment(events[i].when);
				}
			}
			maxDate.add(1, 'years');
			return maxDate;
		}


		function createTimelineImage(centerX, centerY) {
			var div = $('<div />', {
				"class": 'timelineImage'
			});

			var fa = '<i class="fa fa-user"></i>';

			div.append(fa);

			var person = '<p class="timelineName">' + $scope.person + '</p>';

			div.append(person);

			var divWidth = 50;
			var divHeight = 50;
			div.css('left', centerX - divWidth );
			div.css('top', centerY - divHeight);

			$("#timelineDrawSpace").append(div);
		}

		function checkCloseObjects (events, yearGap, minYear, maxYear) {
			var arr = [];
			var needsAdjustment = false;
			for (var i = 0; i < (maxYear - minYear); i++) {
				arr[i] = 0;
			}

			for (var i in events) {
				var eventYear = moment(events[i].when).year();
				arr[(eventYear - minYear)] += 1;
				if (arr[(eventYear - minYear)] > 2) {
					needsAdjustment = true;
					break;
				}
			}
			if (needsAdjustment) {
				switch (yearGap) {
					case 10:
						yearGap = 5;
						break;
					case 5:
						yearGap = 2;
						break;
					case 2:
						yearGap = 1;
						break;
					default:
						yearGap = yearGap/2;
						break;
				}
			}

			return yearGap;
		}

		function createTimeline(events) {
			if (isFirstTimeline) {
				isFirstTimeline = false;
				var cont = $("#timelineContainer");
				var viewWidth = cont.width();
				var viewHeight = cont.height();
				var midlineHeight = viewHeight / 2;

				//Calculate how many sections of 10 years are needed.
				var minDate = getMinDate(events);
				var maxDate = getMaxDate(events);

				var minYear = minDate.year();
				var maxYear = maxDate.year();

				var sectionsNeeded;
				var yearGap = 10;

				if (maxYear - minYear < 80) {
					yearGap = 5;
				}
				if (maxYear - minYear < 40) {
					yearGap = 2;
				}

				yearGap = checkCloseObjects(events, yearGap, minYear, maxYear);

				if (minYear % yearGap != 0) {
					minYear -= (minYear % yearGap);
				}
				if (maxYear % yearGap != 0) {
					maxYear += (yearGap - (maxYear % yearGap));
				}

				sectionsNeeded = (maxYear - minYear)/yearGap;

				if (sectionsNeeded < 8) {
					//Expand the timeline
					switch (yearGap) {
						case 10:
							if (sectionsNeeded < 4) { //Need to expand to use the 2 year gap
								if (sectionsNeeded == 1) { //There were only 1 section need to expand to use the 1 year gap
									yearGap = 1;
									sectionsNeeded *= 10;
								}
								else {
									yearGap = 2;
									sectionsNeeded *= 5;
								}
							}
							else {
								yearGap = 5;
								sectionsNeeded *= 2;
							}
							break;
						case 5:
							if (sectionsNeeded == 1) { //There was only 1 section. Need to expand to use the 1 year gap
								yearGap = 1;
								sectionsNeeded *= 5;
							}
							else { //The timeline needs to be expanded and use the 2 year gap.
								yearGap = 2;
								sectionsNeeded *= (5/2);
							}
							break;
						case 2:
							sectionsNeeded *= 2;
							yearGap = 1;
							break;
					}
				}

				var blankAreaOnSideOfTimeline = 30;

				//Create a div for the timeline
				var timelineSpace = '<div id="timelineDrawSpace" class="timelineDrawSpace" style="width:' + (viewWidth - 110) + 'px"><div id="scrolling-timeline" class="scrolling-timeline" style="width:' + ((sectionsNeeded * 120) + (2 * blankAreaOnSideOfTimeline)) + 'px"></div></div>';

				cont.append(timelineSpace);

				createTimelineImage(410, midlineHeight);

				//100px + 10px border to the left of the line for the picture.
				//Also has a 10px border on the right of the line to be visually pleasing.
				var lineWidth = blankAreaOnSideOfTimeline + (sectionsNeeded * 120);

				DrawLine(blankAreaOnSideOfTimeline, midlineHeight, lineWidth, midlineHeight);
				for (var i = 0; i <= sectionsNeeded; i++) {
					DrawLine((blankAreaOnSideOfTimeline + (120 * i)), (midlineHeight - 20), (blankAreaOnSideOfTimeline + (120 * i)), (midlineHeight + 20));
					drawText((blankAreaOnSideOfTimeline + (120 * i)), (midlineHeight + 28), "" + (minYear + (yearGap * i)) + "");
				}

				//Draw all of the events.
				for (var i in events) {
					drawEvent(events[i], yearGap, midlineHeight, minYear, maxYear, blankAreaOnSideOfTimeline);
				}
			}
			else {
				//In here the code for multiply timelines will be generated.
			}
		}

		//DrawLine(360, 200, 1000, 200);

		function generatePeople() {
			var people = [];
			var currentPerson = "";
			for (var i in $scope.allItems) {
				if (!currentPerson || $scope.allItems[i].who != currentPerson) {
					currentPerson = $scope.allItems[i].who;
					people.push(currentPerson);
				}
			}
			people = $.unique(people);
			$scope.people = people;
		}

		DatabaseControlService.ensureDataPopulated().then(function () {
			$scope.allItems = DatabaseControlService.getItems();
			generatePeople();
			$(".se-pre-con").fadeOut("slow");
		});

		var screen = document.getElementById("wholeScreen");
		var sideBar = document.getElementById("sideBar");
		var viewContainer = document.getElementById("viewContainer");
		var timelineContainer = document.getElementById("timelineContainer");
		var bubbleContainer = document.getElementById("bubbleContainer");
		var html = document.documentElement;

		var height = html.clientHeight;
		var width = html.clientWidth;

		screen.setAttribute("style", "height:" + height + "px;width:" + width + "px;");
		sideBar.setAttribute("style", "height:" + height + "px;width:" + 350 + "px;");
		viewContainer.setAttribute("style", "height:" + height + "px;width:" + (width - 350) + "px;");
		timelineContainer.setAttribute("style", "height:" + height + "px;width:" + (width - 350) + "px;");
		bubbleContainer.setAttribute("style", "height:" + height + "px;width:" + (width - 350) + "px;");

		window.onresize = function () {
			height = html.clientHeight;
			width = html.clientWidth;

			screen.setAttribute("style", "height:" + height + "px;width:" + width + "px;");
			sideBar.setAttribute("style", "height:" + height + "px;width:" + 350 + "px;");
			viewContainer.setAttribute("style", "height:" + height + "px;width:" + (width - 350) + "px;");
			timelineContainer.setAttribute("style", "height:" + height + "px;width:" + (width - 350) + "px;");
			bubbleContainer.setAttribute("style", "height:" + height + "px;width:" + (width - 350) + "px;");
		};
	}]);