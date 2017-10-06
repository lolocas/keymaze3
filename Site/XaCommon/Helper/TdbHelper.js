(function () {
    'use strict';

    angular.module('XaCommon').service('TdbHelper', TdbHelper)

    function TdbHelper(dialogs, UtilsHelper, UserHelper, TdbActionModel,TdbHeaderActionModel, TdbSelectionModel, TdbPrintModel,GridHelper) {

    	
    	this.tdbLoadData = tdbLoadData;
    	this.tdbLoadDataWithValues = tdbLoadDataWithValues;
    	this.hasFiltersActive = hasFiltersActive;

    	this.getCurrentTdbItemKey = getCurrentTdbItemKey;
    	this.getCurrentTdbItem = getCurrentTdbItem;
    	this.getCurrentTdbItems = getCurrentTdbItems;

    	this.applyTdbItemReloadAndFocusFromResultTo = applyTdbItemReloadAndFocusFromResultTo;
    	this.applyCurrentTdbItemReloadAndFocus = applyCurrentTdbItemReloadAndFocus;

    	this.setOnTdbDataLoadedFn = setOnTdbDataLoadedFn;
    	this.setOnTdbRefreshFn = setOnTdbRefreshFn;
    	this.setOnTdbItemRefreshedOrChangedFn = setOnTdbItemRefreshedOrChangedFn;
    	this.setOnSitesSelectionnesChangedFn = setOnSitesSelectionnesChangedFn;
    	this.setOnBeforeTdbLoadDataFn = setOnBeforeTdbLoadDataFn;


    	this.addAction = addAction;
    	this.addSelection = addSelection;
    	this.addPrint = addPrint;
    	this.addActionInHeader = addActionInHeader;

    	this.setAddAction = setAddAction;
    	this.setDeleteAction = setDeleteAction;
    	this.setDefaultActionFn = setDefaultActionFn;

    	this.getCurrentPeriodType = getCurrentPeriodType;
    	this.getCurrentSelectionStatusCode = getCurrentSelectionStatusCode;
    	this.getCurrentFilters = getCurrentFilters;
    	this.hasCurrentFilters = hasCurrentFilters;
    	this.openFilterWindow = openFilterWindow;


    	function getCurrentPeriodType(tdbManager) {
    		return tdbManager.tdbModel.currentPeriod.type;
    	}

    	function getCurrentSelectionStatusCode(tdbManager) {
    		return tdbManager.tdbModel.currentSelection.val;
    	}

    	function getCurrentFilters(tdbManager) {
    		return tdbManager.tdbModel.currentFilters;
    	}

    	function hasCurrentFilters(tdbManager) {
    		return UtilsHelper.objGetKeys(tdbManager.tdbModel.currentFilters).length == 0;
    	}

    	function openFilterWindow(tdbManager) {
    		return tdbManager.applyOpenFilter();
    	}


    	function tdbLoadData(tdbManager) {
    		tdbManager.tdbLoadData();
    	}

    	function tdbLoadDataWithValues(tdbManager, selectionCode, periodType, clearFilters) {
    		tdbManager.tdbLoadDataWithValues(selectionCode, periodType, clearFilters);
    	}
    
    	function hasFiltersActive(tdbManager) {
    		return tdbManager.hasFiltersActive();
    	}

    	function getCurrentTdbItemKey(tdbManager) {
    		return tdbManager.getCurrentTdbItemKey();
    	}

    	function getCurrentTdbItem(tdbManager) {
    		return tdbManager.getCurrentTdbItem();
    	}

    	function getCurrentTdbItems(tdbManager) {
    		return tdbManager.getCurrentTdbItems(tdbManager);
    	}

    	function applyTdbItemReloadAndFocusFromResultTo(tdbManager, resultTo, criteriaKey) {
    	    tdbManager.applyTdbItemReloadAndFocus(resultTo, criteriaKey);
    	}
    	
    	function applyCurrentTdbItemReloadAndFocus(tdbManager) {
    		tdbManager.applyCurrentTdbItemReloadAndFocus();
    	}

    	function setOnTdbDataLoadedFn(tdbManager, fn) {
    	    tdbManager.onTdbDataLoaded = fn;
    	}

    	function setOnTdbRefreshFn(tdbManager, fn) {
    	    tdbManager.onTdbRefresh = fn;
    	}

    	function setOnSitesSelectionnesChangedFn(tdbManager, fn) {
    	    tdbManager.onSitesSelectionnesChanged = fn;
    	}
    	

    	function setOnTdbItemRefreshedOrChangedFn(tdbManager, fn) {
    		tdbManager.onTdbItemRefreshedOrChanged = UtilsHelper.PreventMultiExecution(fn);
    	}

    	function setOnBeforeTdbLoadDataFn(tdbManager, fn) {
    		tdbManager.onBeforeTdbLoadData = fn;
    	}

    	function addAction(tdbManager, code, resourcName, actionFn, visibilityFn, rightKey) {
    		if(!UtilsHelper.isEmpty(rightKey) && !UserHelper.hasRight(rightKey))
    			return;

    		if (!tdbManager.tdbModel.actions) tdbManager.tdbModel.actions = [];

    		var actFn = null
    		if (tdbManager.tdbModel.keepLastActionAsDefault) {
    			actFn = function (code) {
    				if (tdbManager.tdbModel.lastActionCode != code) {
    					tdbManager.tdbModel.lastActionCode = code;
    					tdbManager._updateTdbItemActions();
    				}
    				actionFn(tdbManager.tdbModel.currentTdbItem);
    			}
    		}
			
    		tdbManager.tdbModel.actions.push(new TdbActionModel(resourcName, code, actFn || actionFn, visibilityFn, rightKey));
    	}

    	function addSelection(tdbManager, code,resourceName, rightKey) {
    		if (!tdbManager.tdbModel.selectionList) tdbManager.tdbModel.selectionList = [];
    		tdbManager.tdbModel.selectionList.push(new TdbSelectionModel(code, resourceName, rightKey));
    	}


    	function addActionInHeader(tdbManager, img, tooltip, applyFn, visibilityFn, rightKey) {
    		if (!tdbManager.tdbModel.headerActions) tdbManager.tdbModel.headerActions = [];
    		tdbManager.tdbModel.headerActions.push(new TdbHeaderActionModel(img, UtilsHelper.getLabelIfStartWithTxt(tooltip), applyFn, visibilityFn, rightKey));
    	}

    	function addPrint(tdbManager, code, text, printFn, visibilityFn, rightKey) {
    		if (!tdbManager.tdbModel.prints) tdbManager.tdbModel.prints = [];
    		tdbManager.tdbModel.prints.push(new TdbPrintModel(code, text, printFn, visibilityFn, rightKey));
    	}

    	function setAddAction(tdbManager, actionFn, visibilityFn, rightKey) {
    		if (!UtilsHelper.isEmpty(rightKey) && !UserHelper.hasRight(rightKey))
    			return;

    		tdbManager.gridOptions.gridButtons.push({ imgUrl: 'XaCommon/Img/add.png', click: actionFn, resourceKey:'TXT_AJOUTER', visibilityFn: visibilityFn });
    	}

    	function setDeleteAction(tdbManager, actionFn, visibilityFn, opts) {
    		GridHelper.addButtonDeleteInHeader(tdbManager.gridOptions, actionFn, visibilityFn, opts);
    	}


    	function setDefaultActionFn(tdbManager, actionFn) {
    		tdbManager.tdbModel.defaultActionFonc = actionFn;
    	}

   
    };

})();