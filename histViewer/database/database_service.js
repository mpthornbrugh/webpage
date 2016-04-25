'use strict';

angular.module('databaseEntry.service', ['ngRoute'])
	.service('DatabaseControlService', ['$q', '$http', function ($q, $http) {

		var apiUrl = "https://historicaldv.herokuapp.com/";
		var allItems = [];
		var allImages = [];
		var queryData = [];
		var dataPopulatedPromise;
		var imagesPopulatedPromise;

		function populateAllItems() {
			return $http.get(apiUrl + "getItems").
				success(function (data) {
					allItems = data;
				}).
				error(function (err) {
					alert("Error connecting to server: " + err);
				});
		}

		function populateAllImages() {
			return $http.get(apiUrl + "getImages")
				.success(function (data) {
					//for (var i = 0; i < data.length; i++) {
					//	allImages[data[i].name] = data[i].url;
					//}
					allImages = data;
				})
				.error(function (err) {
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
					action:newItem.action,
					compliment1:newItem.compliment1,
					compliment2:newItem.compliment2,
					ref:newItem.ref
				}
			});

			request.success(function (data) {
				var needsImageCreate = true;
				for (var i = 0; i < allItems.length; i++) {
					if (allItems[i].who == newItem.who) {
						needsImageCreate = false;
						break;
					}
				}
				if (needsImageCreate) {
					addImage(newItem.who);
				}
				populateAllItems();
			});

			return request;
		};

		function addImage(name) {
			var request = $http({
				method: "post",
				url: apiUrl + "addImage",
				data: {
					tableName: "images",
					name: name,
					url:""
				}
			});

			request.success(function (data) {

			});
		}

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
					compliment2:updatedItem.compliment2,
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

		var updateImage = function (updateImage) {
			var request = $http({
				method: "post",
				url: apiUrl + "updateImage",
				data:{
					tableName: "images",
					name:updateImage.name,
					url: updateImage.url
				}
			});

			request.success(function () {
				populateAllImages();
			});

			return request;
		};

		var getItems = function () {
			return allItems;
		};

		var getImages = function () {
			return allImages;
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

		var ensureImagesPopulated = function () {
			if (!imagesPopulatedPromise) {
				imagesPopulatedPromise = populateAllImages();
			}
			return imagesPopulatedPromise;
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
			ensureImagesPopulated:ensureImagesPopulated,
			queryForWho:          queryForWho,
			queryForWhat:         queryForWhat,
			writtenQuery:         writtenQuery,
			updateImage:          updateImage,
			getImages:            getImages
		};
	}]);