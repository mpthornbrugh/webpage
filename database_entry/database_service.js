'use strict';

angular.module('databaseEntry.service', ['ngRoute'])
		.service('DatabaseControlService', ['$q', '$http', function ($q, $http) {

		var apiUrl = "https://historicaldv.herokuapp.com/";
		var allItems = [];
		var dataPopulatedPromise;

		function populateAllItems() {
			var promise = $http.get(apiUrl + "getItems").
				success(function (data) {
					allItems = data;
				}).
				error(function (err) {
					alert("Error connecting to server: " + err);
				});
			return promise;
		}

		var addItem = function (newItem) {
			var request = $http({
				method: "post",
				url: apiUrl + "addItem",
				data: {
					tableName: "links",
					who:newItem.who,
					what:newItem.what,
					when:newItem.when,
					where:newItem.where,
					ranking:newItem.ranking
				}
			});

			request.success(function (data) {
				console.log(data);
				populateAllItems();
			});

			return request;
		};

		var updateItem = function (index, updatedItem) {
			var request = $http({
				method: "post",
				url: apiUrl + "updateItem",
				data: {
					tableName: "links",
					id:index,
					who:updatedItem.who,
					what:updatedItem.what,
					when:updatedItem.when,
					where:updatedItem.where,
					ranking:updatedItem.ranking
				}
			});

			request.success(function (data) {
				for (var i in allItems) {
					if (allItems[i].id == index) {
						allItems[i] = updatedItem;
					}
				}
			});

			request.error(function (err) {
				alert("Error connecting to the server.");
			});

			return request;
		};

		var getItems = function () {
			return allItems;
		};

		var ensureDataPopulated = function () {
			if (!dataPopulatedPromise) {
				dataPopulatedPromise = populateAllItems();
			}
			return dataPopulatedPromise;
		};

		var removeItem = function (index) {
			var request = $http({
				method: "post",
				url: apiUrl + "deleteItem",
				data: {
					tableName: "links",
					id:index
				}
			});

			request.success(function (data) {
				for (var i in allItems) {
					if (allItems[i].id == index) {
						allItems.splice(i, 1);
					}
				}
			});

			request.error(function (err) {
				alert("Error connecting to the server.");
			});

			return request;
		};

		var getItemByIndex = function (index) {
			for (var i in allItems) {
				if (allItems[i].id == index) {
					return allItems[i];
				}
			}
		};

		return {
			addItem:        addItem,
			getItems:       getItems,
			removeItem:     removeItem,
			getItemByIndex: getItemByIndex,
			updateItem:     updateItem,
			ensureDataPopulated: ensureDataPopulated
		};
	}]);