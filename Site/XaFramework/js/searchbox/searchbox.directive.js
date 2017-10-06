(function(local) {
	'use strict';

	local.factory('searchBoxSettings', function() {

		return function searchBoxSettings(settings) {
			this.searchFn = settings.searchFn;
			this.formatFn = settings.formatFn;
			this.columns = settings.columns;
			this.searchPattern = settings.searchPattern;
			this.maxRows = settings.maxRows;
			this.customActions = settings.customActions;
			this.initialText = settings.initialText;
			this.autoOpen = settings.autoOpen;
			this.gridSettings = settings.gridSettings;
		};

	});

	local.directive('xaSearchBox', function ($rootScope, $document, $timeout, $compile, searchBoxSettings, searchBoxAction, xaDirectiveHelper, xaTranslation) {

		return {
			restrict: 'E',
			replace: true,
			templateUrl: '../js/searchbox/searchbox.tpl.html',
			scope: {

				settings: '=',				// Global settings object. See searchBoxSettings class for details.

				searchFn: '&',				// Function used for resolving the selection data source.
				formatFn: '&',				// Function used for formatting the selection to string representation.
				searchPattern: '@',			// Simple string representing the search pattern used on the server api.
				columns: '=',				// Columns to be displayed in search results.
				maxRows: '=',				// Optional attribute representing the maximum number of items to show in the results.

				customActions: '=',			// Array of searchBoxAction instances used for populating custom buttons in the input.
				selectedText: '=?',			// The text displayed in the input element.
				selectedValue: '=?inputValue',		// The selected value displayed in the input.
				willChange: '&?',	        // Triggered before a selection is made. Return false to cancel selection.
				didChange: '&?',	        // Triggered after a selection is made.
				triggerOn: '@?',			// (string) change|blur . Specifies when the control will fire the did-change event.
				width: '@',					// width of dropdown
				height: '@',				// height of dropdown
				gridSettings: '=?',			// Optional object to override the default grid behaviour. See ngGrid api for details.
				canedit: '=?',
                keepSearchOnError: '=?'     //Garder la recherche même si la validation est en erreur
			},
			link: function (scope, element, attrs) {

			    if (scope.canedit == undefined) {
				    scope.canedit = true;
			    }

				if (!scope.height) scope.height = '350px';
			    if (!scope.width) scope.width = '700px';

			    xaDirectiveHelper.setTestIdOnElement(element, 'sbx', attrs.inputValue);

				scope.dataSource = [];
				scope.visibleCustomActions = [];
				scope.show = false;
				scope.readonly = false;
				scope.showNoDataFound = false;
				scope.showTooManyRows = false;
				scope.triggerOn = scope.triggerOn || "change";
				scope.lastTypedText = '';

				var isLoading = false,
					refreshCnavasPromise,
					$popup,
					settings = scope.settings || {},
					notifyOutstandingUpdates = angular.noop,
					willChangeCallback = angular.isDefined(attrs.willChange) ? scope.willChange() : angular.noop,
					didChangeCallback = angular.isDefined(attrs.didChange) ? scope.didChange() : angular.noop;

				//
				// Initialize directive settings. Some properties can be set as attribute or passed within settings.
				//

				scope.controlSettings = new searchBoxSettings({

					searchFn:		angular.isDefined(attrs.searchFn) ? function(query) { return scope.searchFn({ query: query }); } : settings.searchFn,
					formatFn:		angular.isDefined(attrs.formatFn) ? function(entity) { return scope.formatFn({ entity: entity }); } : settings.formatFn,
					searchPattern:	angular.isDefined(attrs.searchPattern) ? scope.searchPattern : settings.searchPattern,
					columns:		angular.isDefined(attrs.columns) ? scope.columns : settings.columns,
					maxRows:        angular.isDefined(attrs.maxRows) ? scope.maxRows : settings.maxRows,
					customActions:  angular.isDefined(attrs.customActions) ? scope.customActions : settings.customActions,
					initialText:	angular.isDefined(attrs.initialText) ? scope.selectedText : settings.initialText,
					gridSettings: angular.isDefined(attrs.gridSettings) ? scope.gridSettings : settings.gridSettings,
					autoOpen:	angular.isDefined(attrs.autoOpen) ? scope.autoOpen : settings.autoOpen
				});

				// Initialisation du text de la searchBox
				if (settings && angular.isDefined(attrs.didChange)) {
				    settings.didChange = didChangeCallback;
				}
				if (scope.controlSettings.autoOpen) {
					$timeout(function () { scope.search(null, true); }, 0, false);
				}
				

				if (!angular.isFunction(scope.controlSettings.searchFn)) {
					throw new Error('xaSearchBox: invalid searchFn specified.');
				}

				var id = 'searchbox-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
				scope.ownerId = 'owner-' + id;
				scope.popupId = 'popup-' + id;

			    //copy initial ID into data-id. Problem with this is the validation framework needs to UNIQUELY identify the component that has an error. 
			    // I usually do that with ids, problem is you do the same thing here...
				var oldId = element.attr('id');
				if (oldId) {
					element.attr('data-id', oldId);
				}
				element.attr({ 'id': scope.ownerId });
                
				scope.doBlur = function() {
						scope.showNoDataFound = false;

						// The text is reset on bluring if no valid selection is done.
						if (!scope.keepSearchOnError
						    && (scope.selectedValue === null || scope.selectedValue === undefined)) {
							scope.selectedText = scope.controlSettings.initialText || '';
						}
						notifyOutstandingUpdates();
						notifyOutstandingUpdates = angular.noop;
						scope.hidePopup();
						if (!$rootScope.$$phase && !scope.$$phase) scope.$digest();
				
				};

              	scope.search = function(extraFilterParam, fromEnter) {

					// drag text doesn't update value in angular
				    //var actualVal = element.find('input').val();
				    //if (scope.selectedText != actualVal) { //drag text doesn't update value!!
				    //    scope.selectedText = actualVal;
				    //}

					if (isLoading) {
						return;
					}
					scope.hidePopup();

					scope.setFocus();
					isLoading = true;
					
					scope.lastTypedText = scope.selectedText;

					var promise = scope.controlSettings.searchFn(scope.selectedText, extraFilterParam, fromEnter);

					if (!promise || !promise.then) {
						throw new Error('xaSearchBox: searchFn must return a promise.');
					}

					scope.dirty = false;

					promise.then(function(result) {
							if (result === false) {
								resetAndFocus();
								return;
							}
							scope.showNoDataFound = !_.any(result);
							scope.showTooManyRows = isPartialResult(result);
							scope.dataSource = scope.controlSettings.maxRows ? _.first(result, scope.controlSettings.maxRows) : result;

							angular.forEach(scope.dataSource, function(item, index) {
								item.__searchboxid = index;
							});

							scope.showPopup();

						})
						.finally(function() {
						    scope.focus = true;
							scope.setFocus();
							isLoading = false;
						});

              	};

			    // Permettre le declenchement de l'ouverture de la searchbox depuis l'exterieur
              	if (scope.settings) {
              	    // Permettre le declenchement de l'ouverture de la searchbox depuis l'exterieur
              	    scope.settings.runSearchAndOpenResult = scope.search;
              	    scope.settings.getSearchboxId = function () { return scope.ownerId; }
              	}


				scope.select = function(instance) {

					var next = willChangeCallback(instance, scope.selectedValue, scope.lastTypedText) === false ? false : true;

					if (!next) {
						// When handler before selected returns false, the selection and datasource are reset.
						resetAndFocus();
					    scope.lastTypedText = '';
						return;
					}

					var oldValue = scope.selectedValue;
				    var newValue = instance;

				    scope.selectedValue = instance;
				    if (!$rootScope.$$phase) scope.$apply();

				    notifyDidChange(newValue, oldValue, scope.lastTypedText);
				    scope.lastTypedText = '';
					scope.showNoDataFound = false;
					scope.readonly = true;
					scope.hidePopup();
					scope.setFocus();
				};

				scope.clear = function () {

				    var next = willChangeCallback(null, scope.selectedValue) === false ? false : true;

					if (!next) {
						return;
					}

					notifyDidChange(null, scope.selectedValue);

					scope.readonly = false;
					scope.selectedValue = null;
					scope.dataSource = [];
					scope.active = -1;
					scope.setFocus();
				};

				function notifyDidChange(newValue, oldValue) {
					if (newValue !== oldValue) {
						xaDirectiveHelper.removeErrorTooltip(element);
						if (scope.triggerOn === "change") {
							$timeout(function () { didChangeCallback(newValue, oldValue); }, 0);
						} else {
							notifyOutstandingUpdates = didChangeCallback.bind(this, newValue, oldValue);
						}
					}
				}

				scope.showPopup = function() {
					if (_.any(scope.dataSource)) {
						compileSelector();
						scope.show = true;

						refreshCnavasPromise = $timeout(function() {
							scope.updatePosition();
						}, 0, false);
						
						bindDocumentClick();
					} else {
						scope.hidePopup();
					}
				};

				scope.hidePopup = function () {
					if (scope.show) {
						scope.show = false;
						scope.dirty = true;
						scope.dataSource = [];
						if (scope.gridOptions && scope.gridOptions.refreshGridDatasource) {
							scope.gridOptions.refreshGridDatasource();
						}
						unbindDocumentClick();
					}
				};

				scope.runAction = function(action) {

					if (!(action instanceof searchBoxAction)) {
						throw new Error('This custom action is not instance of searchBoxAction. Please use the correct type.');
					}

                    //raul: hide the popup if visible!!!
					scope.hidePopup();

					if (angular.isFunction(action.onClick)) {
						action.onClick.apply(scope, [scope.selectedValue]);
					}

				};

				var unwatchSel = scope.$watch('selectedValue', function() {

					if (!scope.selectedValue) {

						scope.selectedText =  scope.controlSettings.initialText || '';
						scope.readonly = false;
						scope.selectedValue = null;
						scope.dataSource = [];
						scope.active = -1;

					} else {
						if (angular.isFunction(scope.controlSettings.formatFn)) {
							scope.selectedText = scope.controlSettings.formatFn(scope.selectedValue);
						} else {
							scope.selectedText = scope.selectedValue;
						}
						scope.readonly = true;
					}

					updateAvailableCustomActions();

				});


				var unwatchCanEdit = scope.$watch('canedit', function () {
				    updateAvailableCustomActions();
				});

				scope.$on('$destroy', function () {
					if ($popup && $popup.length) {
						$popup.remove();
					}
					unwatchSel();
					unwatchCanEdit();
					unbindDocumentClick();
					$timeout.cancel(refreshCnavasPromise);
					
				});

				function isPartialResult(result) {
					return angular.isNumber(scope.controlSettings.maxRows)
						&& scope.controlSettings.maxRows > 0
						&& _.any(result) ? result.length >= scope.controlSettings.maxRows : false;
				}

				/// This function is called when the position is set correctly on the screen.
				function enableOpenedSelector() {
					if ($popup) {
						$popup.addClass('opened');
						scope.gridOptions.refreshGridDatasource();
					}
				}

				scope.positionSetEvent = enableOpenedSelector;

				function updateAvailableCustomActions() {

					scope.visibleCustomActions = _.filter(scope.controlSettings.customActions, function(action) {
						return action.isVisible(scope.selectedValue, scope.canedit);
					});
					scope.refreshStyle();

				}

				function resetAndFocus() {
					scope.readonly = false;
					scope.selectedValue = null;
					scope.dataSource = [];
					scope.active = -1;
					scope.hidePopup();
					scope.selectedText = '';
					scope.setFocus();
				}

				function dismissClickHandler(evt) {

					var target = $(evt.target);

					var parents = target.closest('#' + scope.ownerId);
					var popupParents = target.closest('#' + scope.popupId);


					if (parents.length === 0 && popupParents.length === 0 && !target.hasClass('slick-group-toggle') && target.closest('ul.groupList').length == 0) {
						//scope.scheduleBlur();
						scope.doBlur();
					}

					/*else {
						scope.cancelBlur();
					}*/
				}

				function bindDocumentClick() {
					unbindDocumentClick();
					$document.on('click', dismissClickHandler);
				}

				function unbindDocumentClick() {
					$document.off('click', dismissClickHandler);
				}

				function compileSelector() {
					if ($popup) {
						return;
					}
					var popupElement = angular.element('<xa-search-box-selector>');
					$popup = $compile(popupElement)(scope);
					$document.find('body').append($popup);
				}
			}
		};
	});

})(window.XaNgFrameworkSearchBox);