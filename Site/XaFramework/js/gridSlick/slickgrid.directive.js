(function (local) {
	'use strict';

	local.directive('xaSlickGrid', function ($window, $timeout, $rootScope, xaTranslation, $filter, xaSlickGridColumnMapper, xaSlickGridGroup, $parse, xaWindow, GridColumnCollection, xaKeyHelper, xaDirectiveHelper, $document, xaKeyboard) {
		return {
			restrict: 'EA',
			replace: true,
			scope: {
				gridOptions: '=',
				heightOffset: '@'
			},
			templateUrl: '../js/gridSlick/slickgrid.tpl.html',
			link: function (scope, element, attrs) {

				scope.gridOptions = scope.gridOptions || {};
				if ($rootScope.isTouchDevice) {
					element.addClass('mobileGrid');
				}

				if (!scope.gridOptions.gridName)
					scope.gridOptions.gridName = 'slickGrid' + scope.$id;

				element.addClass(scope.gridOptions.gridName); //add class for grid

				// Mise en place de valeur par défaut
				scope.gridOptions.nativeCheckboxColumn = scope.gridOptions.nativeCheckboxColumn === true ? true : false;
				scope.gridOptions.enableCellActive = scope.gridOptions.enableCellActive === false ? false : true;
				scope.gridOptions.multiColumnSort = scope.gridOptions.multiColumnSort === false ? false : true;

				xaDirectiveHelper.setTestIdOnElement(element, 'grd', attrs.gridOptions);

				//////////////////////////////////////////
				//       Local variables.               //
				//////////////////////////////////////////

				var TXT_LIGNES = xaTranslation.instant('TXT_LIGNES');
				var TXT_LIGNE = xaTranslation.instant('TXT_LIGNE');
				var TXT_MAX = xaTranslation.instant('TXT_MAX');

				var grid,
					cleaners = [],
					$win = angular.element($window),
					gridHost = element.find('.xa-slick-grid-host'),

					gridSourceWatch = angular.isString(scope.gridOptions.data) ? '$parent.' + scope.gridOptions.data : 'gridOptions.data',

					rowSelectionModel = new Slick.RowSelectionModel(),
					draggingHeaders = new Slick.Plugins.DraggingHeaders(),
					groupItemMetaDataProvider = new Slick.Data.GroupItemMetadataProvider(),
					checkboxSelector = new Slick.CheckboxSelectColumn({ cssClass: "slick-cell-checkboxsel" }),
					dataView = new Slick.Data.DataView({ groupItemMetadataProvider: groupItemMetaDataProvider }),

					isDragAndDropOnProgress = false,
					options = {
						isTouchDevice: $rootScope.isTouchDevice,
						rowHeight: scope.gridOptions.rowHeight || ($rootScope.isTouchDevice ? 28 : 25),
						editable: scope.gridOptions.canedit === false ? false : true,
						autoEdit: true, //set it to false to doubleclick to edit.
						multiSelect: scope.gridOptions.selectionMode == 'multiple',
						disableRowSelection: scope.gridOptions.selectionMode == 'none',
						enableCellNavigation: true,
						enableColumnReorder: false,
						forceSyncScrolling: false, //will draw new rows after 50ms. 
						syncColumnCellResize: false, //set to false for better perf
						forceFitColumns: true,
						fullWidthRows: false,
						dataItemColumnValueExtractor: customDataExtractor,
						enableTextSelectionOnCells: false, //if true, when shift-select multiple rows, the text will get selected as well.
						multiColumnSort: scope.gridOptions.multiColumnSort,
						explicitInitialization: true, //was used only in combobox, now everywhere! scope.gridOptions.explicitInitialization
						nativeCheckboxColumn: scope.gridOptions.nativeCheckboxColumn,
						enableCellActive: scope.gridOptions.enableCellActive
						//cellHighlightCssClass: "changed"
					};


				//////////////////////////////////////////
				//       Columns initialization.        //
				//////////////////////////////////////////

				var hasNewColumnsBehaviour = (scope.gridOptions.columnDefs instanceof GridColumnCollection);

				if (!hasNewColumnsBehaviour) {
					console.warn('Old columnDefs detected. Upgrade to GridColumnCollection.', scope.gridOptions);
				}

				scope.columnsDefinition = hasNewColumnsBehaviour ?
					scope.gridOptions.columnDefs :
					new GridColumnCollection(scope.gridOptions.columnDefs);

				scope.columnsDefinition.onChanged(function () {
					updatePersonalisedColumns(scope.columnsDefinition.columns);
				});

				//////////////////////////////////////////

				scope.gridOptions.handlers = scope.gridOptions.handlers || {};

				var isSettingSelection = false;
				scope.heightOffset = scope.heightOffset == undefined ? 12 : +scope.heightOffset; //grid is in bootstrap .row
				scope.gridOptions.groups = scope.gridOptions.groups || [];
				scope.gridOptions.initialGroups = scope.gridOptions.groups;

				scope.gridOptions.sortInfo = scope.gridOptions.sortInfo || [];
				scope.gridOptions.initialSortInfo = scope.gridOptions.sortInfo;
				//scope.gridOptions.showColumnOptions = true;
				//scope.gridOptions.allowRowMove = true;
				scope.gridOptions.showBulleAide = true;

				scope.gridRowCount = 0;
				scope.groups = [];
				var activeGroups = [];
				var selectedItems = [];
				var columns = [];
				var summaryAggregators = [];

				scope.gridOptions.getCellData = customDataExtractor;


				var slickSortInfo = {};

				//column personalisation
				var getUserPreferences = function () {

					var prefArr = {};
					if (angular.isFunction(scope.gridOptions.handlers.getUserPreferences))
						prefArr = scope.gridOptions.handlers.getUserPreferences();
						/* else if (scope.gridOptions.gridName)
							prefArr = JSON.parse(localStorage[scope.gridOptions.gridName] || '{}'); */
					else prefArr = {};

					return prefArr;
				};

	

				var getPersonalisedColumns = function (colDefs) {
					columns = [];
					var userPrefs = getUserPreferences();
					if (userPrefs && userPrefs.personalised && userPrefs.personalised.length > 0) {
						var columnAutoSize = userPrefs.columnAutoSize == undefined ? true : userPrefs.columnAutoSize;
						(grid ? grid.getOptions() : options).forceFitColumns = columnAutoSize;

						// Find the column from personnalisation
						var pers = _.map(userPrefs.personalised, function (col) {
							return _.find(colDefs, function (perCol) {
								return col == perCol.field;
							});
						});

						// Mandatory column
						var alwaysShow = _.filter(colDefs, function (perCol) {
							return perCol.alwaysShow == true || perCol.alwaysFirst == true;
						});

						// Add if mandatory column missing
						if (alwaysShow && alwaysShow.length > 0)
							pers = _.union(pers, alwaysShow);


						// Enlever les colonnes qui ont été supprimer
						pers = _.filter(pers, function (col) { return col != null });

						// Move to first position to first column
						var alwaysFirst = _.filter(pers, function (col) { return col.alwaysFirst == true });
						if (alwaysFirst && alwaysFirst.length > 0) {
							_.forEach(alwaysFirst, function (col) {
								var idx = pers.indexOf(col);
								if (idx > 0) {
									pers.splice(idx, 1);
									pers.unshift(col);
								}
							});
						}

						// Get the column
						columns = xaSlickGridColumnMapper.map(pers, true);

						// Gestion des largeurs automatiques
						if (userPrefs.columnAutoSize === false && userPrefs.width) {
							_.forEach(userPrefs.width, function (colWithWidth) {
								var col = _.findWhere(columns, { field: colWithWidth.field });
								if (col != null)
									col.width = colWithWidth.width;
							});
						}
				

					} //if no personalisation provided, just use all the columns
					else columns = xaSlickGridColumnMapper.map(colDefs, false);

					summaryAggregators.length = 0;
					_.each(columns, function (gc) {
						if (gc.summaryRowAggrator)
							summaryAggregators.push(gc.summaryRowAggrator);
					});


					if (scope.gridOptions.allowRowMove) {
						columns.splice(0, 0, {
							id: "#RowMoveColumn",
							name: "",
							width: 40,
							behavior: "selectAndMove",
							selectable: false,
							resizable: false,
							sortable: false,
							cssClass: "cell-reorder dnd"
						});
					}

					if (scope.gridOptions.showBulleAide && userPrefs && userPrefs.bulle && userPrefs.bulle.length > 0) {
						columns.splice(0, 0, {
							id: '#BulleAideColumn',
							name: "...",
							width: 20,
							resizable: false,
							sortable: false,
							formatter: function () { return '<span class="bulle-aide"></span>'; },
							cssClass: "bulle text-center",
							headerCssClass: "text-center",
							colData: userPrefs.bulle
						});
					}

					//order by
					if (userPrefs && userPrefs.sortBy) // && userPrefs.sortBy.length > 0
						scope.gridOptions.sortInfo = userPrefs.sortBy;
					else
						scope.gridOptions.sortInfo = scope.gridOptions.initialSortInfo;

					if (grid) //if we have col refresh, build col refresh
						buildSortCols();


					//group by
					if (userPrefs && userPrefs.groupBy)  //&& userPrefs.groupBy.length > 0
						scope.gridOptions.groups = userPrefs.groupBy;
					else
						scope.gridOptions.groups = scope.gridOptions.initialGroups;

					if (grid) //if we have col refresh, build col refresh
						buildGroupCols();

					if (scope.gridOptions.nativeCheckboxColumn) {
						columns.unshift(checkboxSelector.getColumnDefinition());
					}

					return columns;
				};

				var updatePersonalisedColumns = function (newColDefs) {
					getPersonalisedColumns(newColDefs || scope.columnsDefinition.columns);
					grid.setColumns(columns);
				}

				getPersonalisedColumns(scope.columnsDefinition.columns);

				grid = new Slick.Grid(gridHost, dataView, columns, options);
				grid.registerPlugin(groupItemMetaDataProvider);


				function subscribeAction(actionName, actionCallback, obj) {
					var obj = obj || grid;

					if (!obj[actionName]) {
						alert("Event " + actionName + " not found!");
					}

					obj[actionName].subscribe(actionCallback);
					cleaners.push(function () {
						if (obj) {
							obj[actionName].unsubscribe(actionCallback);
						}
					});
				}


				if (scope.gridOptions.handlers.deleteFn) {
					// Initialisation de la css du drag and drop
					scope.gridOptions.allowRowDragging = true;
					if (!scope.gridOptions.dropTargetList) scope.gridOptions.dropTargetList = [];
					scope.gridOptions.dropTargetList.push('.delete' + scope.gridOptions.gridName);

					// Initialisation du bouton
					updateDeleteStatus();

					// Mise en place de la méthode de suppression
					scope.deleteFn = function deleteFn() {
						var items = scope.gridOptions.getSelectedItems();

						if (items.length > 0) {
							if (scope.gridOptions.handlers.deleteVisibilityFn == undefined || scope.gridOptions.handlers.deleteVisibilityFn(items) !== false)
								scope.gridOptions.handlers.deleteFn(items,  '.delete' + scope.gridOptions.gridName);
						}
					}
				}
				else {
					scope.deleteFn = null;
				}


				function updateDeleteStatus(items) {
					if (scope.gridOptions.handlers.deleteFn) {
						if (items && items.length > 0) {
							if (scope.gridOptions.handlers.deleteVisibilityFn == undefined || scope.gridOptions.handlers.deleteVisibilityFn(items) !== false)
								scope.imgTrashUrl = 'XaFramework/Img/TrashCan_big.png';
							else
								scope.imgTrashUrl = 'XaFramework/Img/TrashCannot_big.png';
						}
						else
							scope.imgTrashUrl = 'XaFramework/Img/TrashCannot_big.png';
					}
				}



				if (scope.gridOptions.dropTargetList && scope.gridOptions.dropTargetList.length > 0) {

					var draggingRows = new Slick.Plugins.DraggingRows({ dropTargets: scope.gridOptions.dropTargetList, sourceGrid: scope.gridOptions.gridName });
					grid.registerPlugin(draggingRows);

					var onRowDragged = function (evt, args) {
						if (angular.isFunction(scope.gridOptions.handlers.onRowDragged)) {
							scope.gridOptions.handlers.onRowDragged(args.rowInstances, args.dropClass);
							if (!scope.$$phase)
								scope.$apply();
						}
					};

					var onRowDragHtml = function (evt, args) {
						if (angular.isFunction(scope.gridOptions.handlers.onRowDragHtml)) {
							return scope.gridOptions.handlers.onRowDragHtml(args.rows, scope.gridOptions);
						}
						throw new Error('Row dragging used without setting onRowDragHtml handler. Please set it and return a HTML string to be used as a dragging proxy');
					}

					var onDragInit = function () {
						if (angular.isFunction(scope.gridOptions.handlers.onDragInit)) {
							return scope.gridOptions.handlers.onDragInit();
						}
					}

					var onDragStart = function () {
						isDragAndDropOnProgress = true;
						if (angular.isFunction(scope.gridOptions.handlers.onDragStart)) {
							return scope.gridOptions.handlers.onDragStart();
						}
					}
					var onDragEnd = function () {
						isDragAndDropOnProgress = false;
						if (angular.isFunction(scope.gridOptions.handlers.onDragEnd)) {
							return scope.gridOptions.handlers.onDragEnd();
						}
					}

					subscribeAction('onRowDragged', onRowDragged, draggingRows);
					subscribeAction('onDragInit', onDragInit, draggingRows);
					subscribeAction('onDragStart', onDragStart, draggingRows);
					subscribeAction('onDragEnd', onDragEnd, draggingRows);
					subscribeAction('onRowDragHtml', onRowDragHtml, draggingRows);
				}
				if (scope.gridOptions.allowRowMove) {
					var moveRowsPlugin = new Slick.RowMoveManager({
						cancelEditOnDrag: true
					});

					var onBeforeMoveRows = function (e, data) {
						for (var i = 0; i < data.rows.length; i++) {
							// no point in moving before or after itself
							if (data.rows[i] == data.insertBefore || data.rows[i] == data.insertBefore - 1) {
								e.stopPropagation();
								return false;
							}
						}
						return true;
					};

					var onMoveRows = function (e, args) {
						var extractedRows = [], left, right;
						var rows = args.rows;
						var insertBefore = args.insertBefore;

						var cancel = false;
						if (angular.isFunction(scope.gridOptions.handlers.onMoveRows)) {
							cancel = scope.gridOptions.handlers.onMoveRows(args);
						}

						if (!cancel) {

							var extractedRows = [], left, right;
							var rows = args.rows;
							var insertBefore = args.insertBefore;
							left = gridData.slice(0, insertBefore);
							right = gridData.slice(insertBefore, gridData.length);
							rows.sort(function (a, b) { return a - b; });
							for (var i = 0; i < rows.length; i++) {
								extractedRows.push(gridData[rows[i]]);
							}
							rows.reverse();
							for (var i = 0; i < rows.length; i++) {
								var row = rows[i];
								if (row < insertBefore) {
									left.splice(row, 1);
								} else {
									right.splice(row - insertBefore, 1);
								}
							}

							var newGridData = left.concat(extractedRows.concat(right));

							var data = angular.isFunction(scope.gridOptions.data) ? scope.gridOptions.data() : scope.gridOptions.data;
							data.length = 0;
							_.each(newGridData, function (item) {
								data.push(item);
							});
							if (angular.isFunction(scope.gridOptions.data))
								scope.gridOptions.refreshGridDatasource();

							if (angular.isFunction(scope.gridOptions.handlers.onDataOrderChanged))
								scope.gridOptions.handlers.onDataOrderChanged(newGridData);

							if (!$rootScope.$$phase)
								scope.$apply();
						}

					};

					subscribeAction('onMoveRows', onMoveRows, moveRowsPlugin);
					subscribeAction('onBeforeMoveRows', onBeforeMoveRows, moveRowsPlugin);

					grid.registerPlugin(moveRowsPlugin);
				}

				var copyManager = new Slick.CellExternalCopyManager();
				grid.registerPlugin(copyManager);


				if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onGetRowStyle)) {
					var onGetRowStyle = function (evt, args) {
						var res = scope.gridOptions.handlers.onGetRowStyle(args.row);
						if (!res) res = '';
						return res;
					};
					subscribeAction('onGetRowStyle', onGetRowStyle);
				}

				if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onGetRowCSS)) {
					var onGetRowCSS = function (evt, args) {
						var res = scope.gridOptions.handlers.onGetRowCSS(args.row);
						if (!res) res = '';
						return res;
					};
					subscribeAction('onGetRowCSS', onGetRowCSS);
				}


				if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onGetCellCSS)) {
					var onGetCellCSS = function (evt, args) { //exclude grouping rows
						if (!args.row.hasOwnProperty('__group')) {
							var res = scope.gridOptions.handlers.onGetCellCSS(args.row, args.column);
							if (!res) res = '';
							return res;
						}
					};
					subscribeAction('onGetCellCSS', onGetCellCSS);
				}

				if (scope.gridOptions.showGroupPanel)
					grid.registerPlugin(draggingHeaders);
				else
					$('.xa-slick-grid-group-elements', element).hide();

				grid.registerPlugin(new Slick.AutoTooltips()); //show automatic tooltips.

				var buildSortCols = function () {
					var sortCols = [];
					for (var idx = 0; idx < scope.gridOptions.sortInfo.length; idx++) {
						var sortDir = scope.gridOptions.sortInfo[idx].direction == 'asc';

						sortCols.push({ columnId: scope.gridOptions.sortInfo[idx].field, sortAsc: sortDir });
					}

					if (!scope.gridOptions.multiColumnSort && sortCols.length > 0)
						sortCols = [sortCols[0]];
					grid.setSortColumns(sortCols);
				}
				if (scope.gridOptions.sortInfo && scope.gridOptions.sortInfo.length > 0) {
					buildSortCols();
				}

				if (options.disableRowSelection !== true) {
					grid.setSelectionModel(rowSelectionModel);
					cleaners.push(function () {
						rowSelectionModel.destroy();
						rowSelectionModel = null;
						grid.setSelectionModel(null);
					});
				}

				if (scope.gridOptions.nativeCheckboxColumn) {
					grid.registerPlugin(checkboxSelector);
					subscribeAction('onSelectAll', onSelectAll, checkboxSelector);
				}

				var buildGroupCols = function () {
					activeGroups = [];

					var normalizedGroups = _.map(scope.gridOptions.groups, function (grp) {
						if (typeof grp == 'string') return { field: grp, direction: 'asc' };
						return grp;
					});


					var groupCols = _.map(normalizedGroups, function (item) {
						return _.find(columns, function (col) {
							var res = col.field == item.field;
							if (res) {
								col.groupSortDirection = item.direction;
							}
							return res;
						});
					});


					_.each(groupCols, function (gc) {
					    if (gc)
						    activeGroups.push(new xaSlickGridGroup(gc, summaryAggregators));
					});

					syncWithDataViewGroups();
				};
				if (scope.gridOptions.groups && scope.gridOptions.groups.length > 0) {
					buildGroupCols();
				}


				var findItemIndex = function (itemToFind) {
					if (!itemToFind) return -1;

					return dataView.getRowById(itemToFind[scope.gridOptions.uniqueKey]);
				};

				scope.gridOptions.findItemIndex = findItemIndex;

				scope.gridOptions.refreshCell = function (item, columnName) {
					var row = findItemIndex(item);
					var cell = grid.getColumnIndex(columnName);
					grid.updateCell(row, cell);
				};

				scope.gridOptions.refreshItem = function (item, ignoreFocus) {
					var idx = findItemIndex(item);

					if (idx > -1) {
						grid.invalidateRow(idx);
						grid.render();

						// Pas de raison de manipuler la selection sur le refresh item, si ce n'est pour mettre le focus à réajuster.
						if (ignoreFocus === true) {
							var activeCell = grid.getActiveCell();
							var previousColumnActive = activeCell ? activeCell.cell : 0;
							syncSelection(ignoreFocus != true, previousColumnActive);
						}

						// TODO: A ENELEVER et remonter code dans selection CHANGE
						//  Mettre a jours indicateur de la ligne en cours si fait partie de la selection
						if (selectedItems && selectedItems.indexOf(item) >= 0)
							updateDeleteStatus(selectedItems);

					}

				};

				scope.gridOptions.refreshGrid = function () {
					grid.invalidateAllRows();
					grid.render();

					if (element.is(":visible")) {
						grid.resizeCanvas();

						// TODO: A ENELEVER et remonter code dans selection CHANGE
						// Mettre a jours indicateur de la ligne en cours si fait partie de la selection
						if (selectedItems && selectedItems.length > 0)
							updateDeleteStatus(selectedItems);
					}
				};


				function applyQuickSearch() {
					// SI PAS DE RECHERCHE RAPIDE EN COURS
					if (!scope.searchValue || scope.searchValue == "")
						return scope.gridOptions.data();

					var data = scope.gridOptions.data();
					var fields = scope.gridOptions.quickSearchFields;
					var searchedValue = scope.searchValue.toUpperCaseWithoutAccent();
					var result = [];
					// Si quickSearchFields = ['*'], alors on recherche sur tous les champs.
					if (fields[0] == '*') {
						var trueColumn = _.filter(columns, function (col) { return col.type != 'image' && col.id != '#RowMoveColumn' && col.id != '#BulleAideColumn' });
						fields = _.map(trueColumn, 'field');
					}

					return _.filter(data, function (row) {
						for (var i = 0; i < fields.length; i++) {
							// Voir si on utilise le cellFilter pour rechercher sur la version texte exacte.
							if (row && row[fields[i]] && row[fields[i]].toString().toUpperCaseWithoutAccent().indexOf(searchedValue) >= 0)
								return true;
						}
						return false;
					});
				}

				if (angular.isArray(scope.gridOptions.quickSearchFields) && scope.gridOptions.quickSearchFields.length > 0) {
					scope.quickSearchFn = function searchFn() {
						scope.gridOptions.refreshGridDatasource();
						dataView.expandAllGroups();

					}
				}
				else {
					scope.quickSearchFn = null;
				}


				scope.gridOptions.getCurrentDisplayState= function () {
					var res = {};
					res.columnAutoSize = (grid ? grid.getOptions() : options).forceFitColumns;


					var trueColumn = _.filter(columns, function (col) { return col.id != '#RowMoveColumn' && col.id != '#BulleAideColumn' });
					res.personalised = _.map(trueColumn, 'field');
					
					var bulleAideColumn = _.find(columns, function (col) { return col.id == '#BulleAideColumn'  });
					if (bulleAideColumn)
						res.bulle = _.map(bulleAideColumn.colData, function (fieldName){return fieldName}) ;
					else
						res.bulle = [];

					res.sortBy = _.map(scope.gridOptions.sortInfo, function (sort) {
						if (typeof sort === 'string')
							return { field: sort, direction: 'asc' }
						else
							return { field: sort.field, direction: sort.direction };
					});
					res.groupBy = _.map(scope.gridOptions.groups, function (group) {
						if (typeof group === 'string')
							return { 	field: group, direction: 'asc' }
						else
							return {field: group.field, direction: group.direction	};
					});

					res.width = [];
					if (res.columnAutoSize === false) {
						var colsWidthModified = _.filter(trueColumn, function (col) { return col.field && col.width != col.minWidth });
						res.width = _.map(colsWidthModified, function (col) {
							return { field: col.field, width: col.width }
						});
					}

					return res;
				}

				scope.gridOptions.getSortByInfo = function () {
					return scope.gridOptions.sortInfo;
				}

				scope.gridOptions.getGroupByInfo = function () {
					return scope.gridOptions.groups;
				}

				scope.gridOptions.refreshGridWithColumns = function (newColumns, sortBy, groupBy) {
					scope.gridOptions.columnDefs.updateColumns(newColumns);
					if (sortBy) {
						scope.gridOptions.sortInfo = sortBy;
						buildSortCols();
					}
					if (groupBy) {
						scope.gridOptions.groups = groupBy;
						buildGroupCols();
					}
				}

				scope.gridOptions.refreshGridExistingColumns = function (newColumns) {
					scope.gridOptions.columnDefs.refreshColumns(newColumns);
				}

				
				scope.gridOptions.refreshGridDatasource = function (ignoreFocus) {
					changeDataSource(applyQuickSearch(), ignoreFocus);
					scope.gridOptions.refreshGrid();
				}

				scope.gridOptions.editActiveCell = function () {
					return grid.editActiveCell();
				}

				scope.gridOptions.init = function () {
					return grid.init();
				}
				scope.gridOptions.toggleAll = function (checked) {
					if (scope.gridOptions.nativeCheckboxColumn) {
						checkboxSelector.toggleAll(checked);
					}
				};

				scope.gridOptions.getGridData = function () {
					return gridData;
				};

				scope.gridOptions.selectFirstItem = function (ignoreFocus) {

					var firstItem = dataView.getItemByIdx(0),
						dataViewGroups = dataView.getGroups();

					if (_.any(dataViewGroups)) {

						var lastNestedGroup = _.first(dataViewGroups);

						while (_.any(lastNestedGroup.groups)) {
							lastNestedGroup = _.first(lastNestedGroup.groups);
						}

						firstItem = _.first(lastNestedGroup.rows);
					}

					if (firstItem) {
						scope.gridOptions.setSelectedItem(firstItem, ignoreFocus);
					}

					return firstItem;

				};
				scope.gridOptions.resetSelectedItem = function ( ignoreFocus) {
					scope.gridOptions.setSelectedItems([], ignoreFocus);
				};
				scope.gridOptions.setSelectedItem = function (selItem, ignoreFocus) {
					if (!selItem) return;
					scope.gridOptions.setSelectedItems([selItem], ignoreFocus);
				};
				scope.gridOptions.setSelectedItems = function (selItemArr, ignoreFocus) {
					var idxList = [];
					for (var idx = 0; idx < selItemArr.length; idx++) {
						var itemIdx = findItemIndex(selItemArr[idx]);
						if (itemIdx > -1) {
							idxList.push(itemIdx);
						}
					}

					setSelectedIndices(idxList, ignoreFocus);
				};

				scope.gridOptions.setSelectedIndex = function (idx, ignoreFocus) {
					if (idx > -1)
						setSelectedIndices([idx], ignoreFocus);
					else
						setSelectedIndices([], ignoreFocus);
				};

				var setSelectedIndices = function (idxArr, ignoreFocus) {
					grid.setSelectedRows(idxArr);

					selectedItems = _.map(idxArr, function (idx) {
						return grid.getDataItem(idx);
					});

					if (idxArr.length > 0) {
						var idx = idxArr[0];
						grid.scrollRowIntoView(idx);

						// Disable focus when select multiple cell, otherwise the selection is lost
						if (!ignoreFocus && idxArr.length == 1) {
							grid.focus();

							var activeCell = grid.getActiveCell();
							var previousColumnActive = activeCell ? activeCell.cell : 0;
							grid.setActiveCell(idx, previousColumnActive > 0 && columns.length > previousColumnActive ? previousColumnActive : 0);
						}
					}

				};

				scope.gridOptions.getSelectedItems = function () {
					var selectionIdxArr = grid.getSelectedRows();

					var selItemArr = [];
					for (var idx = 0; idx < selectionIdxArr.length; idx++) {
						var dataItem = grid.getDataItem(selectionIdxArr[idx]);
						if (dataItem && !dataItem.hasOwnProperty('__group'))
							selItemArr.push(dataItem);
					}

					return selItemArr
				};

				scope.gridOptions.scrollRowIntoView = function (idx) {
					if (idx >= 0) {
						grid.scrollRowIntoView(idx);
					}
				}

				scope.gridOptions.getData = function () {
					return dataView.getItems();
				};

				scope.gridOptions.getCurrentVisibleColumns = function () {
					return columns;
				}


				var gridData = null;

				if (!hasNewColumnsBehaviour) {

					scope.$watch('gridOptions.columnDefs', function xaGridColumnDefsWatcher(newColDefs, oldColDefs) {
						if (newColDefs && oldColDefs) {
							scope.columnsDefinition.updateColumns(newColDefs);
						}
					}, true); // TODO: this is an expensive operation and the watcher runs several times when opening. Can we switch to using a function?

				}






				if (angular.isFunction(scope.gridOptions.data)) {
					changeDataSource(scope.gridOptions.data());
				}
				else {
					var gridSource = $parse(gridSourceWatch)(scope);

					var unwatchCollection = angular.noop;

					unwatchCollection = scope.$watchCollection(function () {
						return $parse(gridSourceWatch)(scope);

					}, function xaGridDataSourceWatcher(coll, oldColl) {
						changeDataSource(coll);
					});
					//}
				}

				function changeDataSource(coll, ignoreFocus) {
					if (angular.isArray(coll)) {
						var activeCell =  grid.getActiveCell();
						var previousColumnActive = activeCell ? activeCell.cell : 0;

						gridData = coll;

						try {
							//if was sorted, reapply sort!
							if (scope.gridOptions.sortInfo && scope.gridOptions.sortInfo.length > 0) {
								var colArr = [];
								_.each(scope.gridOptions.sortInfo, function (si) {
									var sortCol = _.find(columns, function (col) { return col.field == si.field; });
									if (sortCol)
										colArr.push({ sortCol: sortCol, sortAsc: (si.direction == 'asc') });
								});
								gridData = sortGrid(colArr, gridData);
							}

							dataView.setItems(gridData, scope.gridOptions.uniqueKey);

							if (syncSelection)
								syncSelection(ignoreFocus != true, previousColumnActive);

						} catch (ex) {
							if (angular.isString(ex)) {
								console.error('Error in slick grid: ' + ex + '. Title: ' + scope.gridOptions.title + ', data: ', scope.gridOptions.data);

							}

							throw ex;
						}

						refreshCount();
						// scope.gridRowCount = gridData.length;
						// scope.isMax = scope.gridOptions.maxRows != undefined && scope.gridRowCount >= scope.gridOptions.maxRows;
					}
				}

				function refreshCount() {
					if (scope.gridRowCount != gridData.length) {
						var ctrl = $("#gridRowCount", element);
						scope.gridRowCount = gridData.length;
						scope.isMax = scope.gridOptions.maxRows != undefined && scope.gridRowCount >= scope.gridOptions.maxRows;

						if (scope.isMax)
							ctrl.html('<span style="color:red">' + scope.gridRowCount + ' ' + TXT_LIGNES + ' (' + TXT_MAX + ': ' +  scope.gridRowCount + ')</span>');
						else
						    ctrl.text(scope.gridRowCount + ' ' + (scope.gridRowCount > 1 ? TXT_LIGNES : TXT_LIGNE));
					}
				}

				var syncSelection = function (setFocus, previousColumnActive) {
					if (selectedItems && selectedItems.length > 0) { //restore selection
					
						var idxArr = [];
						var newSelArr = [];
						_.each(selectedItems, function (item) {
							var exists = _.find(gridData, function (gridItem) {
								return gridItem[scope.gridOptions.uniqueKey] == item[scope.gridOptions.uniqueKey] && item._disabledRow != true;
							});
							if (exists) {
								newSelArr.push(item);
								var idx = findItemIndex(item);
								idxArr.push(idx);
							}
						});

						grid.resetActiveCell();
						grid.setSelectedRows(idxArr);

						//raise selection change, to sync the selection info with calle
						onSelectionChange(idxArr);
						selectedItems = newSelArr;

						if (idxArr.length > 0 && scope.gridOptions.enableCellActive) { //maybe pass a flag to not always follow selection?
							if (setFocus) {
								grid.focus();
							}

							// if cell selected keep the column selected, else reselect first column
							if (previousColumnActive == undefined) {
								var activeCell = grid.getActiveCell();
								previousColumnActive = activeCell ? activeCell.cell : 0;
							}
							grid.setActiveCell(idxArr[0], previousColumnActive > 0 && columns.length > previousColumnActive ? previousColumnActive : 0);
							
						}
					}
				};

				scope.removeGroup = function ($index) {
					if ($index == -1 || activeGroups[$index]._column.type == '0widthgroupable')
						return;

					activeGroups.splice($index, 1);
					syncWithDataViewGroups();

				};

				scope.sortGroup = function ($index) {

					var groupToSort = activeGroups[$index];

					if (!groupToSort) {
						throw new Error("No group found for sorting at index " + $index);
					}

					groupToSort.toggleSorting();
					syncWithDataViewGroups();
					grid.resetActiveCell();

				};

				//custom header management
				var onHeaderCellRendered = function (evt, args) {
					//if args has custom header...
					if (args.column && args.column.headerFormatter) {
						$(args.node).find('.slick-column-name').addClass('custom-header-column').html(args.column.headerFormatter(args.column,args.grid));
					}
				};
				subscribeAction('onHeaderCellRendered', onHeaderCellRendered);

				var onHeaderClick = function (evt, args) {
					if (args.column && args.column.headerClick) {
						if ($(evt.target).hasClass("slick-sort-indicator") || $(evt.target).hasClass("slick-header-column") || $(evt.target).hasClass("slick-column-name")) { //clicked on sort, Do nothing
						}
						else {
							var colDef = scope.columnsDefinition.findColumnByFieldName(args.column.field);
							args.column.headerClick(evt, $(evt.target).closest('.custom-header-column :first-child'), colDef, args.grid);
							evt.preventDefault();
						}
					}
				};
				subscribeAction('onHeaderClick', onHeaderClick);
				subscribeAction('onGroupDropped', onGroupDropped, draggingHeaders);

				subscribeAction('onCellChange', onCellChange);
				subscribeAction('onCellChanging', onCellChanging);
				subscribeAction('onSelectedRowsChanged', onSelectedRowsChanged);
				subscribeAction('onDblClick', onDblClick);
				subscribeAction('onKeyDown', onKeyDown);

				subscribeAction('onRowCountChanged', onRowCountChanged, dataView);
				subscribeAction('onRowsChanged', onRowsChanged, dataView);

				subscribeAction('onSort', onSort);
				subscribeAction('onClick', onClick);
				subscribeAction('onBeforeClick', onBeforeClick);
				subscribeAction('onValidationError', onValidationError);
				subscribeAction('onBeforeEditCell', onBeforeEditCell);

				function onValidationError(e, args) {
					//console.error('Error validating grid value: ' + args.validationResults.msg);
				}

				function onSelectAll(args) {
					if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onSelectAll)) {
						scope.gridOptions.handlers.onSelectAll(args);
					}
				}

				function onSort(e, args) {
					var colArr = [];
					if (args.multiColumnSort) {
						colArr = args.sortCols;
					}
					else colArr.push({ sortCol: args.sortCol, sortAsc: args.sortAsc });

					var sorted = sortGrid(colArr, null);

					dataView.setItems(sorted, scope.gridOptions.uniqueKey);
					slickSortInfo = { sortCol: args.sortCol, sortAsc: args.sortAsc };

					scope.gridOptions.sortInfo = _.map(colArr, function (item) {
						return { field: item.sortCol.field, direction: item.sortAsc ? 'asc' : 'desc' };
					});

					if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onSort)) {
						scope.gridOptions.handlers.onSort(sorted);
					}

					syncSelection(true);
				}

				function sortGrid(colArr, items) {
					var items = items || dataView.getItems();
					var sorted = items;
					
					var sortColumns = colArr.reverse();
					for (var i = 0; i < colArr.length; i++) {
						var col = colArr[i];

						sorted = _.sortBy(sorted, function (dataItem) {
							if (col.sortCol.sortValueFn)
								return col.sortCol.sortValueFn(dataItem[col.sortCol.field], dataItem, col.sortCol);
							

							if (col.sortCol.complexType)
								return customDataExtractor(dataItem, col.sortCol);

							var val = dataItem[col.sortCol.field]
							if (val && val.toUpperCaseWithoutAccent)
								return val.toUpperCaseWithoutAccent();
							else
								return val;
						});
						
						// Condition pour ne pas casser un double tri descendant, 
						// le second tri s'occupera de faire le tri pour les 2
						if (i + 1 != sortColumns.length && sortColumns[i + 1].sortAsc == false) 
							continue;
						
						if (!col.sortAsc) sorted = sorted.reverse();
					}

					return sorted;
				}

				function onSelectedRowsChanged(e, args) {
					onSelectionChange(args.rows);
				}

				function onSelectionChange(selectionIdxArr) {
					if (isSettingSelection) return;


					var selItemArr = [];
					for (var idx = 0; idx < selectionIdxArr.length; idx++) {
						var dataItem = grid.getDataItem(selectionIdxArr[idx]);
						if (dataItem && !dataItem.hasOwnProperty('__group'))
							selItemArr.push(dataItem);
					}

					// TODO VTO: Detection si selection a changé, es ce le bonne endroit pour ce code ???
					var isNewDs = false;
					if (selectedItems && selItemArr && selectedItems.length == selItemArr.length) {
						for (var i = 0; i < selectedItems.length; i++) {
							if (!_.find(selItemArr, function (item) { return item[scope.gridOptions.uniqueKey] == selectedItems[i][scope.gridOptions.uniqueKey]; })) {
								isNewDs = true;
								break;
							}
						}
					}
					else
						isNewDs = true;


					if (isNewDs == false)
						return;
					//----- Detection si selection a changé, es ce le bonne endroit pour ce code ???

					selectedItems = _.clone(selItemArr);



					if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onSelectionChange)) {
						var fnArg = null;
						if (selItemArr.length == 1)
							fnArg = selItemArr[0];
						else if (selItemArr.length > 1)
							fnArg = selItemArr;

						scope.gridOptions.handlers.onSelectionChange(fnArg);
					}

					updateDeleteStatus(selItemArr);

					if (!$rootScope.$$phase)
						scope.$apply();
				}

				function onCellChange(e, args) { //for header cells, like checkbox on header

					if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onCellChange)) {
						var dataItem = args.item;
						var col = columns[args.cell];
						var newVal = dataItem[col.field];
						var extCol = scope.columnsDefinition.findColumnByFieldName(col.field);

						scope.gridOptions.handlers.onCellChange(newVal, dataItem, extCol);
					}

					if (!$rootScope.$$phase)
						scope.$apply();
				}

				function onBeforeEditCell(e, args) { //for header cells, like checkbox on header
					if (scope.gridOptions.canedit == false)
						return false;

					if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onBeforeEditCell)) {
						return scope.gridOptions.handlers.onBeforeEditCell(args.item, args.column);
					}
					return null;
				}


				function onCellChanging(e, args) {
					var dataItem = args.item;

					//return null to
					var extCol = _.find(scope.columnsDefinition.columns, function (col) {
						return col.field == args.column.field;
					});
					if (extCol.onCellChanging) {
						return extCol.onCellChanging(args.oldValue, args.value, extCol);
					}
					else if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onCellChanging)) {
						return scope.gridOptions.handlers.onCellChanging(args.oldValue, args.value, args.item, extCol);
					}

					return null;
				}

				function onGroupDropped(e, args) {
					var column = args.column;
					var existing = _.find(activeGroups, function (g) { return g.field === column.field; });
					if (existing) {
						return;
					}

					//RPO: check if grouped column belongs to actual colDefs. Bug in grouping when 2 grids, both with at least one field grouped
					var hasCol = _.find(scope.gridOptions.columnDefs.columns, function (c) { return c.field === column.field; });
					if (!hasCol) {
						return;
					}

					activeGroups.push(new xaSlickGridGroup(column, summaryAggregators));
					syncWithDataViewGroups();
					grid.resetActiveCell();

					if (!$rootScope.$$phase) {
						scope.$digest();
					}
				}

				function onKeyDown(e, args) {
					var dataItem = grid.getDataItem(args.row);

					if (dataItem && dataItem._disabledRow) {
						e.stopImmediatePropagation();
						return;
					}

					var pressedKey = xaKeyHelper.getKey(e, 'keydown');


					//if cell is edit mode, pass the event to the grid to see how it should be handled
					var currentEditor = grid.getEditController() && grid.getEditController().currentEditor();
					if (currentEditor) {
						var editor = grid.getEditController().currentEditor();
						if (editor.handleKeyPress)
							return editor.handleKeyPress(e, args);
					}

					// Si drag and drop en cours on bloque la navigation clavier dans la grille.
					if (isDragAndDropOnProgress) { e.stopImmediatePropagation(); return; }

					if (pressedKey == 32) { // Espace realise l'action de cellule
						if (columns[args.cell] && columns[args.cell].buttons && columns[args.cell].buttons.length == 1 && columns[args.cell].buttons[0].click)
							columns[args.cell].buttons[0].click(grid.getDataItem(args.row));
						else if (columns[0] && columns[0].buttons && columns[0].type == 'checkbox')
							columns[0].buttons[0].click(grid.getDataItem(args.row));
						else if (scope.gridOptions.showBulleAide && columns[1] && columns[1].type == 'checkbox')
							columns[1].buttons[0].click(grid.getDataItem(args.row));
					}


					if (pressedKey == 13) { //enter realise l'action de la ligne
						if (columns[args.cell] && !columns[args.cell].editor)
							defaultAction(grid.getDataItem(args.row));
					}
					else if (pressedKey == 46 && scope.gridOptions.enableDeleteFromKeyboard && !currentEditor) {
							scope.deleteFn();
					}
					else if (e.ctrlKey && pressedKey == 39) //ctrl +  right
					{
						dataView.expandAllGroups();
						scope.gridOptions.selectFirstItem(false);
						e.preventDefault();
						e.stopPropagation();
					}
					else if (e.ctrlKey && pressedKey == 37) { ////ctrl +  left
						dataView.collapseAllGroups();
						setSelectedIndices([0], false);
					}
					else if (grid.getDataItem(args.row) && grid.getDataItem(args.row).hasOwnProperty('__group')) { //left / right -> current group
						if (pressedKey == 39) {
							dataView.expandGroup(grid.getDataItem(args.row).groupingKey);
							e.preventDefault();
							e.stopPropagation();
							return;
						}
						else if (pressedKey == 37) {
							dataView.collapseGroup(grid.getDataItem(args.row).groupingKey);
							e.preventDefault();
							e.stopPropagation();
							return;
						}
					}
				}

				function onDblClick(e, args) {
					var cell = grid.getCellFromEvent(e);
					var dataItem = grid.getDataItem(cell.row);

					if (dataItem && dataItem._disabledRow) {
						e.stopImmediatePropagation();
						return;
					}

					if (columns[cell.cell] && !columns[cell.cell].editor) {
						defaultAction(dataItem);

						if (dataItem.groupingKey) return;

						if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onCellDblClick)) {
							var cellSelector = '.' + e.target.className.split(' ').join('.');
							cellSelector = '.' + scope.gridOptions.gridName + ' ' + cellSelector;

							scope.gridOptions.handlers.onCellDblClick(dataItem, columns[cell.cell], cellSelector, e);
						}
					}
				}

				function defaultAction(dataItem) {
					if (dataItem.groupingKey) {
						//dblclick on group. toggle expand / collapse
						if (dataItem.collapsed == 1) {
							dataView.expandGroup(dataItem.groupingKey);
						} else {
							dataView.collapseGroup(dataItem.groupingKey);
						}

						return;
					} else {
						onDblClickRow(dataItem);
					}
				}

				function onDblClickRow(dataItem) {
					if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onDblClickRow)) {
						scope.gridOptions.handlers.onDblClickRow(dataItem); // TODO: make this callbaks more uniform.
						if (!$rootScope.$$phase)
							scope.$apply();
					}
				}

				function onBeforeClick(e, args) {

					var cell = grid.getCellFromEvent(e);
					var dataItem = grid.getDataItem(cell.row);
					if (dataItem && dataItem._disabledRow) {
						e.stopImmediatePropagation();
						return;
					}

					//edit is active && click on dropdown grid
					if (grid.getEditorLock().isActive() && $(e.target).closest('.dropdown-menu').length > 0) {
						//click happened inside the combo grid.ignore the event
						e.skipGridProcessing = true;

						//raul: stopping processing means ALSO not triggering click. So we trigger our custom click handler instead!
						onClick(e, args);
					}
				}

				function onClickTooltip(itemTooltip, event) {
					if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onCellClick)) {
						scope.gridOptions.handlers.onCellClick(itemTooltip.gridRow, itemTooltip.col, '.' + itemTooltip.cssSelector, event);
					}

					var target = $(event.target);
					while (target && target.length > 0 && target.data('button') == undefined && !target.hasClass(itemTooltip.cssSelector)) {
						target = target.parent();
					}

					if (target && target.data('button') != undefined) {
						var btn = itemTooltip.col.buttons[target.data('button')];
						if (btn && btn.click) {
							var btnSelector = '.' + itemTooltip.cssSelector;
							if (event.target.className != '')
								btnSelector = btnSelector + ' .' + event.target.className.split(' ').join('.');

							btn.click(itemTooltip.gridRow, btnSelector, itemTooltip.col, scope.gridOptions, event.target.className);

							if (!$rootScope.$$phase)
								$rootScope.$digest();
						}
					}
				}

				function onClick(e, args) {
					var gridRow = grid.getDataItem(args.row);
					var col = grid.getColumns()[args.cell];

					if (gridRow instanceof Slick.Group) { //grouping row click
						if (col.groupOptions && col.groupOptions.groupButtons) {
							var $target = $(e.target);
							var trigger = $target.attr('tagName') == 'A' ? $target : $target.closest('a');
							if (trigger.length > 0) {
								var btnIdx = trigger.data('idx');
								col.groupOptions.groupButtons[btnIdx].clickFn();
							}
						}
					}
					else {

						if (col.id == '#BulleAideColumn' && scope.gridOptions.handlers.showTooltip) {
							if (col.colData && col.colData.length > 0 && gridRow) { //coldata holds fields to display!

								// Ne pas ouvrir le tooltip si code est declenché via un click utilisateur
								if (e.originalEvent === undefined)
									return;

								var columnsMapped = xaSlickGridColumnMapper.map(_.map(col.colData, function (item) { return scope.columnsDefinition.findColumnByFieldName(item) }), true);
								var result = [];
								var idx = 0;
								_.each(columnsMapped, function (col) {
									if (col) {
										var value = customDataExtractor(gridRow, col);
										var html = col.formatter ? col.formatter(0, 0, value, col, gridRow, false) : value;
										if (!html) html = '';
										html = html.toString();
										result.push({ html: html, name: col.name, idx: idx, col: col, cssSelector: 'gridTooltip' + idx.toString(), gridRow: gridRow })
										idx++;
									}
								});

								var target = $(e.target);
								if (target.hasClass('bulle-aide')) target = target.parent();

								var cellSelector = '.' + scope.gridOptions.gridName + ' .' + target[0].className.split(' ').join('.');
								scope.gridOptions.handlers.showTooltip(result, cellSelector, onClickTooltip);
							}
							return;
						}


						//is the target expand ?
						var target = $(e.target);
						if (target.hasClass('icon-expand')) target = target.parent(); //click on span

						if (target.data('expand') != undefined) {
							var rowIdx = +target.data('row');
							var cellIdx = +target.data('cell');

							col = grid.getColumns()[cellIdx];

							var menuHTML = '';
							if (col.buttons.length > 0 && col.buttons.length > col.maxGridButtons) {
								menuHTML += '<div class="grid-inner-menu"><ul>';
								for (var idx = 0; idx < col.buttons.length; idx++) {
									if (col.buttons[idx].visibilityFn) {
										var isVis = col.buttons[idx].visibilityFn(gridRow, col);
										if (!isVis) continue;
									}

									menuHTML += '<li><a data-button="' + idx + '" data-row="' + rowIdx + '" data-cell="' + cellIdx + '" class="btn_' + rowIdx + '_' + cellIdx + '_' + idx + ' slickButton" href="javascript:void(0);">';

									var currBtn = col.buttons[idx];
									if (currBtn.filter)
										menuHTML += $filter(currBtn.filter)(value, currBtn.args, gridRow[col.field]);
									else {
										menuHTML += '<img src="' + currBtn.img + '"';
										menuHTML += currBtn.tooltip ? ' title="' + currBtn.tooltip + '"' : '';
										menuHTML += xaDirectiveHelper.getTestIdWithAttribute(currBtn.testId);
										menuHTML += ' />';
									}
									menuHTML += '<span class="btnTitle">' + (currBtn.tooltip || '') + '</span></a></li>';
								}
								menuHTML += '</ul></div>';

								var menu = $(menuHTML);
								if (menu.length > 0) {

									removeButtonMenu();

									$(document.body).append(menu);
									menu.show();
									positioner.positionElementToRef(menu, target, undefined, undefined, undefined, '200px');

									bindDocumentClick();

									menu.find('a').click(function (evt) {
										onClick(evt, { row: rowIdx, cell: cellIdx });
										removeButtonMenu();
									});
								}
							}
							return;
						}

						if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onRowClick)) {
							var cellSelector = '.' + e.target.className.split(' ').join('.');

							//append grid class to make sure of unicity!
							cellSelector = '.' + scope.gridOptions.gridName + ' ' + cellSelector;

							scope.gridOptions.handlers.onRowClick(gridRow, col, cellSelector, e);
						}


						if (scope.gridOptions.handlers && angular.isFunction(scope.gridOptions.handlers.onCellClick)) {
							var cellSelector = '.' + e.target.className.split(' ').join('.');

							//append grid class to make sure of unicity!
							cellSelector = '.' + scope.gridOptions.gridName + ' ' + cellSelector;

							scope.gridOptions.handlers.onCellClick(gridRow, col, cellSelector, e);
						}

						var btnIdx = -1;
						while (target && target.length > 0 && target.data('button') == undefined && !target.hasClass('slickCell')) {
							target = target.parent();
						}

						if (target && target.data('button') != undefined) {
							var btnIdx = target.data('button');

							var btn = col.buttons[btnIdx];
							if (btn && btn.click) {
								var btnSelector = '.' + scope.gridOptions.gridName + ' .' + target.attr('class').split(' ').join('.');

								btn.click(gridRow, btnSelector, col, scope.gridOptions, e.target.className);
								if (!$rootScope.$$phase)
									$rootScope.$digest();
							}
						}

						target = null;
					}
				}

				function removeButtonMenu() {
					var existingMenu = $(document.body).find('> div.grid-inner-menu');
					if (existingMenu) {
						existingMenu.find('a').off('click');
						existingMenu.remove();

						unbindDocumentClick();
				
					}
				}

				var gridContextId = "GRIDSLICK_" + scope.$id;
				

				function bindDocumentClick() {
					setTimeout(function () {
						$document.on('click', dismissClickHandler); //need to attach it later so that clikc doesn't get triggered
						window.addEventListener('scroll', dismissClickHandler, true); // Le recentrage de cellule  fait disparaitre le menu, si on ne repousse pas l'abonnement.

					});
					xaKeyboard.setContext(gridContextId);
					xaKeyboard.bind('esc', dismissClickHandler, gridContextId);
				}

				function unbindDocumentClick() {
				    $document.off('click', dismissClickHandler);
				    xaKeyboard.unbind('esc', gridContextId);
				    xaKeyboard.resetContext(gridContextId);
				    window.removeEventListener('scroll', dismissClickHandler, true);
				}

				function dismissClickHandler(evt) {
					var parents = $(evt.target).parents("div.grid-inner-menu");
					if (parents.length === 0) {
						removeButtonMenu();
					}
				};

				function onRowsChanged(e, args) {
					grid.invalidateRows(args.rows);
					grid.render();
				}

				function onRowCountChanged(e, args) {
					grid.updateRowCount();
					grid.render();
				}

				function syncWithDataViewGroups() {
					dataView.setGrouping(activeGroups);

					scope.groups = [];
					scope.gridOptions.groups = [];
					_.each(activeGroups, function (g) {
						scope.groups.push(g.meta());
						scope.gridOptions.groups.push(g.field);
					});

					syncSelection && syncSelection(true);
				}

				/// Final cleanup from outside.
				cleaners.push(function () {
					if (scope.gridOptions.destroyFn) {
						scope.gridOptions.destroyFn();
						scope.gridOptions.destroyFn = null;
					}
				});

				/// Final cleanup. Is important for this to be executed last.
				cleaners.push(function () {
					if (unwatchCollection) unwatchCollection();
					activeGroups.length = 0;
					if (scope.groups) scope.groups.length = 0;
					scope.groups = null;
					dataView.setGrouping(null);
					dataView.setItems([]);
					grid.destroy();
					groupItemMetaDataProvider = null;
					dataView = null;
					grid = null;
				});

			
				scope.$on('$destroy', function () {

					angular.forEach(cleaners, function (c) {
						c.apply();
					});

					removeButtonMenu();

					scope.gridOptions.refreshItem =
						scope.gridOptions.refreshGridDatasource =
						scope.gridOptions.refreshGrid =
						scope.gridOptions.toggleAll =
						scope.gridOptions.getGridData =
						scope.gridOptions.setSelectedItem =
						scope.gridOptions.setSelectedItems =
						scope.gridOptions.getSelectedItems =
						scope.gridOptions.scrollRowIntoView =
						scope.gridOptions.getData =
						scope.gridOptions.selectFirstItem =
						null;


					scope.columnsDefinition.dispose();

					cleaners.length = 0;
				});

				scope.isHeaderButtonVisible = function (button) {
					if (button.visibilityFn)
						return button.visibilityFn();
					else
						return true;
				}



				var goToCellAndFocus = function (rowInstance, columnField) {
					var idxRow = findItemIndex(rowInstance);
					if (idxRow == -1)
						throw new Error("goToCell - Impossible de trouver la ligne passée en paramètre");
					var idxCol = 0;
					for (var i = 0; i < columns.length; i++) {
						if (columns[i].field == columnField) {
							idxCol = i;
							break;
						}
					}
					grid.gotoCell(idxRow, idxCol, true);
				}


				scope.gridOptions.goToCellAndFocus = goToCellAndFocus;


				/// All this resizing thing has nothing to do with the grid.
				/// It needs to be moved with the specific modal controller / custom directive
				/// if not doable with css only.
				/// Wouldn't a table layout (using <table><tr>etc) fix all these?

				var calculateHeight = function () { };
				if (scope.gridOptions.height == 'fit') {
					var allElems = element;
					//allElems = element.add('.xa-slick-grid', element); //raul: join grid with immediate child to support replace:false scenario

					allElems.addClass('gridContainerFit');

					var isInTab = false; //element.closest('.tab-pane').length > 0;

					if (!isInTab) {
						allElems.css({
							'margin': '0',
							'position': 'relative',
							'width': '100%',
							'float': 'left'
						});
					}

					calculateHeight = function () {
						if (!element) return; //if you close the window fast, this still 

						if (!element.is(":visible")) {
							return; // Don't resize if not visible on screen
						}

						var winContent = null;
						var splitPane = null;
						var gridContainer = null;

						var parent = element;
						while (parent && parent.length) {
							if (parent.hasClass('window-content')) {
								winContent = parent;
								break;
							}
							else if (parent.hasClass('xa-splitter-pane')) {
								splitPane = parent;
								break;
							}
							else if (parent.hasClass('dashboardGridContainer') || parent.hasClass('dashboardWithFilterGridContainer') || parent.hasClass('widgetGridContainer')) {
								gridContainer = parent;
								break;
							}

							parent = parent.parent();
						}

						//test if in window
						var container = null;
						var totalHeight = 0;
						if (splitPane && splitPane.length > 0) {
							totalHeight = splitPane.height();
							container = splitPane;
						}
						else if (winContent) {
							//if is fixed tab? height will be the height of the tab 
							var tab = element.closest('.fitParentWidthHeight.tabContainer > .tab-content');
							if (tab.length > 0) {
								totalHeight = tab.height();
								container = element.closest('.row').parent();
							}
							else {
								totalHeight = winContent.height();
								container = winContent.find('.container');
							}
						}
						else if (gridContainer) { //not in popup
							totalHeight = gridContainer.height();
							container = gridContainer;
						}
						else { //resize according to document!
							totalHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
							container = element.parent();
						}

						var otherHeight = 0;
						container.children().each(function (idx, item) {
							var $item = $(item);
							if (!$item.is(":visible")
								|| $item.hasClass("ignore-grid-calc")
								|| $item.hasClass("gridContainerFit")
								|| $item.find(".gridContainerFit").length > 0) //not visible or is/contains our grid?
								return;
							otherHeight += $item.outerHeight(true); //need to use outerHeight, to take padding and margin into account!
						});

						var gridHeight = totalHeight - otherHeight - scope.heightOffset;


						if (element.closest('.split-panes').not('.horizontal').length > 0) //inside splitter, no min height
							gridHeight = Math.max(gridHeight, 0);
						else gridHeight = Math.max(gridHeight, scope.gridOptions.minheight || 150); //min height of 150

						allElems.height(gridHeight); //have a margin of 10px. if 0, sometimes a scrollbar appears in window

						if (!grid.init())
							grid.resizeCanvas();

						winContent = null;
						container = null;

					}

					scope.gridOptions.resize = function () { calculateHeight(); };

				} else if (scope.gridOptions.height) {
					$(element).height(scope.gridOptions.height);

					calculateHeight = function () {
						if (!element) return;

						if (!element.is(":visible")) return;

						if (!grid.init())
							grid.resizeCanvas();
					}
				}

				// arrivé à calculer au bon moment pour les effec
				// A remplacer, on doit comprendre quand le calculate height est necessaire
				if (!scope.gridOptions.disableCalculateHeightOnLoad)
					setTimeout(function InitialGridDrawing() {
						//initial display
						calculateHeight();

						//inital scroll to 
						if (scope.gridOptions.initalSelectedItem && scope.gridOptions.setSelectedItem)
							scope.gridOptions.setSelectedItem(scope.gridOptions.initalSelectedItem);
					},0)


				// Evite au changement d'onglet de voir les grilles se marcher dessus
				function triggerResizeHeightOnWindowResize() {
					// Dans le dashboard le resize est réalisé manuellement par le composant
					if (element && element.parent().hasClass('widgetGridContainer'))
						return; 
					else
						calculateHeight();
				}

				$win.on('resize', triggerResizeHeightOnWindowResize);

				cleaners.push(function () {
					$win.off('resize', triggerResizeHeightOnWindowResize);
				});

				//scope.gridOptions.resize = function () { }; //add it for all grids, for simplicity, This will always exist!

				if (scope.gridOptions.groupsCollapsedByDefault)
				    dataView.collapseAllGroups();

				scope.gridOptions.resizeFn = calculateHeight; //add it for all grids, for simplicity, This will always exist!


				if (scope.gridOptions.selectFirstItemOnStart === true)
					scope.gridOptions.selectFirstItem(false);

				if (scope.gridOptions.uploadOptions) { //if handler is defined, allow upload
					scope.gridOptions.uploadOptions.dropZoneHeight = 'auto'; //for auto for drop zone!!!
					//    scope.hasUpload = true;
					//    // 
				}
			}
		};
	});


	function _getValueFromStringProperty(value, key) {
		if (key == undefined) return undefined;

		var indice = key.indexOf('.');
		if (value == null)
			return null;
		else if (indice > 0)
			return _getValueFromStringProperty(value[key.substring(0, indice)], key.substring(indice + 1));
		else {
			if (key.substring(key.length - 2) == "()")
				return value[key.substring(0, key.indexOf("("))]();
			else
				return value[key];
		}

	};

	function customDataExtractor(item, columnDef) {
		if (columnDef.fieldFn)
			return columnDef.fieldFn(item, columnDef);
		else
			return _getValueFromStringProperty(item, columnDef.field);
	}

	/*function highlightMetadataProvider(oldMetadataProvider) {
		return function (row) {
			var item = this.getItem(row);
			var ret = (oldMetadataProvider(row) || {});
			if (item) {

				ret.cssClasses = (ret.cssClasses || '');
				if (item.highlighted) {
					ret.cssClasses += ' highlighted';
				}
				if (item.selected) {
					ret.cssClasses += ' selected';
				}
			}

			return ret;
		}
	}*/

})(window.XaNgFrameworkSlickGrid);