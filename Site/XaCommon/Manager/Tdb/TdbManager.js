(function () {
	'use strict';

	angular.module('XaCommon').factory('TdbManager', function (HELPER, ProfilerService, TdbModel, TdbItemModel, TdbManagerBase, GridConfigModel,QuickFilterConfigModel,  ResultTo) {

		function TdbManager(tdbModel) {

			angular.extend(this, new TdbManagerBase(this));

			var ctx = this;

			this.tdbModel = tdbModel;

			this.datasource = [];

			this.gridOptions = this.tdbModel ? this._getDataGridDefaultOptions(this) : null;
            
			this.init = init;

			this.exit = exit;

			this.loadSplitterPosition = loadSplitterPosition;
			this.saveSplitterPosition = saveSplitterPosition;

			this.tdbLoadData = tdbLoadData;
			this.applyRefresh = applyRefresh;
			this.tdbLoadDataWithValues = tdbLoadDataWithValues;
			this.hasFiltersActive = hasFiltersActive;
			this.clearFilter = clearFilter;
			this.hasPrintAvailable = hasPrintAvailable;

			this.getCurrentTdbItemKey = getCurrentTdbItemKey;

			this.getCurrentTdbItem = getCurrentTdbItem;
			this.getCurrentTdbItems = getCurrentTdbItems;

			this.applyOpenFilter = applyOpenFilter;

			this.applySelectionChange = applySelectionChange;

			this.applyQuickFilterChange = applyQuickFilterChange;

			this.applyQuickFilterFiltering = applyQuickFilterFiltering;

			//this.applyQuickFilterDelete = applyQuickFilterDelete;

			this.applyPeriodChange = applyPeriodChange;

			this.applyFilterChange = applyFilterChange;
			this.applyFilterChangeFromResultTo = applyFilterChangeFromResultTo;

			this.applyOpenSitesSelectionnes = applyOpenSitesSelectionnes;

			this.applyTdbItemChange = applyTdbItemChange;

			this.applyTdbItemReloadAndFocus = applyTdbItemReloadAndFocus;

			this.applyCurrentTdbItemReloadAndFocus = applyCurrentTdbItemReloadAndFocus;

			this.prepareCriteriaListForServer = prepareCriteriaListForServer;

			this.onTdbDataLoaded = onTdbDataLoaded;

			this.onTdbItemChanged = onTdbItemChanged;

			this.onTdbItemRefreshedOrChanged = onTdbItemRefreshedOrChanged;

			this.onBeforeTdbLoadData = undefined;

			this.onTdbChangedFromResultTo = undefined;

			this.onTdbRefresh = undefined;

			this.onSitesSelectionnesChanged = undefined;
			

			this.applyShowFormPrintTdb = applyShowFormPrintTdb;



			function loadSplitterPosition(forceDefault) {
				if (forceDefault)
					return '50%'
				else
					return HELPER.User.getPreference("TDB-SPLITTER", ctx.tdbModel.preferenceKey, '50%');
			}

			function saveSplitterPosition(value) {
			    HELPER.User.setPreference("TDB-SPLITTER", ctx.tdbModel.preferenceKey, value);
			}

			function init(initOpts) {
				// Passage de valeur via la methode init pour utilisation des tdbs depuis les dashboard statistique
			    if (initOpts && initOpts.currentSelection) this.tdbModel.currentSelection = initOpts.currentSelection;
			    if (initOpts && initOpts.currentFilters) this.tdbModel.currentFilters = initOpts.currentFilters;
			    if (initOpts && initOpts.currentPeriod) this.tdbModel.currentPeriod = initOpts.currentPeriod;
			    if (initOpts && initOpts.fixedGridPresentation) {
					// Dans le cadre d'une presentation fixed de tdb, on redefini la taille de la grille.
			    	this.gridOptions.fixedGridPresentation = initOpts.fixedGridPresentation;
			    	HELPER.Grid.refreshGridDisplay(this.gridOptions,true);
			    }
			    if (initOpts && initOpts.disableLoadAndSaveLastTdb) this.tdbModel.disableLoadAndSaveLastTdb = initOpts.disableLoadAndSaveLastTdb;
		
                // Initialisation de la séléction courante
				if (!this.tdbModel.currentSelection)
					this.tdbModel.currentSelection = this.tdbModel.selectionList[0];

                // Initialisation des filtres par defaut, suppression des clés inutiles
				if (this.tdbModel.currentFilters)
					this.tdbModel.currentFilters = this._clearEmptyFilterParameters(this.tdbModel.currentFilters);

				// Initialisation des filtres par defaut, suppression des clés inutiles
				if (!this.tdbModel.preferenceKey)
					this.tdbModel.preferenceKey = this.tdbModel.tdbType;

				// Sites selectionnes
				if (this.tdbModel.sitesSupported)
					this.tdbModel.sitesSelectionnes = HELPER.User.getPreference('TDB_SITES',  this.tdbModel.preferenceKey, HELPER.User.getUser().identification.codesSitesAutorises); 

				// Prise en compte des droits sur les différents éléments
				HELPER.Array.removeItemsFromFunction(this.tdbModel.selectionList, function (item) {if (HELPER.Utils.isEmpty(item.rightKey)) return false; else return !HELPER.User.hasRight(item.rightKey) })
				HELPER.Array.removeItemsFromFunction(this.tdbModel.headerActions, function (item) { if (HELPER.Utils.isEmpty(item.rightKey)) return false; else return !HELPER.User.hasRight(item.rightKey) })
				HELPER.Array.removeItemsFromFunction(this.tdbModel.actions, function (item) { if (HELPER.Utils.isEmpty(item.rightKey)) return false; else return !HELPER.User.hasRight(item.rightKey) })
				HELPER.Array.removeItemsFromFunction(this.tdbModel.prints, function (item) { if (HELPER.Utils.isEmpty(item.rightKey)) return false; else return !HELPER.User.hasRight(item.rightKey) })

				this.tdbModel.quickFilterOptions = new QuickFilterConfigModel({ preferenceRubrique: "TDB", preferenceKey: this.tdbModel.preferenceKey, applyQuickFilterFn: this.applyQuickFilterChange, quickFilterFilteringFn: this.applyQuickFilterFiltering, enableCleanFilter: true, applyEmptyFilter: true });

				// Si chargement depuis dashboard statistique ne pas charger statut de puis les preferences.
				if (this.tdbModel.disableLoadAndSaveLastTdb !== true) {
				    this._loadLastTdbStatus();
				    this._loadTdbStatusFromUrl();
				}

				// Initialisation du push
				if (initOpts && initOpts.ignorePushManagement){}
				else
					this._pushInitialisation();

				// Initialisation de la colonne avec les actions de tdbs.
				var tdbActionColumn = HELPER.Array.findFirstFromProperty(this.tdbModel.columnDefs, 'field', 'ACTIONTDB');
				if (tdbActionColumn) {
					HELPER.Array.forEach(this.tdbModel.actions, function (action) {
						HELPER.Grid.addButtonActionInColumn(ctx.gridOptions, 'ACTIONTDB', '', action.name, action.action, action.isEnabled, action.rightKey);
					});
				}

				if (initOpts && initOpts.ignoreLoadData)
					return HELPER.Utils.emptyPromise(true);
				else
					return this.tdbLoadData(initOpts);
				

			};

			function exit() {
				ctx.tdbModel.status = 'DESTROY';
			};

			

			function hasPrintAvailable() {
				return this.tdbModel.prints.length > 0;
			}


			function hasFiltersActive() {
			    return HELPER.Utils.hasProperties(this.tdbModel.currentFilters);
			}

			function clearFilter() {
			    this.tdbModel.currentFilters = {};
			    if (this.tdbModel.savedPeriodBeforeFilter)
			    {
			    	this.tdbModel.currentPeriod = this.tdbModel.savedPeriodBeforeFilter;
			    	this.tdbModel.savedPeriodBeforeFilter = null;
				}
			    this.tdbLoadData();
			}

			function getCurrentTdbItemKey() {
				if (this.tdbModel.currentTdbItem)
					return this.tdbModel.currentTdbItem[this.tdbModel.tdbKey];
				else
					return null;
			}

			function getCurrentTdbItem() {
				return this.tdbModel.currentTdbItem;
			}

			function getCurrentTdbItems() {
				if (this.tdbModel.currentTdbItems.length == 0 && this.tdbModel.currentTdbItem != null)
					return [this.tdbModel.currentTdbItem];
				return this.tdbModel.currentTdbItems;
			}

			function applySelectionChange(valeur) {
				ctx.tdbLoadData();
			};

			function applyPeriodChange(periodObj) { //periodObj has from, to, type. newFrom, newTo, newType
				ctx.tdbLoadData();
			};

			function applyQuickFilterChange(quickFilter) {
				ctx._loadStoredFilterInfo(quickFilter);
				ctx.tdbLoadData();
			};


			function applyOpenSitesSelectionnes() {
				HELPER.Form.openWindowWithOpts('FicheSelectionSites', { relativeElem: 'btnSites' }, ctx.tdbModel.sitesSelectionnes).then(
					function (result) {
						if (result.success) {
							ctx.tdbModel.sitesSelectionnes = result.data;
							HELPER.User.setPreference('TDB_SITES', ctx.tdbModel.preferenceKey, ctx.tdbModel.sitesSelectionnes );
							ctx.tdbModel.quickFilterOptions.reload();
							ctx.tdbLoadData();
							if (ctx.onSitesSelectionnesChanged) {
							    ctx.onSitesSelectionnesChanged(ctx.tdbModel.sitesSelectionnes);
							}
						}
					});
			};
			function applyOpenFilter() {
				if (!HELPER.Utils.isEmptyOrWhitespace(ctx.tdbModel.filterOpenerName)) {
					var windowOpened = HELPER.Form.openWindow(ctx.tdbModel.filterOpenerName, ctx.tdbModel.currentFilters, ctx.tdbModel.sitesSelectionnes, ctx.tdbModel.tdbType);
					windowOpened.then(ctx.applyFilterChangeFromResultTo);
				}
			}



			function applyFilterChangeFromResultTo(resultTo) {
				if (resultTo.success)
					ctx.applyFilterChange(resultTo.data);
			}


			function applyFilterChange(newFilters) {
				// Suppression des propriétés inutile;
				newFilters = this._clearEmptyFilterParameters(newFilters);

				// Sauvegarde du filtre rapide
				if (newFilters.filterSaveInfo) {
					if (!HELPER.Utils.isEmpty(this.tdbModel.sitesSupported))
						newFilters.sitesSelectionnes = this.tdbModel.sitesSelectionnes;
					this.tdbModel.quickFilterOptions.addQuickFilter(newFilters, this.tdbModel.currentSelection.val, this.tdbModel.currentPeriod);
				}
				this.tdbModel.currentFilters = newFilters;
				this.tdbLoadData();
			};

			function applyQuickFilterFiltering(filter) {
				if (!filter.infoFilter)
					return false;

				if (HELPER.Utils.isEmpty(ctx.tdbModel.sitesSelectionnes) || HELPER.Utils.isEmpty(filter.infoFilter.sitesSelectionnes))
					return true;
								
				return HELPER.Utils.containStringComma(ctx.tdbModel.sitesSelectionnes, filter.infoFilter.sitesSelectionnes);
			}

			function applyTdbItemChange(item) {

				if (HELPER.Array.isArray(item)) {
					this.tdbModel.currentTdbItem = null;
					this.tdbModel.currentTdbItems = item;
				}
				else {
					this.tdbModel.currentTdbItem = item;
					this.tdbModel.currentTdbItems = [];
				}

				this.onTdbItemChanged(this.tdbModel.currentTdbItem);

				this._refreshSelectedItemInTdb(false, true);

			};


			function applyCurrentTdbItemReloadAndFocus() {
				if (this.tdbModel.currentTdbItem == null) return;

				var result = new ResultTo();
				result.itemId = [this.getCurrentTdbItemKey()];
				this._tdbAddOrUpdateItemFromId(result, true);
			}

			function applyTdbItemReloadAndFocus(resultTo, specificCriteriaKey, specificKeyField) {
				// if (formResult.success == false) return;
				if ((resultTo.itemId != null && resultTo.itemId.length > 0) || (resultTo.itemDeleteId != null && resultTo.itemDeleteId.length > 0))
					this._tdbAddOrUpdateItemFromId(resultTo, true, specificCriteriaKey, specificKeyField);
				}

			function prepareCriteriaListForServer() {
				var result = _.clone(this.tdbModel.currentFilters);

				if (!HELPER.Utils.isEmpty(this.tdbModel.hiddenCriteriaName)
                 && !HELPER.Utils.isEmpty(this.tdbModel.hiddenCriteriaValue))
				    result[this.tdbModel.hiddenCriteriaName] = this.tdbModel.hiddenCriteriaValue;
				else {
				    result['Rechercher_DateDebut'] = this.tdbModel.currentPeriod.from;
				    result['Rechercher_DateFin'] = this.tdbModel.currentPeriod.to;
				    result['Rechercher_Statut'] = this.tdbModel.currentSelection.val;
				    if (this.tdbModel.sitesSelectionnes && HELPER.Utils.isEmpty(result['Rechercher_Sites']))
				        result['Rechercher_Sites'] = this.tdbModel.sitesSelectionnes;
				}

				for (var prop in result) {
					if (result[prop] && result[prop].id) {
						result[prop] = result[prop].id;
					}
				}

				if (this.tdbModel.sitesSupported)
					delete result.sitesSelectionnes;

				return result;
			};

			function onTdbDataLoaded(resultat) {

			}

			function onTdbItemChanged(item) {

			}

		
			function onTdbItemRefreshedOrChanged(item) {

			}
			function onBeforeTdbLoadData() {

			}

			function applyShowFormPrintTdb() {
				HELPER.Form.openWindow('TdbPrint', this.tdbModel.prints);
			}


			function tdbLoadDataWithValues(selectionCode, periodType, clearFilters, opts) {

				if (!HELPER.Utils.isEmptyOrWhitespace(selectionCode)) {
					var selection = HELPER.Array.findFirstFromProperty(this.tdbModel.selectionList, 'val', selectionCode);
					if (selection == null) 
						throw new Error("Invalid selectionCode provided to tdbLoadDataWithValues, this selectionCode cannot be found in the selection list.");
					else
						this.tdbModel.currentSelection = selection;
				}

				if (!HELPER.Utils.isEmptyOrWhitespace(periodType)) {
					switch (periodType) {
						case 'TODAY':
						case 'YESTERDAY':
						case 'TOMORROW':
						case 'ONEWEEK':
						case 'TWOWEEKS':
						case 'FOURWEEKS':
						case 'ALL':
							this.tdbModel.currentPeriod = HELPER.Utils.periodUpdate({ type: periodType, mode: 'past' }); break;

						default: throw new Error("Invalid periodType provided to tdbLoadDataWithValues, values accepted: TODAY, YESTERDAY, TOMOROW,TWO WEEKS, FOUR WEEKS, ALL");
							break;
					}
				}

				if (clearFilters == true) {
					this.tdbModel.currentFilters = {};
				}

				this.tdbLoadData(opts);
			}

		

			function tdbLoadData(opts) {
				this.tdbModel.status = 'LOADING-DATA';

				this._autoRefreshStopInterval();

				var ignoreFocus = false;
				if (opts && opts.ignoreFocus == true) ignoreFocus = true,

				
				// Stockage sur le profiler de la derniere période et Selection active
				ProfilerService.updateTdbParam(this.tdbModel.currentSelection.val, this.tdbModel.currentPeriod.type, this.tdbModel.currentFilters);

				// Stockage des filtres dans les préférences en cas de déconnexions, uniquement si on ne charge pas depuis un dashboard statistique
				if (this.tdbModel.disableLoadAndSaveLastTdb !== true)
					this._saveLastTdbCriteria();

				var columnsKeys = this._getColumnKeyList();
				var filterCriteria = this.prepareCriteriaListForServer();

				if (this.onBeforeTdbLoadData) {
					var periodTypeBeforeTdbLoadData = this.tdbModel.currentPeriod.type;
					if (this.onBeforeTdbLoadData(this, filterCriteria, columnsKeys) === false) {
						if (this.datasource.length > 0) {
							this.datasource = [];
							HELPER.Grid.refreshGridDisplay(this.gridOptions, null, ignoreFocus);
							this._refreshSelectedItemInTdb(!ignoreFocus);
							this.onTdbDataLoaded([]);
							this._autoRefreshInitInterval();
							return HELPER.Utils.emptyPromise(true, false);
						}
						this.tdbModel.imgFilterUrl = this.hasFiltersActive() ? 'XaCommon/Img/criterias.png' : 'XaCommon/Img/criterias-blanc.png';
						this.tdbModel.hasFilterActive = this.hasFiltersActive();
						return;
					}
					if (periodTypeBeforeTdbLoadData != this.tdbModel.currentPeriod.type) {
						// Remise en cohérence de la période selon l'opération réalisé dans onBeforeTdbLoaDate
						this.tdbModel.currentPeriod = this._getDateFromPeriodType(this.tdbModel.currentPeriod);
					}
				}

				// Disable All Date If No Filter Active
				if (this.tdbModel.currentPeriod.type == 'ALL' && this.tdbModel.disableAllDateIfNoFilter && HELPER.Utils.hasProperties(this.tdbModel.currentFilters) == false) {
					if (this.tdbModel.savedPeriodBeforeFilter) {
						this.tdbModel.currentPeriod = this.tdbModel.savedPeriodBeforeFilter;
						this.tdbModel.savedPeriodBeforeFilter = null;
					} else {
						HELPER.Toast.showToastWarning(HELPER.Utils.getLabel("TXT_ATTENTION"), HELPER.Utils.getLabel("TXT_TDB_TOUTE_DATE_INACTIF"))
						this.tdbModel.currentPeriod = HELPER.Utils.periodToday();
					}

				}

				// If all date filter auto switch
				var hasAllDateFilter = HELPER.Array.findFirstFromFunction(HELPER.Utils.objGetKeys(filterCriteria), function (critName) {
					return this.tdbModel.criteriaAvailables[critName] && this.tdbModel.criteriaAvailables[critName].isAllDate;
				}, this);

				if (hasAllDateFilter) {
					if (this.tdbModel.currentPeriod.type != 'ALL') {
						this.tdbModel.savedPeriodBeforeFilter = this.tdbModel.currentPeriod;
						this.tdbModel.currentPeriod = HELPER.Utils.periodAllDate();
					}
				}
				else {
					this.tdbModel.savedPeriodBeforeFilter = null;
				}
			
				// Prendre en compte la derniere date initialisé.
				if (filterCriteria.Rechercher_DateDebut && !HELPER.Utils.dateEqual(filterCriteria.Rechercher_DateDebut,this.tdbModel.currentPeriod.from)) filterCriteria.Rechercher_DateDebut = this.tdbModel.currentPeriod.from;
				if (filterCriteria.Rechercher_DateFin && !HELPER.Utils.dateEqual(filterCriteria.Rechercher_DateFin, this.tdbModel.currentPeriod.to)) filterCriteria.Rechercher_DateFin = this.tdbModel.currentPeriod.to;

				this.tdbModel.currentRequestedColumns = columnsKeys;
				var data = {
					Type: this.tdbModel.tdbType,
					RequestedColumns: this.tdbModel.currentRequestedColumns,
					Criteria: filterCriteria
				};

				// Optimisation pour eviter un binding de fonction sur le tdb
				this.tdbModel.imgFilterUrl = this.hasFiltersActive() ? 'XaCommon/Img/criterias.png' : 'XaCommon/Img/criterias-blanc.png';
				this.tdbModel.hasFilterActive = this.hasFiltersActive();
				
				// Vérifier si le filtre rapide en cours est toujours actif
				var currentQuickFilter = this.tdbModel.quickFilterOptions.getCurrentQuickFilter ? this.tdbModel.quickFilterOptions.getCurrentQuickFilter() : null;
				var resetQuickFilter = false;
				if (currentQuickFilter)
				{
					if (currentQuickFilter.selection && currentQuickFilter.selection != this.tdbModel.currentSelection.val)
						resetQuickFilter = true;

					var filters = HELPER.Utils.objGetKeys(currentQuickFilter.infoFilter);
					HELPER.Array.forEach(filters, function (filterKey) {
						if (this.tdbModel.currentFilters[filterKey] == undefined)
							resetQuickFilter = true;
					}, this);
					
					if (resetQuickFilter)
						this.tdbModel.quickFilterOptions.resetCurrentQuickFilter();
				}


				var ctx = this;
				return HELPER.Api.callApiApplication('Tdb', 'getList', data).then(
                    function MajDataSource(result) {
                    	// Rechargement grille
                    	var resultTransformed = ctx._transformResult(result);
                    	ctx.datasource = resultTransformed;
                    	HELPER.Grid.refreshGridDisplay(ctx.gridOptions, null, ignoreFocus);
                    	ctx._refreshSelectedItemInTdb(!ignoreFocus);
                    	ctx.onTdbDataLoaded(resultTransformed);
                    	ctx.tdbModel.status = 'READY';
                    	ctx._autoRefreshInitInterval();
                    }
                );


			};

			function applyRefresh() {
			    this.tdbLoadData();
			    if (this.onTdbRefresh) {
			        this.onTdbRefresh();
			    }
			    
			}

			//var ctx = this;
			/*this.cleanUp = function () {
				if (ctx.tdbModel) {
					ctx.tdbModel.cleanUp();
					ctx.tdbModel = null;
				}
				if (ctx.datasource) ctx.datasource.length = 0;
			};*/

		}


		return TdbManager;
	});

})();

