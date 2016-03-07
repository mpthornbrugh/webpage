'use strict';

angular.module('databaseEntry.service', ['ngRoute'])
		.service('DatabaseControlService', ['$q', '$http', function ($q, $http) {

		var apiUrl = "https://historicaldv.herokuapp.com/";
		var allItems = [];
		var queryData = [];
		var dataPopulatedPromise;

		function populateAllItems() {
			return $http.get(apiUrl + "getItems").
				success(function (data) {
					allItems = data;
				}).
				error(function (err) {
					alert("Error connecting to server: " + err);
				});
		}

		var queryForWhat = function (what) {
			var request = $http({
				method: "post",
				url: apiUrl + "getItemsByWhat",
				data: {
					tableName: "links",
					what: what
				}
			});

			request.success(function (data) {
				queryData = data;
			});

			request.error(function (err) {
				queryData = [];
			});

			return request;
		};

		var queryForWho = function (who) {
			var request = $http({
				method: "post",
				url: apiUrl + "getItemsByWho",
				data: {
					tableName: "links",
					who: who
				}
			});

			request.success(function (data) {
				queryData = data;
			});

			request.error(function (err) {
				queryData = [];
			});

			return request;
		};

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
					ranking:newItem.ranking,
					ref:newItem.ref
				}
			});

			request.success(function (data) {
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
					ranking:updatedItem.ranking,
					ref:updatedItem.ref
				}
			});

			request.success(function (data) {
				for (var i in allItems) {
					if (allItems[i].id == index) {
						allItems[i] = updatedItem;
					}
				}
				populateAllItems();
			});

			request.error(function (err) {
				alert("Error connecting to the server.");
			});

			return request;
		};

		var getItems = function () {
			return allItems;
		};

		var getQueryItems = function () {
			return queryData;
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

		var writtenQuery = function (query) {
			var request = $http({
				method: "post",
				url: apiUrl + "inputQuery",
				data: {
					query:query
				}
			});

			request.success(function (data) {
				queryData = data;
			});

			request.error(function (err) {
				alert("Error connecting to the server.");
			});

			return request;
		};

		return {
			addItem:              addItem,
			getItems:             getItems,
			getQueryItems:        getQueryItems,
			removeItem:           removeItem,
			getItemByIndex:       getItemByIndex,
			updateItem:           updateItem,
			ensureDataPopulated:  ensureDataPopulated,
			queryForWho:          queryForWho,
			queryForWhat:         queryForWhat,
			writtenQuery:         writtenQuery
		};
	}]);