'use strict';

angular.module('histViewer.historyService', ['ngRoute'])
	.service('HistoryService', ['$q', '$http', function ($q, $http) {

		var timelineHistory = [];
		var lastView;
		var lastBubble;

		var setTimelineHistory = function (history) {
			timelineHistory = history;
		};

		var getTimelineHistory = function () {
			return timelineHistory;
		};

		var setLeavingView = function (view) {
			lastView = view;
		};

		var getLastView = function () {
			return lastView;
		};

		var setLastBubble = function (id) {
			lastBubble = id;
		};

		var getLastBubble = function () {
			return lastBubble;
		};

		return {
			setTimelineHistory:   setTimelineHistory,
			getTimelineHistory:   getTimelineHistory,
			setLeavingView:       setLeavingView,
			getLastView:          getLastView,
			setLastBubble:        setLastBubble,
			getLastBubble:        getLastBubble
		};
	}]);