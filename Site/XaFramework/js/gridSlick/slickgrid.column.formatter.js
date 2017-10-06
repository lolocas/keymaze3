(function(local) {
	'use strict';
	
	local.service('xaSlickGridColumnFormatter', function (xaSlickFilterDate, xaSlickFilterNombre) {

		// Maps the cellFilter property to a coresponding <slick> formatter.

		var formatters = {
			XaFilterDate: xaSlickFilterDate,
			XaFilterNombre: xaSlickFilterNombre
		};

		this.getFormatter = function(column) {
			if (column.cellFilter && formatters.hasOwnProperty(column.cellFilter)) {
				return formatters[column.cellFilter];
			}
			return undefined;
		};

	});



	local.factory('xaSlickFilterDate', function ($filter, xaFrameworkSetting) {
		function xaSlickFilterDate(row, cell, value, columnDef, dataContext) {
			if (value === null || value === undefined) {
				return '';
			}
			return $filter('date')(value, xaFrameworkSetting.dateFormat);
		}
		return xaSlickFilterDate;
	});

	local.factory('xaSlickFilterNombre', function ($filter) {
		function xaSlickFilterNombre(row, cell, value, columnDef, dataContext) {
			if (angular.isDefined(value)) {
				return $filter('number')(value, 2);
			}
			return '';
		}
		return xaSlickFilterNombre;
	});

})(window.XaNgFrameworkSlickGrid);