(function () {
	'use strict';

	angular.module('XaCommon').factory('TdbManagerBase', function ($injector, HELPER, TdbModel, TdbItemModel, GridConfigModel, TdbStoredFilterModel) {

		function TdbManagerBase(parent) {
			var vm = parent; //add everything on the parent's this

			vm._getDataGridDefaultOptions = _getDataGridDefaultOptions;

			vm._removeTdbItemIfInTdb = _removeTdbItemIfInTdb;

			vm._addOrUpdateTdbItemIfMeetCriteria = _addOrUpdateTdbItemIfMeetCriteria;

			vm._transformResult = _transformResult;

			vm._updateTdbItemActions = _updateTdbItemActions

			vm._getColumnKeyList = _getColumnKeyList;

			vm._refreshSelectedItemInTdb = _refreshSelectedItemInTdb;

			vm._tdbRemoveItemFromId = _tdbRemoveItemFromId;

			vm._tdbAddOrUpdateItemFromId = _tdbAddOrUpdateItemFromId;

			vm._runDefaultAction = _runDefaultAction;

			vm._clearEmptyFilterParameters = _clearEmptyFilterParameters;

			/*  vm._getQuickFilterFromUser = _getQuickFilterFromUser;
  
              vm._saveQuickFilter = _saveQuickFilter;*/

			vm._saveLastTdbCriteria = _saveLastTdbCriteria;

			vm._loadLastTdbStatus = _loadLastTdbStatus;

			vm._loadTdbStatusFromUrl = _loadTdbStatusFromUrl;

			vm._loadStoredFilterInfo = _loadStoredFilterInfo;

			vm._getDateFromPeriodType = _getDateFromPeriodType;


			vm._autoRefreshInitInterval = _autoRefreshInitInterval;

			vm._autoRefreshStopInterval = _autoRefreshStopInterval;

			vm._autoRefreshSwitchStatus = _autoRefreshSwitchStatus;


			vm._checkPushedValueWithCurrentFilter = _checkPushedValueWithCurrentFilter;

			vm._pushControleDeclaration = _pushControleDeclaration;

			vm._pushInitialisation = _pushInitialisation;

			vm._pushTdbReceive = _pushTdbReceive;

			vm._pushTdbVerrouReceive = _pushTdbVerrouReceive;

			vm._pushDestroy = _pushDestroy;

			function _getDateFromPeriodType(dateSaved) {
				return HELPER.Utils.periodUpdate(dateSaved);
			}

			function _loadStoredFilterInfo(storedFilter) {
				if (storedFilter) {

					if (storedFilter.period) {
						var obj = _getDateFromPeriodType(storedFilter.period);
						this.tdbModel.currentPeriod = obj;
					}

					if (storedFilter.selection) {
						var sel = _.find(this.tdbModel.selectionList, function (item) { return item.val == storedFilter.selection }, this);
						if (sel) this.tdbModel.currentSelection = sel;
					}
					this.tdbModel.currentFilters = HELPER.Utils.cloneObject(storedFilter.infoFilter);

					//  this.tdbModel.currentQuickFilter = storedFilter;
				}
				else {
					this.tdbModel.currentFilters = {};
					//   this.tdbModel.currentQuickFilter = {};
				}
			}

			function _saveLastTdbCriteria() {

				var TdbStoredFilter = new TdbStoredFilterModel({
					text: 'INITIAL',
					selection: this.tdbModel.currentSelection.val,
					period: this.tdbModel.currentPeriod,
					infoFilter: {} //On ne sauvegarde plus le dernier filtre actif ... =this.tdbModel.currentFilters
				});

				// sauvegarde status tdb
				HELPER.User.setPreference("TDB_INIT", this.tdbModel.preferenceKey, HELPER.Utils.objectToJson(TdbStoredFilter));
			}


			function _loadLastTdbStatus() {
				var pref = HELPER.User.getPreference("TDB_INIT", this.tdbModel.preferenceKey);

				if (!HELPER.Utils.isEmpty(pref)) {

					var storedFilterModel = HELPER.Utils.convertToType(HELPER.Utils.jsonToObject(pref), TdbStoredFilterModel);
					if ((storedFilterModel.period.type == 'ALL' || storedFilterModel.period.type == 'FREE') && this.tdbModel.canLoadToutesDatesOnStart !== true)
						storedFilterModel.period.type = 'TODAY';

					this._loadStoredFilterInfo(storedFilterModel);
				}
			}

			function _loadTdbStatusFromUrl() {
				var period = HELPER.Url.getUrlParameter("tdbPeriod", '', true);
				var selection = HELPER.Url.getUrlParameter("tdbSelection", '', true);
				var filterstr = HELPER.Url.getUrlParameter("tdbFilters", '', true);

				if (!HELPER.Utils.isEmpty(period)) {
					var obj = _getDateFromPeriodType({ type: period });
					this.tdbModel.currentPeriod = obj;
				}

				if (!HELPER.Utils.isEmpty(selection)) {
					var sel = _.find(this.tdbModel.selectionList, function (item) { return item.val == selection }, this);
					if (sel) this.tdbModel.currentSelection = sel;
				}

				if (!HELPER.Utils.isEmpty(filterstr)) {
					var filtersArray = filterstr.split(';');
					var currentFilter = {};
					HELPER.Array.forEach(filtersArray, function (filter) {
						var filterArray = filter.split(':');
						if (filterArray.length == 3) {
							switch (filterArray[1]) {
								case "D":
									this.tdbModel.currentFilters[filterArray[0]] = filterArray[2] + "T00:00:00";
									break;

								case "S":
									this.tdbModel.currentFilters[filterArray[0]] = filterArray[2];
									break;
							}
						}
					}, this);

				}
			}

			function _clearEmptyFilterParameters(value) {
				var value = _.clone(value);
				var keys = _.keys(value);
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					if (value[key] === false || HELPER.Utils.isEmpty(value[key]) || (key.indexOf('filterSaveInfo') == -1 && key.indexOf("Rechercher_") == -1) || HELPER.Utils.dateIsEmpty(value[key]))
						delete value[key];
				}
				return value;
			}

			function _tdbRemoveItemFromId(itemDeleteId, specificFieldKey) {
				for (var i = 0; i < itemDeleteId.length; i++) {
					var itemId = itemDeleteId[i];
					var ctx = { 'tdbItemToDelete': itemId, 'tdbKey': specificFieldKey || this.tdbModel.tdbKey }

					do {
						var item = _.find(this.datasource, function (dataSourceItem) { return dataSourceItem[this.tdbKey] == this.tdbItemToDelete }, ctx);
						if (item != null)
							this._removeTdbItemIfInTdb(item);
					} while (item != null && !HELPER.Utils.isEmpty(specificFieldKey))

				}
			}

			function _tdbAddOrUpdateItemFromId(formResult, forceFocus, tdbSpecificCriteriaKey, specificKeyField) {
				var ctx = this;
				if (!forceFocus)
					forceFocus == true;

				if (HELPER.Array.isEmpty(formResult.itemId) && HELPER.Array.isEmpty(formResult.itemDeleteId))
					throw new Error("addOrUpdateTdbItem appellé sans passer un objet résultat avec l'itemId ou itemDeleteId renseigné");

				if (!HELPER.Array.isEmpty(formResult.itemDeleteId)) {
					this._tdbRemoveItemFromId(formResult.itemDeleteId, specificKeyField);

					// Si uniquement le traitement va s'arrete ici car la liste itemId est vide.
					if (HELPER.Array.isEmpty(formResult.itemId)) {
						HELPER.Grid.refreshGridDisplay(ctx.gridOptions);
						ctx._refreshSelectedItemInTdb(forceFocus);
					}
				}

				if (HELPER.Array.isEmpty(formResult.itemId)) {
					// Evenement post analyse du resultTo pour le dashboard. MAJ des autres vignettes.
					if (ctx.onTdbChangedFromResultTo)
						ctx.onTdbChangedFromResultTo(formResult);
					return;
				}

				var criteria = {};
				//   if (this.tdbModel.pushSupported != true)
				criteria = this.prepareCriteriaListForServer();

				if (tdbSpecificCriteriaKey)
					criteria[tdbSpecificCriteriaKey] = formResult.itemId;
				else
					criteria[this.tdbModel.criteriaKey] = formResult.itemId;

				var data = {
					Type: this.tdbModel.tdbType,
					RequestedColumns: this.tdbModel.currentRequestedColumns ? this.tdbModel.currentRequestedColumns : this._getColumnKeyList(),
					Criteria: criteria
				};

				HELPER.Api.callApiApplication('Tdb', 'getList', data).then(
                    function (result) {
                    	var resultTransformed = ctx._transformResult(result);

                    	//if (formResult.itemId.length != resultTransformed.length && ctx.tdbModel.pushSupported === true)
                    	//    throw new Error("tdbLoadItemFromId: L'appel serveur doit retourner autant d'item que la quantité à recharger");

                    	var needRefresh = false;
                    	// if (ctx.tdbModel.pushSupported != true) {
                    	var itemsToRemove = [];

						/* Debut de la gestion du bloc de suppression */
                    	var existingItem = [];
                    	if (specificKeyField) {
                    		for (var i = 0; i < formResult.itemId.length ; i++) {
                    			existingItem = existingItem.concat(HELPER.Array.mapProperty(HELPER.Array.findFromProperty(vm.datasource, specificKeyField || ctx.tdbModel.tdbKey, formResult.itemId[i]), ctx.tdbModel.tdbKey));
                    		}
                    	}
                    	else
                    		existingItem = formResult.itemId;

                    	for (var i = 0; i < existingItem.length ; i++) {
                    		var itemFromServeur = HELPER.Array.findFirstFromProperty(resultTransformed, ctx.tdbModel.tdbKey, existingItem[i]);
                    		if (itemFromServeur == null)
                    			itemsToRemove.push(existingItem[i]);
                    	}

                    	if (itemsToRemove.length > 0) {
                    		needRefresh = true;
                    		ctx._tdbRemoveItemFromId(itemsToRemove, ctx.tdbModel.tdbKey);
                    	}
                    	/* Fin de la gestion du bloc de suppression */

                    	var itemToSelect = null;
                    	for (var i = 0; i < resultTransformed.length ; i++) {
                    		var result = ctx._addOrUpdateTdbItemIfMeetCriteria(resultTransformed[i]);
                    		if (result == 'INSERT' || result == 'DELETE')
                    			needRefresh = true;

                    		if (result == 'INSERT')
                    			itemToSelect = resultTransformed[i];
                    	}

                    	// Sélectionner automatiquement la ligne modifiée ou ajouter.
                    	if (itemToSelect != null)
                    		ctx.tdbModel.currentTdbItem = itemToSelect;

                    	if (needRefresh == true)
                    		HELPER.Grid.refreshGridDisplay(ctx.gridOptions);

                    	ctx._refreshSelectedItemInTdb(forceFocus);

                    	// Evenement post analyse du resultTo pour le dashboard. MAJ des autres vignettes.
                    	if (ctx.onTdbChangedFromResultTo)
                    		ctx.onTdbChangedFromResultTo(formResult);
                    }
                );
			}

			function _getDataGridDefaultOptions(model) {
				var ctx = this;

				var result = new GridConfigModel({
					title: HELPER.Utils.getLabel('TXT_TITRE_TABLEAU_BORD'),
					height: 'fit',
					uniqueKey: this.tdbModel.tdbKey,
					canedit: this.tdbModel.caneditGrid,
					datasource: function GetDataSource() {
						return ctx.datasource;
					},
					columnDefs: this.tdbModel.columnDefs,
					showGroupPanel: true,
					groupInfo: this.tdbModel.groupInfo ? this.tdbModel.groupInfo : [],
					sortInfo: this.tdbModel.sortInfo ? this.tdbModel.sortInfo : [],
					quickSearchFields: this.tdbModel.quickSearchFields ? this.tdbModel.quickSearchFields : [],
					handlers: {
						onSelectionChange: function (entity) {
							//     if (ctx.tdbModel.currentTdbItem != entity)
							ctx.applyTdbItemChange(entity);
						}
					},
					maxRows: 2000,
					enableMultiSelection: this.tdbModel.enableMultiSelection,
					gridName: this.tdbModel.preferenceKey || this.tdbModel.tdbType,
					showColumnOptions: true,
					keyRegistryColumnOption: 'TDB_DISPLAY',
					rowSummaryLabel: this.tdbModel.rowSummaryLabel,
					onDestroyFn: function () { _autoRefreshStopInterval(); _pushDestroy(); },
					onColumnPersoFn: function () { vm.tdbLoadData() },
				});

				HELPER.Grid.setDblClickAction(result, function (entity) {
					if (ctx.tdbModel.currentTdbItem != entity)
						ctx.applyTdbItemChange(entity);
					ctx._runDefaultAction(entity);
				});

				return result;

			}

			function _removeTdbItemIfInTdb(tdbItemToDelete) {
				var pos = this.datasource.indexOf(tdbItemToDelete);
				if (pos == -1)
					return;
				else
					this.datasource.splice(pos, 1);

				if (tdbItemToDelete == this.tdbModel.currentTdbItem) {
					// Reselectionner l'item suivant et mettre à jours 
					// Gestion du force focus
					this.tdbModel.currentTdbItem = null;
				}
			}

			function _addOrUpdateTdbItemIfMeetCriteria(tdbItemToAdd, callFromPush, isUserPush) {
				var ctx = { 'tdbItemToAdd': tdbItemToAdd, 'tdbKey': this.tdbModel.tdbKey }
				var activeCriterias = this.prepareCriteriaListForServer();
				var itemInTdb = _.find(this.datasource, function (dataSourceItem) { return dataSourceItem[this.tdbKey] == this.tdbItemToAdd[this.tdbKey] }, ctx);

				var richFilterCriteria = true;
				var log = '';
				var operationDone = '';
				var criteriaKeysToCheck = HELPER.Utils.objGetKeys(activeCriterias);

				// En debug mode on controle tous les criteres.
				if (vm.tdbModel.debugMode == true)
					criteriaKeysToCheck = HELPER.Utils.objGetKeys(this.tdbModel.criteriaAvailables);

				if (callFromPush) {

					// Controle du site car si la donnee n'appartient pas au sites autorisées, on doit la masquée.
					if (vm.tdbModel.pushSiteColumn
						&& HELPER.Utils.containStringComma(HELPER.User.getUser().identification.codesSitesAutorises, vm.tdbModel.pushSiteColumn))
						richFilterCriteria = false

					// Controle des critères.
					if (richFilterCriteria != false) {
						for (var i = 0; i < criteriaKeysToCheck.length; i++) {
							var criteriaKey = criteriaKeysToCheck[i];
							var criteriaInfo = this.tdbModel.criteriaAvailables[criteriaKey];
							if (!criteriaInfo)
								throw new Error("Le criteria " + criteriaKeysToCheck[i] + " n'a pas été défini dans les régles de push");

							// Si operateur avec criteria disableupdate, alors on arrete le controle et on ne mets pas à jours.
							if (criteriaInfo.operation == 'disableupdate') {
								operationDone = 'NONE';
								return operationDone;
							}

							var valueMeetCriteria = this._checkPushedValueWithCurrentFilter(activeCriterias, criteriaKey, criteriaInfo, tdbItemToAdd);
							if (valueMeetCriteria === false) {
								richFilterCriteria = false;
								if (vm.tdbModel.debugMode != true)
									break;
							}

							if (vm.tdbModel.debugMode)
								console.log(criteriaKey + ": " + activeCriterias[criteriaKey] + " / newData (" + criteriaInfo.field + "):" + tdbItemToAdd[criteriaInfo.field] + " / result (" + criteriaInfo.operator + "): " + valueMeetCriteria);
						}
					}
				}

				// Si ne repond pas au critere du tdb, on supprime la ligne et on sort.
				if (richFilterCriteria == false) {
					if (itemInTdb != null) {
						if (callFromPush && isUserPush != true) { // Ds le cas d'un push emis par l'utilisateur on supprime la ligne.
							itemInTdb._disabledRow = true;
							HELPER.Grid.refreshRowDisplay(this.gridOptions, itemInTdb, callFromPush)
						}
						else {
							this._removeTdbItemIfInTdb(itemInTdb);
							operationDone = 'DELETE';
						}
					}
					else {
						operationDone = 'NONE';
					}
				}
				else {

					// Répond aux criteres et n'existe pas dans le tdb, on ajoute l'item
					if (itemInTdb == null) {
						itemInTdb = tdbItemToAdd;
						this.datasource.push(tdbItemToAdd);
						operationDone = 'INSERT';
					}
						// Répond aux criteres et n'existe pas dans le tdb, on ajoute l'item
					else {
						var keys = _.keys(tdbItemToAdd);
						for (var i = 0; i < keys.length; i++) {
							if (itemInTdb[keys[i]] != tdbItemToAdd[keys[i]]) {
								if (this.tdbModel.verrouConf && callFromPush && keys[i] == this.tdbModel.verrouConf.field)
									continue;
								else
									itemInTdb[keys[i]] = tdbItemToAdd[keys[i]];
							}
						}
						if (callFromPush && itemInTdb._disabledRow == true)
							itemInTdb._disabledRow = false;

						operationDone = 'UPDATE';
						HELPER.Grid.refreshRowDisplay(this.gridOptions, itemInTdb, callFromPush)
					}
				}
				return operationDone;
			}

			function _getColumnKeyList() {
				return this.gridOptions.getCurrentVisibleColumnsName();
			};

			function _transformResult(resultFromServer) {
				return HELPER.Utils.convertTdbArrayToType(resultFromServer, TdbItemModel);
			};

			function _updateTdbItemActions() {
				// Extraction des actions disponibles.
				if (this.tdbModel.currentTdbItem == null || this.tdbModel.currentTdbItem._disabledRow == true) {
					this.tdbModel.currentTdbItemActions = [];
					return;
				}


				var result = _.filter(this.tdbModel.actions, function (action) {
					return action.isEnabled(this) == true;
				}, this.tdbModel.currentTdbItem);


				var defaultAction = null;
				if (this.tdbModel.keepLastActionAsDefault && this.tdbModel.lastActionCode)
					defaultAction = HELPER.Array.findFirstFromProperty(result, 'code', this.tdbModel.lastActionCode);


				if (defaultAction == null) {
					defaultAction = this.tdbModel.defaultActionFonc(this.tdbModel.currentTdbItem, result);
					if (typeof defaultAction == 'string')
						defaultAction = HELPER.Array.findFirstFromProperty(result, 'code', defaultAction);
				}

				if (defaultAction)
					HELPER.Array.moveItemToFirstPosition(result, defaultAction);


				this.tdbModel.currentTdbItemActions = result;

			};

			function _runDefaultAction(tdbItem) {
				var defaultAction = null;
				if (this.tdbModel.keepLastActionAsDefault && this.tdbModel.lastActionCode)
					defaultAction = HELPER.Array.findFirstFromProperty(this.tdbModel.currentTdbItemActions, 'code', this.tdbModel.lastActionCode);

				if (defaultAction == null && this.tdbModel.currentTdbItemActions && this.tdbModel.currentTdbItemActions.length > 0) {
					defaultAction = this.tdbModel.currentTdbItemActions[0];
					this.tdbModel.lastActionCode = defaultAction.code;
				}

				if (defaultAction) {

					return defaultAction.action(defaultAction.code);
				}
			};

			function _refreshSelectedItemInTdb(forceFocus, fromUi) {

				var oldSelectedItem = this.tdbModel.currentTdbItem;

				var selectedItemInDataSource = null;

				if (this.tdbModel.currentTdbItem != null)
					selectedItemInDataSource = HELPER.Array.findFirstFromProperty(this.datasource, this.tdbModel.tdbKey, this.tdbModel.currentTdbItem[this.tdbModel.tdbKey])

				// MAJ de l'instance de l'objet selectionné si elle a changé
				if (this.tdbModel.currentTdbItem != selectedItemInDataSource)
					this.tdbModel.currentTdbItem = selectedItemInDataSource;

				// Si l'item séléctionné est absent de la datasource on le remet à vide
				if (this.tdbModel.currentTdbItem && selectedItemInDataSource == null) {
					this.tdbModel.currentTdbItem = null;
				}

				// Selection du premier item si aucun item courant selectionnné.
				// Attention selectFirstItem va redéclenché cette méthode, d'ou le else pour la suite du traitement.
				if (this.tdbModel.currentTdbItem == null && fromUi != true && this.datasource.length > 0
					/* &&( this.tdbModel.currentTdbItems == null ||  this.tdbModel.currentTdbItems.length == 0) */) {
					this.tdbModel.currentTdbItem = this.gridOptions.selectFirstItem(!forceFocus);
				}
				else {
					// Cohérence si une valeur séléctionné plus de multi selection
					if (this.tdbModel.currentTdbItem != null)
						this.tdbModel.currentTdbItems = [];

					if (oldSelectedItem != this.tdbModel.currentTdbItem)
						this.onTdbItemChanged(this.tdbModel.currentTdbItem);

					// fromUi, si on vient du change de la grille pas besoin de reselectionner la ligne
					if (this.tdbModel.currentTdbItem != null && fromUi != true && this.gridOptions.setSelectedItem)
						this.gridOptions.setSelectedItem(this.tdbModel.currentTdbItem, !forceFocus);

					this.onTdbItemRefreshedOrChanged(this.tdbModel.currentTdbItem);

					this._updateTdbItemActions();
				}
			}

			function _autoRefreshInitInterval() {
				if (this.tdbModel.autoRefreshIsActive && this.tdbModel.autoRefreshInterval == null) {
					this.tdbModel.autoRefreshPeriod = this.tdbModel.autoRefreshPeriod || 60;
					this.tdbModel.autoRefreshInterval = setInterval(_autoRefreshIntervalFn, 1000);
					this.tdbModel.autoRefreshIsActive = true;
					this.tdbModel.autoRefreshIsPlay = true;
					this.tdbModel.autoRefreshDelay = this.tdbModel.autoRefreshPeriod;
					$('#autoRefreshDelay').text(vm.tdbModel.autoRefreshDelay);
				}
			}

			function _autoRefreshIntervalFn() {
				if (vm.tdbModel.autoRefreshDelay == 0) {
					// Si chargement en cours on ne fait rien
					if (vm.tdbModel.status = 'READY') {
						_autoRefreshStopInterval();
						vm.tdbLoadData({ ignoreFocus: true });
					}
					else {
						this.tdbModel.autoRefreshPeriod = this.tdbModel.autoRefreshPeriod || 60;
					}
				}
				else {
					vm.tdbModel.autoRefreshDelay--;
					$('#autoRefreshDelay').text(vm.tdbModel.autoRefreshDelay);
				}
			}

			function _autoRefreshStopInterval() {
				if (vm.tdbModel.autoRefreshInterval != null) {
					clearInterval(vm.tdbModel.autoRefreshInterval);
					vm.tdbModel.autoRefreshInterval = null;
					vm.tdbModel.autoRefreshDelay = 0;
					vm.tdbModel.autoRefreshIsPlay = false;
					$('#autoRefreshDelay').text(vm.tdbModel.autoRefreshDelay);
				}
			}

			function _autoRefreshSwitchStatus() {
				if (vm.tdbModel.autoRefreshIsPlay == false)
					vm._autoRefreshInitInterval();
				else
					vm._autoRefreshStopInterval();
			}

			function _checkPushedValueWithCurrentFilter(activeFilters, key, operation, newData) {
				var valeurCouranteFiltre = activeFilters[key];
				if (!valeurCouranteFiltre)
					return true;

				switch (operation.operator) {
					case 'none': return true;

					case 'disableupdate': return null;

					case 'equal': return valeurCouranteFiltre == newData[operation.field];
					case 'empty': return HELPER.Utils.isEmpty(newData[operation.field]);

					case 'like': return newData[operation.field].indexOf(valeurCouranteFiltre) == 0;
						//option : utilcou, permet de traiter l'utilisateur
					case 'in': return (',' + valeurCouranteFiltre + ',' + (operation.option && operation.option == 'utilcou' ? HELPER.User.getUser().identification.utilisateur.codePersonne : '') + ',').indexOf(',' + newData[operation.field] + ',') >= 0;
						//Permet de traiter la première valeur d'une colonne qui en renvoit plusieurs
					case 'in-partial': return (',' + valeurCouranteFiltre + ',').indexOf(',' + HELPER.Utils.getItem(newData[operation.field], 0, ';', false) + ',') >= 0;

					case 'selectionin': return (',' + newData[operation.field] + ',').indexOf(',' + this.tdbModel.currentSelection.val + ',') >= 0;
						//option : inmulti traitement des données séparées par une virgule
					case 'inmulti':
						var filterValue = valeurCouranteFiltre.split(',');
						var newDataValue = newData[operation.field].split(',');

						for (var i = 0; i < filterValue.length; i++) {
							if (newDataValue.indexOf(filterValue[i]) >= 0)
								return true;
						}
						return false;

					case 'inorin': var val = ',' + valeurCouranteFiltre + ',';
						return (val).indexOf(',' + newData[operation.field] + ',') >= 0
							|| (val).indexOf(',' + newData[operation.field2] + ',') >= 0;

					case 'dateequal': return HELPER.Utils.dateEqual(newData[operation.field], valeurCouranteFiltre);
					case 'datesup': return HELPER.Utils.dateIsSuperieur(newData[operation.field], valeurCouranteFiltre, true);
					case 'dateinf': return HELPER.Utils.dateIsInferieur(newData[operation.field], valeurCouranteFiltre, true);

					case 'between': return HELPER.Utils.dateTodayIsInPeriod(valeurCouranteFiltre.from, valeurCouranteFiltre.to, newData[operation.field]);
					case 'custom': return operation.fn(newDate[operation.field], valeurCouranteFiltre);

					default: throw new Error("Type d'operateur non supporté");
				}
				return false;
			}

			function _pushControleDeclaration() {
				//if (HELPER.User.getAppParameter('DevMode').toLowerCase() != 'true')
				//	return;

				var typeObj = $injector.get(vm.tdbModel.filterOpenerName + 'To');
				var obj = new typeObj({});
				obj.Rechercher_DateDebut = '';
				obj.Rechercher_DateFin = '';
				obj.Rechercher_Statut = '';
				var criteriaName = HELPER.Utils.objGetKeys(obj);
				var result = '';
				for (var i = 0; i < criteriaName.length; i++) {
					var criteriaInfo = vm.tdbModel.criteriaAvailables[criteriaName[i]];
					if (!criteriaInfo) {
						result += '\r\n Criteria absent de la declaration:' + criteriaName[i];
						continue;
					}

					var operator = ['none', 'equal', 'empty', 'like', 'in', 'in-partial', 'inorin', 'datesup', 'dateinf', 'between', 'inmulti', 'selectionin', 'dateequal', 'disableupdate'];
					if (operator.indexOf(criteriaInfo.operator) == -1) {
						result += '\r\n Criteria dont l\'operator est inconnu:' + criteriaName[i];
						continue;
					}

					if (criteriaInfo.operator == 'none' || criteriaInfo.operator == 'disableupdate' || criteriaInfo.operator == 'selectionin')
						continue;

					var field = HELPER.Array.findFirstFromProperty(vm.tdbModel.columnDefs, 'field', criteriaInfo.field);
					if (!field) {
						result += '\r\n Criteria dont le field n\'est pas déclaré:' + criteriaName[i];
						continue;
					}
				}

				if (result != '') HELPER.Dialog.showErrorMessage('TXT_ERREUR', result);

			}

			function _pushInitialisation() {
				if (vm.tdbModel.pushSupported) {
					vm._pushControleDeclaration();
					vm.tdbModel.pushRegistered = true;
					var groups = null;
					if (vm.tdbModel.pushSiteColumn) {
						groups = HELPER.User.getUser().identification.codesSitesAutorises.split(',');
						groups.push('##TOUS##');
					}
					HELPER.Push.addFunctionOnServerPush(vm.tdbModel.tdbType, vm._pushTdbReceive, false,
						vm.tdbModel.verrouConf ? vm.tdbModel.verrouConf.name : undefined,
						vm.tdbModel.verrouConf ? vm._pushTdbVerrouReceive : undefined, groups);
				}
			}



			function _pushTdbVerrouReceive(pushVerrouTo) {
				var items = HELPER.Array.findFromProperty(vm.datasource, vm.tdbModel.verrouConf.fieldKey, pushVerrouTo.id);
				//Remettre propre sans element en dure
				HELPER.Array.forEach(items, function (item) {
					item[vm.tdbModel.verrouConf.fieldInfo] = pushVerrouTo.verrouInformation;
					HELPER.Grid.refreshCellDisplay(vm.gridOptions, item, vm.tdbModel.verrouConf.fieldInfo);
				});
			}

			function _pushTdbReceive(resultTo, tdbType, isUserPush) {

				if (vm.tdbModel.status != 'READY')
					return;

				var resultTransformed = resultTo.data ? vm._transformResult(resultTo.data) : [];
				var needRefreshGrid = false;
				var needRefreshSelection = false;

				if (resultTo.isResultMonoDataPush) {
					for (var i = 0; i < resultTransformed.length ; i++) {
						var itemInTdb = HELPER.Array.findFirstFromProperty(vm.datasource, vm.tdbModel.tdbKey, resultTransformed[i][vm.tdbModel.tdbKey]);
						if (itemInTdb) {
							for (var l_intProp = 1; l_intProp < resultTo.data.keys.length; l_intProp++) {
								var prop = resultTo.data.keys[l_intProp];
								itemInTdb[prop] = resultTransformed[i][prop];
							}
							HELPER.Grid.refreshRowDisplay(vm.gridOptions, itemInTdb, true);
						}
					}
					return;
				}

				for (var i = 0; i < resultTo.itemDeleteId.length; i++) {
					var itemInTdb = HELPER.Array.findFirstFromProperty(vm.datasource, vm.tdbModel.tdbKey, resultTo.itemDeleteId[i]);
					if (itemInTdb) {
						if (isUserPush) { // Dans le cas d'un push venant de notre utilisateur il faut supprimer la ligne et ne pas la desactivé
							HELPER.Array.removeItem(vm.datasource, itemInTdb);
							needRefreshGrid = true;
						}
						else {
							itemInTdb._disabledRow = true;
							HELPER.Grid.refreshRowDisplay(vm.gridOptions, itemInTdb, true);
						}

						// TODO: Scenario selection multiple
						if (vm.tdbModel.currentTdbItem && vm.tdbModel.currentTdbItem[vm.tdbModel.tdbKey] == resultTo.itemDeleteId[i])
							needRefreshSelection = true;
					}
				}

				for (var i = 0; i < resultTransformed.length ; i++) {
					var result = vm._addOrUpdateTdbItemIfMeetCriteria(resultTransformed[i], true, isUserPush);

					// TODO: Scenario selection multiple
					if (vm.tdbModel.currentTdbItem && vm.tdbModel.currentTdbItem[vm.tdbModel.tdbKey] == resultTransformed[i][vm.tdbModel.tdbKey])
						needRefreshSelection = true

					if (result == 'INSERT')
						needRefreshGrid = true;
				}

				if (needRefreshGrid == true)
					HELPER.Grid.refreshGridDisplay(vm.gridOptions, null, true);

				if (needRefreshSelection == true)
					vm._refreshSelectedItemInTdb(false);
			}



			function _pushDestroy() {
				vm.tdbModel.status = 'DESTROY';
				if (vm.tdbModel.pushRegistered) {
					vm.tdbModel.pushRegistered = false;
					HELPER.Push.removeFunctionOnServerPush(vm.tdbModel.tdbType, vm._pushTdbReceive,
							vm.tdbModel.verrouConf ? vm.tdbModel.verrouConf.name : undefined,
							vm.tdbModel.verrouConf ? vm._pushTdbVerrouReceive : undefined);
				}
			}

		}


		return TdbManagerBase;
	});

})();
