(function(local) {
	'use strict';

	local.directive('xaSearchBoxSelector', function (xaKeyboard, $timeout, $document, GridColumnCollection, xaTranslation, xaKeyHelper) {

		var hotKeys = [13, 27, 38, 40];

		return {
			restrict: 'E',
			replace: true,
			templateUrl: '../js/searchbox/searchbox.selector.tpl.html',
			link: function(scope, element) {

				element.attr('id', scope.popupId);

				scope.visible = function() {
					return scope.show && scope.dataSource;
				};

				scope.maxDataReachedMessage = scope.controlSettings.maxRows ? xaTranslation.instant('TXT_SEARCHBOX_MAX').replace('{0}', scope.controlSettings.maxRows) : '';

				var unwatchShow = scope.$watch('show', function(value) {
					if (value == false) {
						scope.dataSource = [];
						scope.active = -1;
					}
				});

				scope.active = -1;

				scope.changeActiveValue = function changeActiveValue(newValue) {
					scope.gridOptions.setSelectedIndex(newValue, true);
					scope.active = newValue;
				}
			


				var internalGridSettings = null;

				internalGridSettings = scope.controlSettings.gridSettings || {};
				internalGridSettings.noGroupingHeader = internalGridSettings.noGroupingHeader == undefined ? true : internalGridSettings.noGroupingHeader;
				internalGridSettings.handlers = internalGridSettings.handlers || {	};
				internalGridSettings.uniqueKey = '__searchboxid',
				internalGridSettings.multiSelect = false;
				internalGridSettings.enableRowSelection = false;
				internalGridSettings.multiple = false;
				internalGridSettings.enableCellActive = false;
				internalGridSettings.height = scope.height || 210;

				if (internalGridSettings.columnDefs == undefined)
					internalGridSettings.columnDefs = new GridColumnCollection(scope.controlSettings.columns);

				internalGridSettings.data = function() {
					return scope.dataSource;
				}

				internalGridSettings.handlers.onRowClick = function (item) {
					scope.select(item);
					scope.setFocus();
				};

				internalGridSettings.handlers.onRowClick.onSort= function (data) {
					scope.changeActiveValue(-1);
					scope.dataSource = data;
					scope.setFocus();
				}

				if (internalGridSettings.showColumnOptions) {
					internalGridSettings.handlers.onBeforeShowColumnPersonnalisation = function () {
						scope.hidePopup();
					}
				}
				


				scope.gridOptions = internalGridSettings;

				scope.popupStyle = {
					width: scope.width
				};

				scope.onContainerScroll = function () {
					scope.hidePopup();
					if (!scope.$$phase) {
						scope.$digest();
					}
				};

				scope.$on('$destroy', function() {
					element.off();
					unwatchShow();
					
				});

			}
		};
	});

})(window.XaNgFrameworkSearchBox);