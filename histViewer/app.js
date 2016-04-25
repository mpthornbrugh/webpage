'use strict';

angular.module('histViewer', [
	'ngRoute',
	'histViewer.main',
	'histViewer.bubble',
	'histViewer.service',
	'histViewer.historyService',
	'histViewerMap',
	'histViewer.newBubble',
	'databaseEntry.view',
	'databaseEntry.list',
	'databaseEntry.detail',
	'databaseEntry.service',
	'databaseEntry.query',
	'databaseEntry.image',
	'databaseEntry.images.detail'
])
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.otherwise({redirectTo: '/main'});
	}]);
