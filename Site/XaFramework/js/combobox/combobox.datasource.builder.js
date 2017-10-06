(function(local) {
	'use strict';

	local.factory('comboboxDataSourceBuilder', function (ComboboxItem) {

		function isArrayOfStrings(dataSource) {
			return angular.isArray(dataSource) && (_.all(dataSource, angular.isString) || _.all(dataSource, angular.isNumber));
		}

		function isArrayOfObjects(dataSource) {
			return angular.isArray(dataSource) && _.all(dataSource, angular.isObject);
		}

		function validateColumns(dataSource, columns, displayColumn, valueColumn) {

			if (!angular.isArray(columns)) {
				throw new Error('A columns array is mandatory when using a data source of objects.');
			}

			angular.forEach(columns, function(c) {
				if (!c.hasOwnProperty('field')) {
					throw new Error('Property [field] not found for column.');
				}
				if (!c.hasOwnProperty('displayName')) {
					throw new Error('Property [displayName] not found for column.');
				}
			});

			angular.forEach(dataSource, function(_) {

				if (!_.hasOwnProperty(displayColumn)) {
					throw new Error('Property [displayColumn] ' + displayColumn + ' not found.');
				}

				if (!_.hasOwnProperty(valueColumn)) {
					throw new Error('Property [valueColumn] ' + valueColumn + ' not found.');
				}

			});
		}

		function buildMatches(dataSource, columns, displayColumn, valueColumn) {

			if (_.isEmpty(dataSource)) {
				return [];
			}

			if (isArrayOfStrings(dataSource)) {
				return _.map(dataSource, function(_, idx) {
					return new ComboboxItem({
						id: idx,
						label: _,
						model: _,
						value: _,
						selected: false,
					});
				});
			}

			if (isArrayOfObjects(dataSource)) {
				validateColumns(dataSource, columns, displayColumn, valueColumn);
				return _.map(dataSource, function(_, idx) {
					return new ComboboxItem({
						id: idx,
						label: '' + _[displayColumn],
						model: _,
						value: '' + _[valueColumn],
						selected: false
					});
				});
			}

			throw new Error('combobox requires as data source an array of strings or objects.');
		}

		return {
			buildMatches: buildMatches,
			isArrayOfStrings: isArrayOfStrings
		};

	});

})(window.XaNgFrameworkComboBox);