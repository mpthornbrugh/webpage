'use strict';

angular.module('histViewer.historyService', ['ngRoute'])
	.service('HistoryService', ['$q', '$http', function ($q, $http) {

		var timelineHistory = [];

		var setTimelineHistory = function (history) {
			timelineHistory = history;
		};

		var getTimelineHistory = function () {
			return timelineHistory;
		};

		return {
			setTimelineHistory:   setTimelineHistory,
			getTimelineHistory:   getTimelineHistory
		};
	}]);