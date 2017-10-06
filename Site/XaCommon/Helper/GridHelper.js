(function () {
	'use strict';

	angular.module('XaCommon').service('GridHelper', GridHelper)

	function GridHelper($timeout, $q, xaEventing, UtilsHelper, ArrayHelper, DialogHelper, ApiHelper, UserHelper) {

	
		this.setStyleRowFromFunction = setStyleRowFromFunction;
		this.setStyleCellFromFunction = setStyleCellFromFunction;

		this.setCellEditorWillChangeFunction = setCellEditorWillChangeFunction;
		this.setCellEditorDidChangeFunction = setCellEditorDidChangeFunction;
		this.setCellEditorBeforeEditFunction = setCellEditorBeforeEditFunction;
		this.setCellEditorWithSuggestion = setCellEditorWithSuggestion;
		this.setCellEditorWithCombogrid = setCellEditorWithCombogrid;
		this.setGridLayoutStorage = setGridLayoutStorage;

		this.addButtonActionInColumn = addButtonActionInColumn;
		this.addButtonActionInHeader = addButtonActionInHeader;
		this.addButtonDeleteInHeader = addButtonDeleteInHeader;
		this.addFilterActionInColumn = addFilterActionInColumn;
		this.addTextClickActionInColumn = addTextClickActionInColumn;
		this.addFixedTextClickActionInColumn = addFixedTextClickActionInColumn;

		this.setColumnAction = setColumnAction;
		this.setTitle = setTitle;
		this.setDescription = setDescription;
		this.setFooter = setFooter;
		this.setRowSelectedAction = setRowSelectedAction;
		this.setDblClickAction = setDblClickAction;
		this.setDragRowAction = setDragRowAction;
		
		this.setCellClickAction = setCellClickAction;
		this.setCellDblClickAction = setCellDblClickAction;
		this.setRowMoveAction = setRowMoveAction;

		this.setSelectedItemsFromKeys = setSelectedItemsFromKeys;
		this.setSelectedItemFromKey = setSelectedItemFromKey;
		this.setSelectedFirstItem = setSelectedFirstItem;
		this.setSelectedItems = setSelectedItems;
		this.setSelectedItem = setSelectedItem;
		this.resetSelectedItem = resetSelectedItem;

		this.getSelectedItems = getSelectedItems;
		this.getSelectedItem = getSelectedItem;

		this.goToCellAndFocus = goToCellAndFocus;
		this.refreshGridDisplay = refreshGridDisplay;
		this.refreshRowDisplay = refreshRowDisplay;
		this.refreshCellDisplay = refreshCellDisplay;
		this.refreshGridWithColumns = refreshGridWithColumns;
		this.refreshGridExistingColumns = refreshGridExistingColumns;
		this.refreshGridDisplayFromServerAndResultTo = refreshGridDisplayFromServerAndResultTo;
		this.refreshGridDisplayFromServer = refreshGridDisplayFromServer;
		this.setDragRowActionOnPlanning = setDragRowActionOnPlanning;
		this.setUploadDragFromDesktopAction = setUploadDragFromDesktopAction;

		this.getSortByInfo = getSortByInfo;
		this.getGroupByInfo = getGroupByInfo;

		this.applyUpdateFromResultOnCollection = applyUpdateFromResultOnCollection;
		this.applyEditActiveCell = applyEditActiveCell;

		function applyEditActiveCell(gridOptions) {
			gridOptions.editActiveCell();
		}

		function setGridLayoutStorage(gridOptions, getPreferenceFn, savePreferenceFn) {
			if (UtilsHelper.isUndefined(gridOptions.handlers) && gridOptions.showColumnOptions != true)
				throw new Error("setGridLayoutStorage: Impossible d'associer methodes de chargement et de sauvegarde des preferences.");

			gridOptions.standAloneMode = true;
			gridOptions.handlers.getUserPreferences = getPreferenceFn;
			gridOptions.handlers.customSetUserPreferences = savePreferenceFn;
		}

		function setStyleRowFromFunction(grid, func) {
			if (UtilsHelper.isUndefined(grid.handlers))
				throw new Error("setStyleRowFromFunction: Impossible d'associer le style sur la grille passé en parametre, handlers indéfini");

			grid.handlers.onGetRowCSS = func;
		}

		function setStyleCellFromFunction(grid, func) {
			if (UtilsHelper.isUndefined(grid.handlers))
				throw new Error("setStyleRowFromFunction: Impossible d'associer le style sur la grille passé en parametre, handlers indéfini");

			grid.handlers.onGetCellCSS = func;
		}

		function setCellEditorWillChangeFunction(grid, func) {
			if (UtilsHelper.isUndefined(grid.handlers))
				throw new Error("setCellWillChangeFunction: Impossible d'associer setCellWillChangeFunction sur la grille passé en parametre, handlers indéfini");

			grid.handlers.onCellChanging = func;
		}

		function setCellEditorDidChangeFunction(grid, func) {
			if (UtilsHelper.isUndefined(grid.handlers))
				throw new Error("setCellWillChangeFunction: Impossible d'associer setCellDidChangeFunction sur la grille passé en parametre, handlers indéfini");

			grid.handlers.onCellChange = func;
		}

		function setCellEditorBeforeEditFunction(grid, func) {
			if (UtilsHelper.isUndefined(grid.handlers))
				throw new Error("setCellEditorBeforeEditFunction: Impossible d'associer setCellEditorBeforeEditFunction sur la grille passé en parametre, handlers indéfini");

			grid.handlers.onBeforeEditCell = func;
		}

		function setCellEditorWithSuggestion(grid, columnName, datasourceFn) {
			var value = ArrayHelper.findFirstFromProperty(grid.columnDefs.columns, 'field', columnName);
			if (UtilsHelper.isUndefined(value))
				throw new Error("setCellEditorWithSuggestion => Impossible d'associer une action sur une colonne non déclarée : " + columnName);

			value.editorSettings = { type: 'combobox', allowOther: true, source: datasourceFn }; //{ type: 'suggestion', source: datasourceFn };

		}

		function setCellEditorWithCombogrid(grid, columnName, valueCol, displayCol, datasourceFn, opts) {
			var value = ArrayHelper.findFirstFromProperty(grid.columnDefs.columns, 'field', columnName);
			if (UtilsHelper.isUndefined(value))
				throw new Error("setCellEditorWithComboGrid => Impossible d'associer une action sur une colonne non déclarée : " + columnName);

			var arrayCols = [];
			if (opts && opts.cols) {
				arrayCols = opts.cols;
			}
			else {
				arrayCols = [{ field: valueCol, displayName: UtilsHelper.getLabel('TXT_CODE'), width: '50px' },
                                 { field: displayCol, displayName: UtilsHelper.getLabel('TXT_LIBELLE') }];
			}

			value.editorSettings = { type: 'combobox', displayCol: displayCol, valueCol: valueCol, source: datasourceFn, columnsSource: arrayCols };
			if (opts && opts.width)
				value.editorSettings.width = opts.width;

			if (opts && opts.multiple)
				value.editorSettings.multiple = opts.multiple;

			if (opts && opts.separator)
				value.editorSettings.separator = opts.separator;

			if (opts && opts.displayValueFn)
				value.editorSettings.displayValueFn = opts.displayValueFn;

			if (opts && opts.autoOpenCombo)
				value.editorSettings.autoOpenCombo = opts.autoOpenCombo;
			
			if (opts && opts.navigateNextOnClickResult)
				value.editorSettings.navigateNextOnClickResult = opts.navigateNextOnClickResult;
			

			value.cellFilter = 'XaFilterValeurFromList';
			value.typeArg = { dataSource: datasourceFn, displayCol: displayCol, valueCol: valueCol, multiple: value.editorSettings.multiple, displayValueFn: value.editorSettings.displayValueFn }

		}

		function refreshGridWithColumns(gridOptions, columns, sortBy, groupBy) {
			gridOptions.refreshGridWithColumns(columns, sortBy, groupBy);
		}

		function refreshGridExistingColumns(gridOptions, columns) {
			gridOptions.refreshGridExistingColumns(columns);
		}

		function refreshGridDisplay(gridOptions, forceResizeCanvas, ignoreFocus) {
			gridOptions.refreshGridDatasource(ignoreFocus);
			if (forceResizeCanvas == true) {
				$timeout(function () {
					gridOptions.resizeFn();
				}, 0, false);
			}
		}



		function refreshGridDisplayFromServer(gridOptions, controllerName, serviceName, serviceParam) {
			return ApiHelper.callApiApplication(controllerName, serviceName, serviceParam).then(function refreshGrid(result) {
				var collection = gridOptions.data();
				collection.length = 0;
				collection.push.apply(collection, result);
				refreshGridDisplay(gridOptions);
			});
		}

		function refreshGridDisplayFromServerAndResultTo(gridOptions, resultTo, controllerName, serviceName, serviceParam) {

			if (!resultTo.success)
				return UtilsHelper.emptyPromise(resultTo);

			if (resultTo.itemDeleteId.length > 0) {
				ArrayHelper.removeItemsFromProperty(gridOptions.data(), resultTo.itemDeleteId, gridOptions.uniqueKey);
				if (resultTo.itemId.length == 0) {
					refreshGridDisplay(gridOptions);
					setSelectedFirstItem(gridOptions);
					return UtilsHelper.emptyPromise(resultTo);
				}
			}

			return ApiHelper.callApiApplication(controllerName, serviceName, serviceParam).then(function refreshGrid(result) {
				var collection = gridOptions.data();
				collection.length = 0;
				collection.push.apply(collection, result);
				refreshGridDisplay(gridOptions);
				setSelectedItemFromKey(gridOptions, resultTo.itemId[0]);
				return resultTo
			});
		}


		function refreshRowDisplay(gridOptions, itemInTdb, ignoreFocus) {
			gridOptions.refreshItem(itemInTdb, ignoreFocus ? ignoreFocus : false);
		}

		function refreshCellDisplay(gridOptions, itemInTdb, columnName) {
			gridOptions.refreshCell(itemInTdb, columnName);
		}


		function setSelectedFirstItem(gridOptions, ignoreFocus) {
			return gridOptions.selectFirstItem(ignoreFocus ? ignoreFocus : false);
		}

		function setSelectedItem(gridOptions, itemInTdb, ignoreFocus) {
			gridOptions.setSelectedItem(itemInTdb, ignoreFocus ? ignoreFocus : false);
		}

		function resetSelectedItem(gridOptions, ignoreFocus) {
			gridOptions.resetSelectedItem(ignoreFocus ? ignoreFocus : false);
		}
		
		function setSelectedItems(gridOptions, itemsInTdb) {
			gridOptions.setSelectedItems(itemsInTdb);
		}

		function getSelectedItems(gridOptions, keepGroups) {
			var result = gridOptions.getSelectedItems();
			if (keepGroups == true)
				return ArrayHelper.findFromFunction(result, function (item) { return !item.hasOwnProperty('__group') })
			else
				return result;

		}

		function getSelectedItem(gridOptions, keepGroups) {
			var result = getSelectedItems(gridOptions, keepGroups);
			if (result && result.length == 1)
				return result[0];
			else
				return null;
		}

		function setSelectedItemFromKey(gridOptions, id) {
			var datasource = gridOptions.getData();
			var item = ArrayHelper.findFirstFromProperty(datasource, gridOptions.uniqueKey, id);

			if (item)
				setSelectedItem(gridOptions, item);

		}

		function setSelectedItemsFromKeys(gridOptions, keys) {
			var datasource = gridOptions.getData();
			var result = [];
			ArrayHelper.forEach(keys, function (id) {
				var item = ArrayHelper.findFirstFromProperty(datasource, gridOptions.uniqueKey, id);
				if (item != null)
					result.push(item);
			});

			if (result.length > 0)
				setSelectedItems(gridOptions, result);

		}


		function setTitle(grid, titleFunc) {
			grid.title = titleFunc;
		}

		function setDescription(grid, descFunc) {
			grid.description = descFunc;
		}

		function setFooter(grid, footerFunc) {
			grid.footer = footerFunc;
		}


		function setColumnAction(grid, columnName, func, canFunc) {
			var value = ArrayHelper.findFirstFromProperty(grid.columnDefs.columns, 'field', columnName);
			if (UtilsHelper.isUndefined(value))
				throw new Error("Impossible d'associer une action sur une colonne non déclarée : " + columnName);

			value.setClickFunction(function applySetColumnAction() {
				canFunc = canFunc || angular.noop;
				if (canFunc.apply(this, arguments) !== false)
					func.apply(this, arguments)
			});
					
		}

		function setRowSelectedAction(grid, func) {
			if (UtilsHelper.isUndefined(grid.handlers))
				throw new Error("setRowSelectedAction: Impossible d'associer une action sur la grille passé en parametre, handlers indéfini");

			grid.handlers.onSelectionChange = func;
		}

		function setDblClickAction(grid, func) {
			if (UtilsHelper.isUndefined(grid.handlers))
				throw new Error("setGridClickActiond: Impossible d'associer une action sur la grille passé en parametre, handlers indéfini");


			/* TODO: A decommenter dès que analysé avec RAUL
            var userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.indexOf('touch') > 0 || userAgent.indexOf('android') > 0) {
                grid.columnDefs.push({ field: 'dblClick', displayName: '', force:true, width:'40px'});
                addButtonActionInColumn(grid, 'dblClick', 'XaCommon/Img/doubleclic.png','', func);
            } */

			grid.handlers.onDblClickRow = func;
		}


		function setCellClickAction(grid, func) {
			if (UtilsHelper.isUndefined(grid.handlers))
				throw new Error("setCellClickAction: Impossible d'associer une action sur la grille passé en parametre, handlers indéfini");

			grid.handlers.onCellClick = func;
		}

		function setCellDblClickAction(grid, func) {
			if (UtilsHelper.isUndefined(grid.handlers))
				throw new Error("setCellClickAction: Impossible d'associer une action sur la grille passé en parametre, handlers indéfini");

			grid.handlers.onCellDblClick = func;
		}

		//TODO: renommer en dataordered changed
		function setRowMoveAction(grid, func) {
		    if (UtilsHelper.isUndefined(grid.handlers))
		        throw new Error("setRowMoveAction: Impossible d'associer une action sur la grille passé en parametre, handlers indéfini");

		    grid.handlers.onDataOrderChanged = func;
		}

		

		function setDragRowActionOnPlanning(grid, funcLabel) {
			grid.allowRowDragging = true;

			if (!grid.dropTargetList)
				grid.dropTargetList = [];

			grid.dropTargetList.push('.planning-column-drop');

			grid.handlers.onRowDragHtml = function getLabelForPlanning(rows) {
				var indicatorMarkup =
				$("<div>").addClass("xa-drag-proxy planning-external-drag-indicator")
					.append($("<div>").text(funcLabel(rows)))
					.append($("<div>").addClass("planning-invalid-text-status"))
					.append($("<div>").addClass("drag-drop-indicator"));

				return {
				    indicatorMarkup: indicatorMarkup,
				    proxyWidthOffset: -15,
				    proxyHeightOffset: -20
				};
			}



		}


		function addButtonActionInHeader(grid, image, resourceKey, func, visibilityFn, rightKey) {
			if (!UtilsHelper.isEmpty(rightKey) && !UserHelper.hasRight(rightKey))
				return;

			// TODO METTRE TOOLTIP
			grid.gridButtons.push({ imgUrl: image, click: func, resourceKey: resourceKey, visibilityFn: visibilityFn });
		}

		function getSortByInfo(grid) {
			return grid.sortInfo;
		}

		function getGroupByInfo(grid) {
			return grid.groups;
		}

		function _buildGridSelectionSummaryLabel(rows, grid) {
			var result = '';
			var labelColumn = null
			var labelFn = null;

			if (UtilsHelper.isFunction(grid.rowSummaryLabel))
				labelFn = grid.rowSummaryLabel;
			else if (!UtilsHelper.isEmpty(grid.rowSummaryLabel))
				labelColumn = grid.rowSummaryLabel;
			else
				labelColumn = grid.uniqueKey;


			ArrayHelper.forEach(rows, function (row, index) {
				if (index > 10)
					return;

				if (index == 10) {
					result += ' (' + (rows.length - 10).toString() + ')';
					return;
				}

				if (index > 0)
					result += ', ';

				result += labelFn ? labelFn(row) : row[labelColumn];
			});
			return result;
		}


		function setDragRowAction(grid, dropTargetArray, toDeleteParam, funcDrop, opts) {
			if (grid.handlers.onRowDragged != null)
				throw new Error("setDragRowAction - Drag and drop déjà utilisé, si vous utiliser la méthode de suppression de la grille merci d'appeller cette méthode avant.")

			grid.allowRowDragging = true;
			grid.dropTargetList = dropTargetArray;
			grid.handlers.onRowDragHtml = opts && opts.funcLabel ? opts.funcLabel : _buildGridSelectionSummaryLabel;
			grid.handlers.onRowDragged = funcDrop;
		}

		function setUploadDragFromDesktopAction(grid, func, allowExtensions, isMultiple) {

			if (UtilsHelper.isUndefined(grid.handlers))
				throw new Error("setDragFromDesktopAction: Impossible d'associer une action sur la grille passé en parametre, handlers indéfini");

			grid.uploadOptions = {};
			grid.uploadOptions.allowExtensions = allowExtensions;
			grid.uploadOptions.isMultiple = isMultiple;
			grid.uploadOptions.handlers = {};
			grid.uploadOptions.handlers.onSuccess = func;
		}

		function addButtonDeleteInHeader(grid, func, visibilityFn, opts) {
		    if (opts && opts.rightKey && !UserHelper.hasRight(opts.rightKey))
		        return;

			var initialFunction = grid.handlers.onRowDragged;

			var gridDeleteFunction = function gridDeleteFunction(rows, target) {
				if (target != '.delete' + grid.gridName) {
					if (initialFunction) {
						initialFunction(target, rows);
					}
					return;
				}

				var rows = grid.getSelectedItems();
				if (rows.length == 0)
					return;

				if (visibilityFn && visibilityFn(rows) === false)
					return;

				if (opts && opts.disableNativeMessage) {
					func(rows);
					return;
				}

				var confirmationMessage = _buildGridSelectionSummaryLabel(rows, grid)
				confirmationMessage = UtilsHelper.getLabelFormat('TXT_SUPPRESSION_CONFIRMATION_ADVANCED', confirmationMessage);

				DialogHelper.showConfirmMessagePromise('TXT_SUPPRESSION', confirmationMessage).then(function (result) {
					if (result == true)
						func(rows);
				});
			}

			grid.handlers.onRowDragHtml = grid.handlers.onRowDragHtml || _buildGridSelectionSummaryLabel;
			grid.handlers.onRowDragged = gridDeleteFunction;

			grid.handlers.deleteFn = gridDeleteFunction;
			grid.handlers.deleteVisibilityFn = visibilityFn;

			//grid.gridButtons.push({ imgUrl: 'XaCommon/Img/TrashCan.png', click: gridDeleteFunction, tooltip: UtilsHelper.getLabel('TXT_SUPPRIMER'), /* visibilityFn: visibilityFn,*/ cssClass: cssIdentifier });
		}

		function addButtonActionInColumn(grid, columnName, image, resourceKey, clickFn, visibilityFn, rightKey) {
			if (!UtilsHelper.isEmpty(rightKey) && !UserHelper.hasRight(rightKey))
				return;

			var imageIcon = (UtilsHelper.isEmptyOrWhitespace(image) ? 'XaCommon/Img/action_default.png' : image);

			var tooltip = UtilsHelper.isEmpty(resourceKey) ? undefined : UtilsHelper.getLabel(resourceKey);
			resourceKey = resourceKey ? resourceKey : '';
			var value = ArrayHelper.findFirstFromProperty(grid.columnDefs.columns, 'field', columnName);
			if (UtilsHelper.isUndefined(value))
				throw new Error("Impossible d'associer une action sur une colonne non déclaré : " + columnName);

			if (UtilsHelper.isUndefined(value.buttons))
				value.buttons = [];

			value.buttons.push({ img: imageIcon, click: clickFn, visibilityFn: visibilityFn, tooltip: tooltip, testId: resourceKey.replace('TXT_', '') });

			// Désactivation du sort et du groupe sur les colonnes actions.
			value.sortable = false;
			value.groupable = false;

		}

		function addFilterActionInColumn(grid, columnName, cellFilter, clickFn, rightKey) {
		    if (!UtilsHelper.isEmpty(rightKey) && !UserHelper.hasRight(rightKey))
		        return;
			var value = ArrayHelper.findFirstFromProperty(grid.columnDefs.columns, 'field', columnName);
			if (UtilsHelper.isUndefined(value))
				throw new Error("Impossible d'associer une action sur une colonne non déclaré : " + columnName);

			value.cellFilter = cellFilter;
			value.setClickFunction(clickFn);
		}

		function goToCellAndFocus(grid, row, columnName) {
			grid.goToCellAndFocus(row, columnName);
		}

		function addTextClickActionInColumn(grid, columnName, clickFn) {
			var value = ArrayHelper.findFirstFromProperty(grid.columnDefs.columns, 'field', columnName);
			if (UtilsHelper.isUndefined(value))
				throw new Error("Impossible d'associer une action sur une colonne non déclaré : " + columnName);

			if (UtilsHelper.isEmpty(value.cellFilter))
				value.cellFilter = 'XaFilterTextToLink';

			value.setClickFunction(clickFn);
		}

		function addFixedTextClickActionInColumn(grid, columnName, resourceKey, clickFn) {
			var value = ArrayHelper.findFirstFromProperty(grid.columnDefs.columns, 'field', columnName);
			if (UtilsHelper.isUndefined(value))
				throw new Error("Impossible d'associer une action sur une colonne non déclaré : " + columnName);

			value.cellFilter = 'XaFilterFixedTextToLink';
			value.typeArg = resourceKey;

			value.setClickFunction(clickFn);
		}

		function applyUpdateFromResultOnCollection(gridOptions,listeItems, itemDeleteIds, isRowInDataSourceFn, fromPush) {
			var datasource = gridOptions.data();
			var uniqueKey = gridOptions.uniqueKey;
			ArrayHelper.forEach(listeItems, function (newItem) {
				var existingItem = ArrayHelper.findFirstFromProperty(datasource, uniqueKey, newItem[uniqueKey]);
				var isRowWillBeDisplayed = isRowInDataSourceFn(newItem);
				if (existingItem != null && isRowWillBeDisplayed) {
					// Si donnée doit être affichée ou masqué
					// Si la donnée a été desactivé dans le passé on la reactive
					if (existingItem._disabledRow) existingItem._disabledRow = null;
					ArrayHelper.updateItemWithSameKey(datasource, newItem, uniqueKey);
					gridOptions.refreshItem(existingItem,fromPush);

				}
				else if (existingItem == null && isRowWillBeDisplayed) {
					ArrayHelper.addItemIfNotExist(datasource, newItem, uniqueKey);
					gridOptions.refreshGridDatasource(fromPush);

				}
				else if (existingItem != null && !isRowWillBeDisplayed) {
					deleteItemFromCollection(newItem[uniqueKey], fromPush);
				}

			});

			ArrayHelper.forEach(itemDeleteIds, function (deleteId) {
				deleteItemFromCollection(deleteId, fromPush);
			});

			function deleteItemFromCollection(itemDeleteId, fromPush) {
				var existingItem = ArrayHelper.findFirstFromProperty(datasource, uniqueKey, itemDeleteId);
				if (existingItem == null)
					return;

				if (fromPush) {
					existingItem._disabledRow = true;
					gridOptions.refreshItem(existingItem, true);
				}
				else {
					ArrayHelper.removeItemFromProperty(datasource, uniqueKey, itemDeleteId);
					gridOptions.refreshGridDatasource();
				}
			}

		}





	}

})();