'use strict';

angular.module('histViewer.service', ['ngRoute'])
	.service('DatabaseControlService', ['$q', '$http', function ($q, $http) {

		var apiUrl = "https://historicaldv.herokuapp.com/";
		var allItems = [];
		var queryData = [];
		var dataPopulatedPromise;

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

		function populateAllItems() {
			return $http.get(apiUrl + "getItems").
				success(function (data) {
					for (var i = 0; i < data.length; i++) {
						data[i].who = correctCapitalization(data[i].who);
					}
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
			who = who.toUpperCase();

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
			debugger;
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
					action:newItem.action,
					compliment1:newItem.compliment1,
					compliment2:newItem.compliment2
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
					ranking:updatedItem.ranking,
					action:updatedItem.action,
					compliment1:updatedItem.compliment1,
					compliment2:updatedItem.compliment2
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

		var queryForWhere = function (where) {
			var query = "SELECT * FROM links WHERE links.where like '%" + where + "%'";

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
				queryData = [];
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
			writtenQuery:         writtenQuery,
			queryForWhere:        queryForWhere
		};
	}]);