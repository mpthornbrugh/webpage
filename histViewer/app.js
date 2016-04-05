'use strict';

angular.module('histViewer', [
	'ngRoute',
	'histViewer.main',
	'histViewer.bubble',
	'histViewer.service',
	'histViewer.historyService',
	'histViewerMap',
	'histViewer.newBubble'
])
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.otherwise({redirectTo: '/main'});
	}]);
