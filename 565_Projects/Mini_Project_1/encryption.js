'use strict';

angular.module('encryption.main', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/', {
				templateUrl: 'view.html',
				controller: 'EncryptCtrl'
			});
	}])

	.controller('EncryptCtrl', ['$scope', function ($scope) {
		var mapping = [
			{
				'A': 1,
				'B': 2,
				'C': 3,
				'D': 4,
				'E': 5,
				'F': 6,
				'G': 7,
				'H': 8,
				'I': 9,
				'J': 10,
				'K': 11,
				'L': 12,
				'M': 13,
				'N': 14,
				'O': 15,
				'P': 16,
				'Q': 17,
				'R': 18,
				'S': 19,
				'T': 20,
				'U': 21,
				'V': 22,
				'W': 23,
				'X': 24,
				'Y': 25,
				'Z': 26
			}
		];

		var reverseMap = [
			'A',
			'B',
			'C',
			'D',
			'E',
			'F',
			'G',
			'H',
			'I',
			'J',
			'K',
			'L',
			'M',
			'N',
			'O',
			'P',
			'Q',
			'R',
			'S',
			'T',
			'U',
			'V',
			'W',
			'X',
			'Y',
			'Z'
		];

		$scope.encrypt = function () {
			if (!$scope.plaintext || !$scope.key) {
				alert("Please fill in both fields.");
				return;
			}
			var plaintext = $scope.plaintext.toUpperCase();
			plaintext = plaintext.replace(/\s+/g, '');
			var key = $scope.key.toUpperCase();
			var encryptedText = "";
			var lengthKey = key.length;

			var count = 0;

			while (count != plaintext.length) {
				var m = mapping[0][plaintext[count]];
				var k = mapping[0][key[count % lengthKey]];

				encryptedText += reverseMap[(m + ((k-2) % 26)) % 26];
				count++;
			}

			$scope.encryptedText = encryptedText;

		}
	}]);
















