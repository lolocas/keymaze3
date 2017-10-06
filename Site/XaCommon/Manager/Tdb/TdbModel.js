(function () {
    'use strict';

    angular.module('XaCommon').factory('TdbCriteriaItemModel', function () {
        var TdbCriteriaItemModel = function (data) {
            this.key = data.key;
            this.tdbFilter = data.tdbFilter;
            this.kind = data.kind;
        };
        return TdbCriteriaItemModel;
    });

    angular.module('XaCommon').factory('TdbStoredFilterModel', function (HELPER) {

        var TdbStoredFilterModel = function (data) {
            this.text = data ? data.text : '';
            this.infoFilter = data ? data.infoFilter : '';
            this.selection = data ? data.selection : '';
            this.period = data ? data.period : '';

        };

        return TdbStoredFilterModel;
    });

    angular.module('XaCommon').factory('TdbSelectionModel', function (UtilsHelper) {

    	var TdbSelectionModel = function (paramCode, paramResourceKey, rightKey) {

    		this.resourceKey = paramResourceKey;
    		this.text = UtilsHelper.startWith(paramResourceKey, "TXT_") ? UtilsHelper.getLabel(paramResourceKey) : paramResourceKey;
    		this.val = paramCode;
    		this.rightKey = rightKey;
    		this.style = (paramCode.toUpperCase() != 'TOUS' ? 'orange' : '');

    	};

    	return TdbSelectionModel;
    });


    angular.module('XaCommon').factory('TdbHeaderActionModel', function (UtilsHelper) {

    	var TdbHeaderActionModel = function (image, tooltip, applyFn, visibilityFn, rightKey) {
    		this.image = image;
    		this.tooltip = UtilsHelper.startWith(tooltip, "TXT_") ? UtilsHelper.getLabel(tooltip) : tooltip;
    		this.applyFn = applyFn;
    		this.visibilityFn = visibilityFn || function isHeaderActionVisible() { return true };
    		this.rightKey = rightKey;
    	};

    	return TdbHeaderActionModel;
    });

    angular.module('XaCommon').factory('TdbPrintModel', function (UtilsHelper) {

    	var TdbPrintModel = function (printCode, paramText, printFn, visibilityFn, rightKey) {
    		this.text = UtilsHelper.startWith(paramText, "TXT_") ? UtilsHelper.getLabel(paramText) : paramText;
    		this.code = printCode;
    		this.visibilityFn = visibilityFn;
    		this.printFn = printFn;
    		this.rightKey = rightKey;
    	};

    	return TdbPrintModel;
    });

    angular.module('XaCommon').factory('TdbActionModel', function (UtilsHelper) {

    	var TdbActionModel = function (paramName, paramCode, paramAction, paramIsEnabled, rightKey) {

        	this.name = paramName;
            this.code = paramCode;

            this.action = paramAction;
            this.isEnabled = paramIsEnabled ? paramIsEnabled : function () { return true };
            this.rightKey = rightKey;

        };

        return TdbActionModel;
    });


    angular.module('XaCommon').factory('TdbItemModel', function () {

        var TdbItemModel = function (attributes, values) {
            for (var j = 0; j < attributes.length; j++) {
                this[attributes[j]] = values[j];
            }
        };


        TdbItemModel.prototype = {
            getValeur: function (fieldKey) { 
                if (this[fieldKey] == undefined)
                    throw Exception("tdbItem.getValeur: Le tdbItem ne contient pas d'attribut avec la clé " + fieldKey);
                else
                    return this[fieldKey];
            },

            setValeur: function (fieldKey, valeur) {
                if (this[fieldKey] == undefined)
                    throw Exception("tdbItem.setValeur: Le tdbItem ne contient pas d'attribut avec la clé " + fieldKey);
                else
                    this[fieldKey] = valeur;
            }
        };

        return TdbItemModel;
    });

    angular.module('XaCommon').factory('TdbModel', function () {

        var TdbModel = function (type, key, scopeid, criteriaKey) {
      
            this.pushSupported = false;
            this.tdbType = type;
            this.tdbKey = key;
            this.criteriaKey = criteriaKey;
            this.columnDefs = [];
            this.criteriaAvailables = {};
            this.debugMode = false;
            this.groupInfo = [];
            this.sortInfo = [];
            this.quickFilters = [];
            this.selectionList = [];
            this.actions = [];
            this.headerActions = [];
            this.prints = [];
            this.addAction = undefined;
            this.periodMode = 'past'; // past | none | both | future
            this.filterOpenerName = '';
            this.imgFilterUrl = '';
            this.isOnlyGetVisibleColumns = false;
            this.keepLastActionAsDefault = false;
            this.canLoadToutesDatesOnStart = false;

            this.defaultActionFonc = function (tdbItem, actions) { throw new ("La fonction d'action par défaut du tdb n'a pas été implémenté."); };
            this.enableMultiSelection = false;
            this.currentTdbItem = null;
            this.currentTdbItems = [];

            this.currentSelection = null;
            this.currentPeriod = { from: new Date(), to: new Date() };
            this.currentTdbItemActions = [];
            this.currentFilters = {};
            this.lastActionCode = null;
            this.currentRequestedColumns = null;
            this.quickSearchFields = null;
			
            this.status = 'INIT'; // INIT, LOADING-DATA, READY, DESTROY
			
            this.autoRefreshIsActive = false;
            this.sitesSupported = false;
            
			// Parametre permettant d'éviter le toute date sans filtrage.
            this.disableAllDateIfNoFilter = false;

			// Variable de en cours ne pas manipuler
			this.autoRefreshIsPlay = false;
            this.autoRefreshDelay = 0;
            this.autoRefreshPeriod = 60;
            this.autoRefreshInterval = null;
            

        	/* this.cleanUp = function () {
                //console.log('TdbModel.cleanUp()');
                // if (this.columnDefs) this.columnDefs.length = 0; //http://stackoverflow.com/questions/1232040/empty-an-array-in-javascript
                if (this.criteriaAvailables) this.criteriaAvailables = null;
                if (this.quickFilters) this.quickFilters.length = 0;
                if (this.actions) this.actions.length = 0;
                if (this.selectionList) this.selectionList.length = 0;
                if (this.currentSelection) this.currentSelection = null;
                
            }*/


        };

        return TdbModel;
    });

})();