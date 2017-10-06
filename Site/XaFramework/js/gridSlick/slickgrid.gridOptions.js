(function (local) {
	'use strict';

	/*
	 * GridOptions represents a settings object used to initialize and interact with <xa-slick-grid>.
	 * Note - not used actually at the moment, but it should be..
	 */

	local.factory('GridOptions', function () {

		function GridOptions(ctx) {

			this.allowRowMove =			!!ctx.allowRowMove;
			this.columnDefs =			ctx.columnDefs || [];
			this.data =					ctx.data; // array or string ??
			this.dropTargetList =		ctx.dropTargetList || [];
			this.gridButtons =			ctx.gridButtons || [];
			this.gridName =				ctx.gridName;
			this.groups =				ctx.groups || [];
			this.handler =				ctx.handlers || {};
			this.height =				ctx.height;
			this.highlight =			!!ctx.highlight; // only from combo?
			this.maxRows =				ctx.maxRows;
			this.multiColumnSort =		!!ctx.multiColumnSort;
			this.multiple =				!!ctx.multiple;
			this.noGroupingHeader =		!!ctx.noGroupingHeader;
			this.selectionMode =		ctx.selectionMode; // possible values:'multiple', 'simple'
			this.showBulleAide =		!!ctx.showBulleAide;
			this.showBulleAide =		ctx.showBulleAide;
			this.showColumnOptions =	!!ctx.showColumnOptions;
			this.showGroupPanel =		!!ctx.showGroupPanel;
			this.sortInfo =				ctx.sortInfo || [];
			this.title =				ctx.title; // duplicate from gridName ? nope, it's freetext, used in exporing grid data.
			this.uniqueKey =			ctx.uniqueKey;

		}


		GridOptions.prototype = {

			//
			// Methods provided for 'outside' usage.
			// 
			getData: function () { }, // duplicate, which one to use ?

			getGridData: function () { },

			getSelectedItems: function () { },

			refreshGrid: function () { },

			refreshItem: function () { },

			resize: function () { },

			scrollRowIntoView: function () { },

			selectFirstItem: function () { },

			setSelectedItem: function () { },

			setSelectedItems: function () { },

			toggleAll: function() { },

		};

		return GridOptions;

	});

})(window.XaNgFrameworkSlickGrid);