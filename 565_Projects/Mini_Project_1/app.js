'use strict';

angular.module('Encryption', [
	'ngRoute',
	'encryption.main'
])
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.otherwise({redirectTo: '/'});
	}]);
