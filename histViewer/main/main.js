'use strict';

angular.module('histViewer.main', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/main', {
			templateUrl: 'main/main.html',
			controller: 'MainCtrl',
			controllerAs: 'vm'
		});
	}])

	.directive('timeline', function () {
		return {
			restrict: "E",
			replace: true,
			templateUrl: "timeline/timeline.html"
		};
	})

	//Testing

	.directive('bubble', function () {
		return {
			restrict: "E",
			replace: true,
			templateUrl: "bubble/bubble.html"
		}
	})

	.controller('MainCtrl', ['$scope', 'DatabaseControlService', 'HistoryService', '$location', '$timeout', '$http', function ($scope, DatabaseControlService, HistoryService, $location, $timeout, $http) {
		$scope.currentView = 'timeline';

		var totalTimelineEvents = [];

		$scope.allImages = {};

		var timelineEventLocations = [];
		var numberShownEvents = 0;

		var heightDynamicalyUpdated = false;

		$scope.redirectToDatabase = function () {
			$location.path('/db/main');
		};

		function triggerClickScroll() {
			debiki.Utterscroll.enable({
				scrollstoppers: '.CodeMirror, .ui-resizable-handle' });
		}

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

		$scope.generateTimeline = function (person) {
			$("#timelineContainer").empty(); //Delete any other timelines that are currently shown.
			timelineEventLocations = [];
			numberShownEvents = 0;
			$(".se-pre-con").show(); //Show the loading spinner
			$scope.person = person;
			DatabaseControlService.queryForWho(person.name.toUpperCase()).then(function () {//Load the data from the person selected
				var timelineEvents = DatabaseControlService.getQueryItems();
				for (var i = 0; i < timelineEvents.length; i++) {
					timelineEvents[i].who = correctCapitalization(timelineEvents[i].who);
				}
				totalTimelineEvents.push(timelineEvents);
				removePersons(timelineEvents);
				createTimeline(totalTimelineEvents);
				$(".se-pre-con").fadeOut("slow"); //Hide the loading spinner
			});
		};

		//This function is used with the checkHistory function. Because it is going to be called when returning from somewhere then we need to wait for everything to load.
		var waitForRenderAndDoSomething = function() {
			if($http.pendingRequests.length > 0) {
				$timeout(waitForRenderAndDoSomething); // Wait for all templates to be loaded
			} else {
				for (var i in totalTimelineEvents) {
					if (totalTimelineEvents.hasOwnProperty(i)) {
						removePersons(totalTimelineEvents[i]);
					}
				}
				if (totalTimelineEvents.length == 1) {
					$scope.person = {
						"name":totalTimelineEvents[0][0].who,
						"url":$scope.allImages[totalTimelineEvents[0][0].who]
					};
				}
				createTimeline(totalTimelineEvents);
			}
		};

		//This function is called whenever the page is loaded. It checks if there is a point that the page needs to return to.
		function checkHistory() {
			var hist = HistoryService.getTimelineHistory();
			if (hist.length) {
				totalTimelineEvents = hist;
				$timeout(waitForRenderAndDoSomething); // Waits for first digest cycle
			}
		}

		//This function is used to add people back into the listing on the left.
		function addPersons(name) {
			var obj = {
				"name": name,
				"url": $scope.allImages[name]
			};
			$scope.people.push(obj);
			//$scope.$apply();
		}

		//This function is used to remove the person's name from the listing on the left so that they cannot be selected twice.
		function removePersons(event) {
			var checkName = event[0].who;
			for (var i = 0; i < $scope.people.length; i++) {
				if (checkName == $scope.people[i].name) {
					$scope.people.splice(i, 1);
					break;
				}
			}
		}

		//This function is called whenever a timeline event is clicked. The item variable is the html element clicked (div)
		function eventClick (item) {
			var itemId = item.currentTarget.id;
			var itemNum = parseInt(itemId.substr(itemId.indexOf("-") + 1));
			HistoryService.setTimelineHistory(totalTimelineEvents);
			$location.path('/bubble/' + timelineEventLocations[itemNum-1].event.id);
			$scope.$apply();
		}

		//This function takes information that is calculated in the createTimeline function and dynamically adds an event circle and popup
		function drawEvent (event, yearGap, timelineHeight, minYear, maxYear, blankAreaOnSideOfTimeline) {
			var sectionMinYear;
			for (var i = minYear; i < maxYear; i += yearGap) {
				if (moment(new Date(event.when)).year() >= i) { //
					sectionMinYear = i;
				}
			}
			numberShownEvents++;

			var sectionsSkipped = (sectionMinYear - minYear)/yearGap;

			var momentMin = moment(new Date("Jan 01 " + sectionMinYear + ""));
			var momentMax = moment(new Date("Jan 01 " + (sectionMinYear + yearGap) + ""));
			var momentEvent = moment(new Date(event.when));

			var percentDistBetween = ((momentEvent - momentMin)/(momentMax - momentMin));
			var xPos = blankAreaOnSideOfTimeline + (120 * sectionsSkipped) + (120 * percentDistBetween);

			var topVal = timelineHeight - 6;
			var left = xPos - 7.5;

			$scope.currentEventLocation = {
				"top": topVal,
				"left": left
			};

			var evCirc = $(".eventCircle");

			//the event circle is animated when the mouse is hover over it.
			evCirc.hover(function(){
				$(this).addClass('animated bounceIn');
				$(this).css("background-color", "green");
			}, function(){
				$(this).removeClass('animated bounceIn');
				$(this).css("background-color", "#ff3700");
			});

			evCirc.each(function(i, obj) {
				var objPos = $(obj).position();
				if (objPos.top == $scope.currentEventLocation.top) {
					if (Math.abs(objPos.left - $scope.currentEventLocation.left) <= 15 ) {
						$(obj).css("background-color", "#ff3700");
						//Will need to do something so that we create an event circle that has several events in it.
						if (Math.abs(objPos.left - $scope.currentEventLocation.left) <= 5) {//Temporary fix for extremely close events
							$(obj).css("left", objPos.left + 5);
						}
					}
				}
			});

			var div = '<div class="eventCircle" id="event-' + numberShownEvents + '" style="top:' + topVal + 'px;left:' + left + 'px;">';
			timelineEventLocations.push({
				numberShownEvents:numberShownEvents,
				xPos:xPos, timelineHeight:timelineHeight,
				event:event
			});

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

			var curEvent = document.getElementById("event-" + numberShownEvents);
			curEvent.onclick = eventClick;
		}

		//This function draws text on the timeline space centered at the given coordinates
		function drawText(x, y, text) {
			var div = '<div style="position:absolute;height:12px;width:30px;font-size:12px;top:' + (y - 6) + 'px;left:' + (x - 15) + 'px;">' + text + '</div>';
			$("#scrolling-timeline").append(div);
		}

		//This function draws the lines for the timeline. It has the ability to draw lines between any two given points.
		function DrawLine(x1, y1, x2, y2, lineWidth) {
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
			if (lineWidth) {
				div.setAttribute('style', 'border:' + lineWidth + 'px solid black;width:' + width + 'px;height:0px;-moz-transform:rotate(' + deg + 'deg);-webkit-transform:rotate(' + deg + 'deg);position:absolute;top:' + y + 'px;left:' + x + 'px;');
			}
			else {
				div.setAttribute('style', 'border:2px solid black;width:' + width + 'px;height:0px;-moz-transform:rotate(' + deg + 'deg);-webkit-transform:rotate(' + deg + 'deg);position:absolute;top:' + y + 'px;left:' + x + 'px;');
			}

			document.getElementById("scrolling-timeline").appendChild(div);

		}

		//This function returns the lowest date out of all of the events.
		function getMinDate(events) {
			var minDate = -1;
			for (var i in events) {
				if (events.hasOwnProperty(i)) {
					if (minDate == -1) {
						minDate = moment(new Date(events[i].when));
					}
					else if (moment(new Date(events[i].when)) < minDate) {
						minDate = moment(new Date(events[i].when));
					}
				}
			}
			return minDate;
		}

		//This function returns the highest date out of all the events.
		function getMaxDate(events) {
			var maxDate = -1;
			for (var i in events) {
				if (events.hasOwnProperty(i)) {
					if (maxDate == -1) {
						maxDate = moment(new Date(events[i].when));
					}
					else if (moment(new Date(events[i].when)) > maxDate) {
						maxDate = moment(new Date(events[i].when));
					}
				}
			}
			maxDate.add(1, 'years');
			return maxDate;
		}

		//This function is a helper function for the createTimelineImage in order to remove people from the totalTimelineEvents
		function removeFromTotalEvents (name) {
			var newTotalEvents = [];

			addPersons(name);

			for (var i in totalTimelineEvents) {
				if (totalTimelineEvents.hasOwnProperty(i)) {
					if (totalTimelineEvents[i][0].who != name) {
						newTotalEvents.push(totalTimelineEvents[i]);
					}
				}
			}

			totalTimelineEvents = newTotalEvents;

			$("#timelineContainer").empty(); //Delete any other timelines that are currently shown.

			//Need to check if there is only one event in order to fix the name.
			if (totalTimelineEvents.length == 1) {
				createTimeline(totalTimelineEvents, false, totalTimelineEvents[0][0].who);
			}
			else {
				createTimeline(totalTimelineEvents);
			}
		}

		//This function creates the image and bubble to the left of the timelines
		function createTimelineImage(centerX, centerY, personName) {
			var drawSpace = $('#timelineDrawSpace');

			if (centerY + 40 > drawSpace.height()) {
				heightDynamicalyUpdated = true;
				var newHeight = drawSpace.height() + 175;
				drawSpace.height(newHeight);
				$('#timelineContainer').height(newHeight);
				$('#viewContainer').height(newHeight);
				$('#sideBar').height(newHeight);
				$('#wholeScreen').height(newHeight);
			}

			var div = $('<div />', {
				"class": 'timelineImage'
			});

			div.on("click", function(){
				var curName = $(this).find('.timelineName').text();
				removeFromTotalEvents(curName);
				$scope.$apply();
			});

			var mapDiv = $('<div />', {
				"class": 'timelineImageMapIcon'
			});

			mapDiv.on("click", function() {
				var curName = $(this).parent().find('.timelineName').text();
				HistoryService.setTimelineHistory(totalTimelineEvents);
				HistoryService.setLeavingView('timeline');
				$location.path('/map/' + curName);
			});

			var fa = '<i class="fa fa-user"></i>';
			var actualImg;

			if (personName) {
				actualImg = '<img class="timelineActualImg" src="' + $scope.allImages[personName] + '">';
			}
			else {
				actualImg = '<img class="timelineActualImg" src="' + $scope.person.url + '">';
			}

			var faMap = '<i class="fa fa-globe"></i>';

			div.append(actualImg);
			mapDiv.append(faMap);

			var person;
			if ($scope.person && $scope.person.url) {
				person = '<p class="timelineName" style="margin-top:-14px">';
			}
			else {
				person = '<p class="timelineName" style="margin-top:8px">';
			}
			if (personName) {
				person += personName + '</p>';
			}
			else {
				person += $scope.person.name + '</p>';
			}

			div.append(person);

			var divWidth = 50;
			var divHeight = 50;
			div.css('left', centerX - divWidth );
			div.css('top', centerY - divHeight);

			mapDiv.css('left', 60);
			mapDiv.css('top', -10);

			drawSpace.append(div);
			div.append(mapDiv);
		}

		//This function checks if there are several objects close together that may overlap eachother.
		function checkCloseObjects (events, yearGap, minYear, maxYear) {
			var arr = [];
			var needsAdjustment = false;
			for (var i = 0; i < (maxYear - minYear); i++) {
				arr[i] = 0;
			}

			for (var j in events) {
				if (events.hasOwnProperty(j)) {
					var eventYear = moment(new Date(events[j].when)).year();
					arr[(eventYear - minYear)] += 1;
					if (arr[(eventYear - minYear)] > 2) {
						needsAdjustment = true;
						break;
					}
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

		//This function calculates how much timelines need to be moved right or left in order for them to line up.
		function calculateEventSeparations(eventArrays) {
			if (eventArrays.length < 2) {
				return;
			}

			var minDates = [];
			var returnArr = [];
			var minDate = 9999;

			for (var i in eventArrays) {
				if (eventArrays.hasOwnProperty(i)) {
					minDates.push(getMinDate(eventArrays[i]).year());
				}
			}

			for (var j in minDates) {
				if (minDates.hasOwnProperty(j)) {
					if (minDate > minDates[j]) {
						minDate = minDates[j];
					}
				}
			}

			for (var k in minDates) {
				if (minDates.hasOwnProperty(k)) {
					returnArr.push({"yearDiff": (minDates[k] - minDate)});
				}
			}

			return returnArr;
		}

		//This function generates the timeline. It calls most other functions.
		function createTimeline(totalEvents, location, personName, gapBeginning, inYearGap) {
			if (totalEvents.length == 1) {
				var events = totalEvents[totalEvents.length - 1];
				var cont = $("#timelineContainer");
				var viewWidth = cont.width();
				//var viewHeight = cont.height();
				var switchNum = (location ? location : 1);
				var midlineHeight;

				midlineHeight = switchNum * 185;

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

				if (inYearGap) {
					yearGap = inYearGap;
				}

				if (minYear % yearGap != 0) {
					minYear -= (minYear % yearGap);
				}
				if (maxYear % yearGap != 0) {
					maxYear += (yearGap - (maxYear % yearGap));
				}

				sectionsNeeded = (maxYear - minYear)/yearGap;

				if (sectionsNeeded < 8 && !inYearGap) {
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
				if (gapBeginning) {
					blankAreaOnSideOfTimeline += gapBeginning;
				}

				//Create a div for the timeline
				var timelineSpace = '<div id="timelineDrawSpace" class="timelineDrawSpace" style="width:' + (viewWidth - 110) + 'px"><div id="scrolling-timeline" class="scrolling-timeline" style="width:' + ((sectionsNeeded * 120) + (2 * 40)) + 'px"></div></div>';

				cont.append(timelineSpace);

				if (personName) {
					createTimelineImage(410, midlineHeight, personName);
				}
				else  {
					createTimelineImage(410, midlineHeight);
				}

				//100px + 10px border to the left of the line for the picture.
				//Also has a 10px border on the right of the line to be visually pleasing.
				var lineWidth = blankAreaOnSideOfTimeline + (sectionsNeeded * 120);

				DrawLine(blankAreaOnSideOfTimeline, midlineHeight, lineWidth, midlineHeight);
				for (var secCount = 0; secCount <= sectionsNeeded; secCount++) {
					DrawLine((blankAreaOnSideOfTimeline + (120 * secCount)), (midlineHeight - 20), (blankAreaOnSideOfTimeline + (120 * secCount)), (midlineHeight + 20));
					drawText((blankAreaOnSideOfTimeline + (120 * secCount)), (midlineHeight + 28), "" + (minYear + (yearGap * secCount)) + "");
				}

				if (yearGap > 1) {
					var tickSpacing = 120/yearGap;
					for (var k = 0; k < sectionsNeeded; k++) {
						var start = blankAreaOnSideOfTimeline + 120*k;
						for (var j = 1; j <= yearGap; j++) {
							var x = start + (tickSpacing * j);
							DrawLine(x, (midlineHeight - 10), x, (midlineHeight + 10), 1);
						}
					}
				}

				//Draw all of the events.
				for (var event in events) {
					if (events.hasOwnProperty(event)) {
						drawEvent(events[event], yearGap, midlineHeight, minYear, maxYear, blankAreaOnSideOfTimeline);
					}
				}
			}
			else if (totalEvents.length < 1) {

			}
			else {
				var values = calculateEventSeparations(totalEvents);

				for (var i in values) {
					if (values.hasOwnProperty(i)) {
						var a = [];
						a.push(totalEvents[i]);
						createTimeline(a, parseInt(i)+1, totalEvents[i][0].who, (120 * Math.floor(values[i].yearDiff/2)), 2);
					}
				}
			}
		}

		//This function generates the list of people on the list to the left.
		function generatePeople() {
			var people = [];
			var currentPerson = "";
			for (var i in $scope.allItems) {
				if ($scope.allItems.hasOwnProperty(i)) {
					if (!currentPerson || $scope.allItems[i].who != currentPerson) {
						currentPerson = $scope.allItems[i].who;
						var addItem = {
							"name":currentPerson,
							"url":$scope.allItems[i].imgUrl
						};
						people.push(addItem);
					}
				}
			}
			people = $.unique(people);
			$scope.people = people;
		}

		$scope.count = 0;

		function readyUp() {
			$scope.count+=1;
			if ($scope.count > 1) {
				//Add urls to allItems
				for (var i = 0; i < $scope.allItems.length; i++) {
					$scope.allItems[i].imgUrl = $scope.allImages[$scope.allItems[i].who];
				}
				generatePeople();
				checkHistory();
				triggerClickScroll();
				$(".se-pre-con").fadeOut("slow");
			}
		}

		DatabaseControlService.ensureImagesPopulated().then(function () {
			var images = DatabaseControlService.getImages();
			for (var i = 0; i < images.length; i++) {
				var image = images[i];
				var newName = correctCapitalization(image.name);
				$scope.allImages[newName] = image.url;
			}
			readyUp();
		});

		DatabaseControlService.ensureDataPopulated().then(function () {
			$scope.allItems = DatabaseControlService.getItems();
			for (var i = 0; i < $scope.allItems.length; i++) {
				$scope.allItems[i].who = correctCapitalization($scope.allItems[i].who);
			}
			readyUp();
		});

		//Create variables in order to access certain DOM elements
		var screen = document.getElementById("wholeScreen");
		var sideBar = document.getElementById("sideBar");
		var viewContainer = document.getElementById("viewContainer");
		var timelineContainer = document.getElementById("timelineContainer");
		var bubbleContainer = document.getElementById("bubbleContainer");
		var html = document.documentElement;

		//Get the dimensions of the screen.
		var height = html.clientHeight;
		var width = html.clientWidth;

		//Set dom elements to certain heights and widths depending on the screen dimensions
		screen.setAttribute("style", "height:" + height + "px;width:" + width + "px;");
		sideBar.setAttribute("style", "height:" + height + "px;width:" + 350 + "px;");
		viewContainer.setAttribute("style", "height:" + height + "px;width:" + (width - 350) + "px;");
		timelineContainer.setAttribute("style", "height:" + height + "px;width:" + (width - 350) + "px;");
		bubbleContainer.setAttribute("style", "height:" + height + "px;width:" + (width - 350) + "px;");

		//Function that does the above section whenever the screen is resized.
		window.onresize = function () {
			if (heightDynamicalyUpdated) {
				return;
			}
			height = html.clientHeight;
			width = html.clientWidth;

			screen.setAttribute("style", "height:" + height + "px;width:" + width + "px;");
			sideBar.setAttribute("style", "height:" + height + "px;width:" + 350 + "px;");
			viewContainer.setAttribute("style", "height:" + height + "px;width:" + (width - 350) + "px;");
			timelineContainer.setAttribute("style", "height:" + height + "px;width:" + (width - 350) + "px;");
			bubbleContainer.setAttribute("style", "height:" + height + "px;width:" + (width - 350) + "px;");
		};
	}]);