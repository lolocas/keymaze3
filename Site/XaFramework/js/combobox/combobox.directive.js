(function(local) {
	'use strict';

	local.directive('xaComboBox', function (

		$q,
		$timeout,
		$rootScope,
		$compile,
		$document,
		$filter,
		comboboxDataSourceBuilder,
		ComboboxDataSource,
		xaKeyboard,
		GridColumnCollection,
        xaKeyHelper,
		xaTranslation,
		xaDirectiveHelper) {

		function isPromise(p) {
			return p && p.then;
		}

		return {
			templateUrl: '../js/combobox/xa-combobox.tpl.html',
			replace: true,
			restrict: 'EA',
			scope: {
				source: '=', // array of strings or objects - optional
				columns: '=?', // column definition to be shown in the dropdown - required for complex objects
				selection: '=?inputValue', // two-way binded selection (string), simple or comma separated of values. - optional
				defaultText: '=?text', // two-way binded selection (string), simple or comma separated of labels. - optional
				displayCol: '@?', // the property name to be used for display of items in the input control. - required for complex objects
				valueCol: '@?', // the property name to be used for value of items. - required for complex objects
				multiple: '=?', // boolean to determine if multi-item selection is enabled or not. - optional
				separator: '@?', // the separator character to be used when joining multiple values. - optional, default is ','
				canedit: '=?', // boolean used to determine if the input is editable or not. - optional, default is true
				width: '@?', // width of dropdown. - optional
				height: '@?', // height of dropdown. - optional
				triggerOn: '@?', // (string) change|blur . Specifies when the control will fire the did-change event.

				willChange: '&?', // callback before an item is selected from the dropdown. Return false to prevent action. 
				//		Format willChange(newValue, oldValue)

				allowOther: '=?', // Autoriser d'autre valeur
				didChange: '&?', // callback after an item is selected from the dropdown. 
				onGetRowCss: '=?',
				didChangeAdvanced: '&?', // callback after an item is selected from the dropdown. 
											//      Format didChange(newValue, oldValue)

				gridSettings: '=?', // Optional object to override the default grid behaviour. See ngGrid api for details.

				initialSortCol: '@?',
				initialSortDir: '@?',
				maxlength: '=?'
			},

			compile: function() {
				return {
					post: postLinkingFn
				};
			},

		};

		function postLinkingFn(scope, element, attrs) {
			// utiliser par le positionner.
			scope.isCombo = true;

			if ($rootScope.isTouchDevice)
		        element.find('input').attr('readonly', 'true');

			var popupScope = null;
			var refreshGridTimeout = null;
			
			if (scope.canedit == undefined) {
				scope.canedit = true;
			}

			if (scope.multiple && !scope.triggerOn) {
				scope.triggerOn = "blur";
			} else if (!scope.triggerOn) {
				scope.triggerOn = "change";
			}

			// SI valeur bindé est numérique on transforme en string.
			if (scope.selection != undefined && typeof scope.selection === 'number') {
				scope.selection = scope.selection.toString();
			}

			if (scope.selection && !angular.isString(scope.selection)) {
				throw new Error('The combobox selection must be string only!');
			}

			if (scope.defaultText && !angular.isString(scope.defaultText)) {
				throw new Error('The combobox text must be string only!');
			}

			if (!scope.gridOptions && !scope.columns && scope.valueCol == 'code' && (scope.displayCol == 'libelle' || scope.displayCol == 'code')) {
				scope.columns = [
					{ displayName: xaTranslation.instant('TXT_CODE'), field: 'code', width: '80px' },
					{ displayName: xaTranslation.instant('TXT_LIBELLE'), field: 'libelle' }
				];
			}

			if (!scope.gridOptions && !scope.columns) {
				// Map to flat source when the data source is a simple array of strings.
				scope.columns = [{ displayName: xaTranslation.instant('TXT_SUGGESTIONS'), field: 'value', hidden: true, visible: true }];
				scope.valueCol = 'value';
				scope.displayCol = 'name';
				scope.isArrayOfString = true;
			}

			if (scope.allowOther == true && !scope.isArrayOfString)
			{
				throw new Error('Allow-other=true est actif, hors dans ce scénario seul une liste de string ne peut être fourni');

			}

			var $popup,
				notifyOutstandingUpdates = angular.noop,
                notifyOutstandingAdvancedUpdates = angular.noop,
				isDocumentClickBound = false,
				keysBound = false,
				hotKeys = [13, 27, 38, 40,9],
				inputElement = element.find('input'),
				glyphicon = element.find(".glyphicon"),
				popupId = 'combobox-' + scope.$id + '-' + Math.floor(Math.random() * 10000),
				willChangeCallback = (angular.isDefined(attrs.willChange)) ? scope.willChange() : angular.noop,
				didChangeCallback = (angular.isDefined(attrs.didChange)) ? scope.didChange() : angular.noop,
                didChangeAdvancedCallback = (angular.isDefined(attrs.didChangeAdvanced)) ? scope.didChangeAdvanced : angular.noop;

			xaDirectiveHelper.setTestIdOnElement(element, 'cbx', attrs.inputValue);


			scope.dataSource = new ComboboxDataSource(scope.multiple, scope.separator, scope.allowOther)
				.beforeSelectionChange(willChangeCallback)
				.afterSelectionChange(function(newValue, oldValue, preventNotification) {

					scope.defaultText = newValue.label;
					scope.selection = newValue.value;

					// NOTE: As described in XPLOREWEB-954, preventNotification does not fire did-change.
					// This is also prevented when the control is blured, even if there is a selection change due to new text being typed.
					// In case the later condition does not make sense, check preventNotification only when triggerOn == 'change'.

					if (!preventNotification) {
						if (scope.triggerOn === "change") {
						    if (didChangeCallback != angular.noop || didChangeAdvancedCallback != angular.noop) {
						        // Mise à jours du scope avant le declenchement de l'événement
						        if (!$rootScope.$$phase) scope.$apply();
						        xaDirectiveHelper.removeErrorTooltip(element);
						        $timeout(function () {
						            if (didChangeCallback != angular.noop)
						                didChangeCallback(newValue, oldValue);

						            if (didChangeAdvancedCallback != angular.noop)
						                didChangeAdvancedCallback({ newValue: newValue, oldValue: oldValue });
						        }, 0, true);

						    }
						} else {
						    notifyOutstandingUpdates = didChangeCallback.bind(this, newValue, oldValue);
						    notifyOutstandingAdvancedUpdates = didChangeAdvancedCallback.bind(this, { newValue: newValue, oldValue: oldValue });
						}
					}

					// Raffraichissement necessaire uniquement si multiple
					if (scope.multiple) {
						refreshGrid();
					}
				})
				.onDisplayTextChange(function(text, fromSearch) {
					scope.defaultText = text;
					if (!_.any(scope.dataSource.filteredCollection)) {
						hidePopup();
					} else {
						if (fromSearch) {
							refreshGrid();
						}
					}
				})
				.onValueTextChange(function(text) {
					scope.selection = text;
				});


			scope.ctlType = 'COMBOBOX';
			scope.active = -1;
			scope.$dirty = false;
			scope.$manualSelection = false;
			scope.ownerId = 'owner-' + popupId;
			scope.canedit = angular.isDefined(scope.canedit) ? scope.canedit : true;

			element.find('.right-inner-addon').attr({ 'id': scope.ownerId });
			

			function initializeDataSource(source) {
				var displayColumn = scope.displayCol,
					valueColumn = scope.valueCol,
					sortDirection = 'asc',
					sortColumn = '';

				if (scope.isArrayOfString) {
					source = _.map(source, function (item) { return { name: item, value: item }; });
					// Dans le scenario du controle de suggestion scope.displayColuln est a vide.
					displayColumn = 'value';
					valueColumn = 'name';

				}

				if (scope.dataSource) { //raul: in demo this is called twice: once with datasource null, other time OK
					scope.dataSource.initialize({
						dataSource: source,
						valueText: scope.selection,
						columns: scope.columns,
						displayColumn: displayColumn,
						valueColumn: valueColumn
					});

					scope.dataSource.unfilter();
					
					initializeGrid();
				}
			}

			var hasError = false;
			function showError(text) {
				if (hasError) return;
				var tooltipData = {
					placement: 'bottom',
					trigger: 'focus',
					html: true,
					title: text
				};
				inputElement.addClass('inconsistentComboValue').tooltip(tooltipData);
				hasError = true;
			}

			function removeError() {
				if (!hasError) return;
				inputElement.removeClass('inconsistentComboValue').tooltip('destroy');
				hasError = false;
			}

			function updateConsistencyFlag() {
				if (scope.allowOther === true)
					return;

				if (scope.dataSource.checkCurrentValueIsInDatasource()) 
					removeError();
				else
					showError(xaTranslation.instant('TXT_INCONSISTENT_COMBO').format(scope.selection));
			}

			var unwatchSource = scope.$watchCollection('source', function(value) {

				if (isPromise(scope.source)) {
					$q.when(scope.source, initializeDataSource);
					if (value) {
						unwatchSource();
					}
				} else {
					initializeDataSource(value);
					updateConsistencyFlag();
				}

			});

			var unwatchSelection = scope.$watch('selection', function comboboxSelectionWatchFn(newSelection, oldSelection) {
			    if (newSelection !== oldSelection) {
			        if (typeof newSelection == 'number')
			            newSelection = newSelection.toString();

			        scope.dataSource.setValueText(newSelection);
			        updateConsistencyFlag();
				}
			});

			function applyActiveIndexUpdate() {
				scope.gridOptions.setSelectedIndex(scope.active, true);

				//Refresh the row if grid is displayed
				if (scope.show) {
					if (scope.active > -1) {
						//scope.gridOptions.refreshItem(getSelectedItems);
						
						
						scope.gridOptions.scrollRowIntoView(scope.active);
						
					}
					
				}
			}


		    /// This function is called when the position is set correctly on the screen.
			var shouldOpen = false; //positioner calls this method on init (change on attribute is triggered). Need to only call it when the combo is opening, never before!
            //otherwise it messes up the esc/ctrl + enter for window.
			function enableOpenedSelector() {
			    if ($popup && shouldOpen ) {
					$popup.addClass('opened');
					scope.gridOptions.refreshGrid();
				}
			}

			scope.positionSetEvent = enableOpenedSelector;

			/*
			 * Openes the grip if not already opened.
			 * Parameter keepFilter is used for reseting the active filtering or not.
			 * On first open all options are shown. As the user types something the list
			 * is restricted to items matching the current text.
			 */

			scope.showPopup = function (keepFilter) {
			    shouldOpen = !scope.show;
			    if (!scope.show) {
			 		if (!keepFilter) 
						scope.dataSource.unfilter();
					
					scope.show = _.any(scope.dataSource.filteredCollection);
					if (scope.show) {
						glyphicon.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');

					    compilePopup(element);
					
					    if (popupScope.updatePosition)
					        popupScope.updatePosition();

					    bindDocumentClick();

						refreshGrid();

					}
				}
			};


			function refreshOverlayOnRow() {
				if (scope.multiple) return;

				var values = scope.dataSource.getSelectedItems();
				if (values && values.length > 0)
					scope.active = scope.gridOptions.findItemIndex(values[0]);
				else
					scope.active = -1;

				applyActiveIndexUpdate();
		
			}


			scope.showHidePopupFromClick = function() {
				if (scope.show) {
					hidePopup();
				} else {
					scope.showPopup();
				}
				//inputElement.focus();
		
				// Ne pas selectionner le text dans le cadre du touch
				if (!$rootScope.isTouchDevice)
					inputElement.select();

				if (!$rootScope.$$phase) {
					scope.$digest();
				}
			}

			glyphicon.on("mousedown", function(e) {
			    scope.showHidePopupFromClick();
			    inputElement.focus();
				e.preventDefault();
			});

			function hidePopup() {
				if (scope.show) {
					scope.show = false;

					// Dramatique si non fermé car le keyboard reste bind sur le resize de l'écran déplacer le bind click pour moins de probleme
					shouldOpen = false;
					if ($popup) {
						$popup.removeClass('opened');
					}
					glyphicon.addClass('glyphicon-chevron-down').removeClass('glyphicon-chevron-up');
					
					unbindDocumentClick();
				}
			};


			scope.select = function(match, ignoreSelectControl) {

				scope.dataSource.select(match);

				if (scope.multiple) {
				} else {
					hidePopup();
				}

				scope.$dirty = false;
				scope.$manualSelection = true;

				if (!$rootScope.$$phase) {
					scope.$apply();
				}

				// Ne pas selectionner le text dans le cadre du touch
				if (!$rootScope.isTouchDevice && !ignoreSelectControl)
					inputElement.select();


			};

			scope.toggleSelection = function() {

				if (!scope.multiple) {
					return;
				}

				scope.dataSource.toggle();

				scope.$dirty = false;
				scope.$manualSelection = true;
				inputElement.focus();

				refreshGrid();

				if (!$rootScope.$$phase) 
					scope.$apply();
				
			};

			scope.onContainerScroll = function() {
				hidePopup();

				if (!$rootScope.$$phase)
					scope.$apply();

			};

			scope.doBlur = function() {
				if (this.allowOther) {
					if (this.dataSource.displayText != this.dataSource.valueText)
						scope.select(this.dataSource.displayText, true);
				}
				else {
					ensureConsistency();
				}
					hidePopup();
					notifyOutstandingUpdates();
					notifyOutstandingUpdates = angular.noop;
					notifyOutstandingAdvancedUpdates();
					notifyOutstandingAdvancedUpdates = angular.noop;
				
					if (!$rootScope.$$phase) scope.$apply();

				//	if (!$rootScope.$$phase) scope.$digest();
				// Forcer MAJ Variable show, pour affichage du bon chevron si pas de valeur selectionné / voir si bien utile
					// if (!$rootScope.$$phase) scope.$digest();
			};

		

			function ensureConsistency() {
				scope.dataSource.reset();
				scope.$dirty = false;
				scope.$manualSelection = false;
			}

			function refreshGrid() {
				refreshGridTimeout = $timeout(function () {
					// Skype refresh grid if not there anymore
					if (!angular.isDefined(scope.gridOptions))
						return;

				   var firstInit = scope.gridOptions.init();

				    if (scope.multiple) {
						var shouldSelectAll = _.all(scope.dataSource.filteredCollection, function(m) { return m.selected; });
						if (scope.gridOptions && scope.gridOptions.toggleAll) {
							scope.gridOptions.toggleAll(shouldSelectAll);
						}
					}
					
				    if (!firstInit && scope.gridOptions && scope.gridOptions.refreshGridDatasource) {
						scope.gridOptions.refreshGridDatasource();
				    }

				    refreshOverlayOnRow();

				}, 0, false);
			}

			function dismissClickHandler(evt) {

				var target = $(evt.target);

				var popupParents = target.closest('#pop-' + scope.ownerId);

				if (popupParents.length > 0) {
					return;
				}

				//var parents = ; // TODO: this operation is expensive. Should we use an invisible overlay?
                
				if (target.hasClass('slick-group-toggle')) { //grid collapse / expand
				    return;
				}
				else if (target.closest('#' + scope.ownerId).length > 0) {
					return;
				}
		        else if (target.closest('ul.groupList').length > 0) { //clicked on group remove of grid!
				    return;
		        }

				scope.doBlur();
			};

			function keyDownHandler(e) {

                var pressedKey = xaKeyHelper.getKey(e, 'keydown');
             
				if (e.ctrlKey && xaKeyHelper.isEnter(pressedKey) && scope.show) {
					e.preventDefault();
                    e.stopPropagation();
					 return;
				}

                if (hotKeys.indexOf(pressedKey) === -1) {
                	return;
                }

				// esc
                if (xaKeyHelper.isEsc(pressedKey)) {
                	if (scope.show) {
                		hidePopup();
                		e.stopPropagation();
                		e.preventDefault();
                	}
                }

				// Down
                if (pressedKey === 40) {
					if (!scope.show) {
						scope.showPopup();
					} else if (scope.dataSource.filteredCollection.length) {
						scope.active = (scope.active + 1) % scope.dataSource.filteredCollection.length;
						applyActiveIndexUpdate();
					} else {
						scope.active = -1;
					}
					e.stopPropagation();
					e.preventDefault();
				}

				// Up
                if (pressedKey === 38) {
					if (!scope.show) {
						scope.showPopup();
					} else if (scope.dataSource.filteredCollection.length) {
						scope.active = (scope.active > 0 ? scope.active : scope.dataSource.filteredCollection.length) - 1;
						applyActiveIndexUpdate();
					} else {
						scope.active = -1;
					}
					e.preventDefault();
					e.stopPropagation();
				}

				// Enter ou Tab
                if (pressedKey === 13 || pressedKey === 9) {
                	if (scope.show && scope.active != undefined && scope.active > -1) {
                		if (pressedKey === 9 && scope.multiple) {
                			scope.doBlur(); // Tab sur combo multiple by by
                		}
                		else {
                			var item = scope.gridOptions.getSelectedItems()[0];
                			scope.select(item);
                			if (scope.multiple == true)
                				scope.gridOptions.refreshItem(item);
                		}
                	}
                	else if (scope.show && !scope.multiple && scope.dataSource.filteredCollection && scope.dataSource.filteredCollection.length == 1 && !scope.allowOther) {
                		scope.select(scope.dataSource.filteredCollection[0]);
                	}
                	else if (scope.allowOther)
                		scope.select(scope.dataSource.displayText);
                	else if (scope.show)
                		scope.doBlur();

                }

				if (!$rootScope.$$phase) scope.$digest();
			}

			function bindKeyboard() {

				if (keysBound) return;
				scope.unbindKeyboard();
				inputElement.on('keydown', keyDownHandler);
				keysBound = true;

			}
			scope.bindKeyboard = bindKeyboard;

			function unbindKeyboard() {

				if (!keysBound) return;
				inputElement.off('keydown', keyDownHandler);
				keysBound = false;

			}
			scope.unbindKeyboard = unbindKeyboard;


			function getInitialSortInfo() {
				if (scope.initialSortCol == null || scope.initialSortCol == undefined)
					return [{ field: 'model.' + scope.columns[0].field, direction: 'asc' }];
				else if (scope.initialSortCol != "NONE") {
					var direction = (scope.initialSortDir == 'desc') ? 'desc' : 'asc';
					return [{ field: 'model.' + scope.initialSortCol, direction: direction }]
				}
				else
					return [];
			}

			function initializeGrid() {

				if (!_.any(scope.columns)) {
					throw new Error('XaComboBox - Unable to build grid options because no columns are defined');
				}

				if (scope.gridOptions) {
					return;
				}

				var columns = new GridColumnCollection(_.map(scope.columns, function(c) {
					return angular.extend({}, c, {
						field: 'model.' + c.field
					});
				}));

				var internalGridSettings = angular.extend({}, {
				    noGroupingHeader: true,
                    nativeCheckboxColumn: scope.multiple,
                    enableCellActive: false,
					disableCalculateHeightOnLoad: true,
					data: function() {
						return scope.dataSource.filteredCollection;
					},
					uniqueKey: 'id',
					sortInfo: getInitialSortInfo(),
					columnDefs: columns,
					explicitInitialization: true,
					selectionMode:'single',
					handlers: {
						onRowClick: function(item) {
							scope.select(item);
							inputElement.focus();
						},

						onSort: function(data) {
							inputElement.focus();
						},

						onSelectAll: function() {
							scope.toggleSelection();
						},

					}
				}, scope.gridSettings);

				if (!scope.width) scope.width = '350px';
				if (!scope.height && scope.dataSource.filteredCollection && scope.dataSource.filteredCollection.length > 10) scope.height = '350px';
				internalGridSettings.height = scope.height;

				if (scope.onGetRowCss) {
					internalGridSettings.handlers.onGetRowCSS = scope.onGetRowCss;
				}


				scope.gridOptions = internalGridSettings;
			};

			function compilePopup() {
				if ($popup) {
					return;
				}

                //ensure gridOptions are populated, otherwise grid won't work.
				initializeGrid();

                //we need a different scope, because shared scope, with gridOptions in both was the reason combobox wasn't working anymore with promise datasource
				popupScope = scope.$new();
				$popup = $compile('<xa-combo-box-popup />')(popupScope);

				$document.find('body').append($popup);
			}

			function bindDocumentClick() {
				if (isDocumentClickBound) {
					return;
				}
				$document.on('click.combogrid', dismissClickHandler);
				isDocumentClickBound = true;
			}

			function unbindDocumentClick() {
				if (isDocumentClickBound) {
					$document.off('click.combogrid', dismissClickHandler);
				}
				isDocumentClickBound = false;
			}

			scope.$on('$destroy', function () {
				if (refreshGridTimeout) {
					$timeout.cancel(refreshGridTimeout);
					refreshGridTimeout = null;
				}
				unbindDocumentClick();
				unbindKeyboard();
				unwatchSource();
				unwatchSelection();
				glyphicon.off();
				if ($popup && $popup.length) {
					$popup.remove();
				}
				// Note (Stefan): These scope unwatches are not needed, they are automatically called by angular.
				// when the parent gets destroyed.
				// http://stackoverflow.com/questions/26830122/when-does-angular-clear-the-watch
				removeError();
				scope.dataSource.destroy();
				scope.dataSource = null;
				scope.gridOptions = null;
			});

		}
	});

})(window.XaNgFrameworkComboBox);