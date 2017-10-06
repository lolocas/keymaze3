(function (local) {
	'use strict';

	/*
	 * GridColumnCollection represents an observable collection which stores grid columns.
	 * Property hasChanged can be used in scope $watchers to get optimum notifications
	 * about data being changed. This makes it more performant as the entire collection
	 * or collection items do not have to be dirty checked. hasChanged is actually the time stamp
	 * at which the data has been last modified.
	 * 
	 * The collection can also provides updates notifications if you pass a handler to onChanged. This creates
	 * a unique topic on xaEventing per GridColumnCollection instance. Call dispose when onChanged is no
	 * longer needed. Using onChange removes the need for $watch-ing.
	 */

	local.factory('GridColumnCollection', function (xaEventing) {

		var gridColumnCollectionCount = 0;

		function GridColumnCollection(columns) {

			this.publishingTopicName = 'GridColumnCollection.Topic.{0}'.format(gridColumnCollectionCount++);
			this.publishingSubscription = null;
			this.updateColumns(columns);

		}

		GridColumnCollection.prototype = {

			updateColumns: function (columns) {

				if (!angular.isArray(columns)) {
				    //throw new Error('Columns parameter not supported. An array is needed.');
				    return; //raul: backoffice france throws this, because columns are not yet defined when calling this
				}

				this.columns = columns;
				this.hasChanged = (new Date()).getTime();
				xaEventing.publish(this.publishingTopicName, this.columns);
				return this;

			},
			updateColumn: function(column) {

				var existingColumn = this.findColumnByFieldName(column.field);
				if (existingColumn) {
					var existingColumnIndex = _.indexOf(this.columns, existingColumn);
					this.columns[existingColumnIndex] = column;
					this.hasChanged = (new Date()).getTime();
					xaEventing.publish(this.publishingTopicName, this.columns);
				}
				return this;
			},
			refreshColumns: function () {
				this.hasChanged = (new Date()).getTime();
				xaEventing.publish(this.publishingTopicName, this.columns);
				return this;

			},
			removeColumns: function (columns) {

				this.columns = _.without(this.columns, columns);
				this.hasChanged = (new Date()).getTime();
				xaEventing.publish(this.publishingTopicName, this.columns);
				return this;

			},

			onChanged: function (callback) {

				this.dispose();
				this.publishingSubscription = xaEventing.subscribe(this.publishingTopicName, callback);
				return this;

			},

			findColumnByFieldName: function(fieldName) {
				
				return _.find(this.columns, function (column) { return column.field === fieldName; });

			},

			getColumnsForCustomization: function () {

				return this.columns;

			},

			getVisibleColumns: function() {
				
				return _.filter(this.columns, function (column) { return column.visible; });

			},

			dispose: function () {

				if (this.publishingSubscription) {
					xaEventing.unsubscribe(this.publishingSubscription);
				}

			}

		}

		return GridColumnCollection;

	});

})(window.XaNgFrameworkSlickGrid);