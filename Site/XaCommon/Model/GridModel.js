(function () {
	'use strict';

	angular.module('XaCommon')

		/*.factory('GridModelFactory', function (xaTranslation, HELPER_UTILS, GridColumnModel, GridConfigModel ) {
			return {
				GridColumnModel: GridColumnModel,
				GridConfigModel: GridConfigModel
			}
		})*/

		.factory('GridColumnModel', function (HELPER, ViewerService) {

			function GridColumnModel(data) {
				this.field = data.field;
				this.fieldFn = data.fieldFn;
				this.displayName = HELPER.Utils.getLabel(data.displayName);
				this.cellClass = data.cellClass;
				this.sortable = data.sortable;
				this.groupable = data.groupable;
				this.width = data.width;
				this.type = data.type;
				this.typeArg = data.typeArg;
				this.visible = data.visible == undefined ? true : data.visible;
				this.enableCellEdit = data ? data.enableCellEdit : false;
				this.editorSettings = data.editorSettings;
				this.buttons = data.buttons;
				this.formatter = data.formatter;
				this.tooltip = (data && data.tooltip) ? HELPER.Utils.getLabel(data.tooltip) : null;
				this.minWidth = data.minWidth;
				this.resizable = data.resizable;
				this.headerCssClass = data.headerCssClass;
				this.alwaysShow = data.alwaysShow;
				this.alwaysFirst = data.alwaysFirst;
				this.focusable = data.focusable;

				this.maxGridButtons = data.maxGridButtons;
				this.exportDisplayName = data.exportDisplayName;
				this.exportFieldFn = data.exportFieldFn;

				this.cellFilter = data.cellFilter;
				this.imagePath = data.imagePath;
				this.imageHeight = data.imageHeight;

	
				if (data.summaryGroupRowType && ['avg', 'sum', 'min', 'max', 'count'].indexOf(data.summaryGroupRowType) == -1)
					throw new Error('La propriété summaryGroupRowType ne peut être prendre que la valeur sum, avg, min, max, count pour un champs date');
			
				switch (this.type) {
					case 'date':
						this.cellFilter = 'XaFilterDate';
						this.width = this.width ? this.width : '85px';
						this.summaryGroupRowType = data.summaryGroupRowType;
						if (this.width == '*')
							this.width = '';
						break;

					case 'dateaveccommentaire':
						this.cellFilter = 'XaFilterDateAvecCommentaire';
						this.width = this.width ? this.width : '110px';
						break;

					case 'datetime':
					case 'dateheure':
						this.cellFilter = 'XaFilterDateTime';
						this.groupFilter = 'XaFilterDate';
						this.width = this.width || '120px';
						this.groupAggregatorFn = function (value, row, column) {
							return HELPER.Utils.convertToDate(value);
						}
						this.sortValueFn = function (value, row, column) {
							var time = row[column.typeArg] || '00:00';
							var date = value || HELPER.Utils.dateEmpty().toISOString();
							if (date.toISOString) date = date.toISOString();
							return date + time;
						}

						break;

					case 'dateavecjour':
						this.cellFilter = 'XaFilterDateAvecJour';
						this.width = this.width || '200px';
						break;

					case 'time': case 'heure':
					    this.cellFilter = 'XaFilterTime';
						this.width = this.width || '70px';
						break;

				    case 'distance':
				        this.cellFilter = 'XaFilterDistance';
				        this.width = this.width || '70px';
				        break;

					case 'nombre':
						this.cellFilter = 'XaFilterNombre';
						this.width = this.width || '85px';
						this.cellClass = 'grid-cell-nombre';
						this.summaryGroupRowType = data.summaryGroupRowType;


						break;

					case 'nombreentier':
						this.cellFilter = 'XaFilterNombreEntier';
						this.width = this.width || '85px';
						this.cellClass = 'grid-cell-nombre';
						this.summaryGroupRowType = data.summaryGroupRowType;



						break;

					case 'montant':
						this.cellFilter = 'XaFilterMontant';
						this.width = this.width || '95px';
						this.cellClass = 'grid-cell-montant';
						this.summaryGroupRowType = data.summaryGroupRowType;
						break;

					case 'telephone':
						this.cellFilter = 'XaFilterTelephone';
						this.width = this.width || '110px';
						break;

					case 'age':
						this.cellFilter = 'XaFilterAge';
						this.width = this.width || '85px';
						this.groupable = false;
						break;


					case 'image':
						if (HELPER.Utils.isEmpty(this.typeArg))
							break;
						// Upper case necessaire pour la récupération des libellés tooltip
						this.typeArg = this.typeArg.toUpperCase();
						this.cellFilter = 'XaFilterValeurToImage';
						this.cellClass = 'grid-cell-image';
						this.width = this.width ? this.width : '80px';
						break;

					case 'image_application':
						if (HELPER.Utils.isEmpty(this.typeArg))
							break;
						// Upper case necessaire pour la récupération des libellés tooltip
						this.typeArg = this.typeArg.toUpperCase();
						this.cellFilter = 'XaFilterValeurToImageApplication';
						this.cellClass = 'grid-cell-image';
						this.width = this.width ? this.width : '80px';
						break;


				    case 'image_advanced':
				        this.cellFilter = 'XaFilterValeurToImageAdvanced';
				        this.cellClass = 'grid-cell-image';
				        this.width = this.width ? this.width : '80px';
				        break;

					case 'boolean':
						this.cellFilter = 'XaFilterBooleanToImage';
						this.cellClass = 'grid-cell-image';
						this.width = this.width ? this.width : '80px';
						break;

					case 'checkbox':
						this.cellFilter = 'XaFilterValeurToCheckbox';
						this.groupable = false;
						if (!this.typeArg) {
							this.cellClass = 'grid-cell-image';
							this.width = this.width ? this.width : '65px';
							this.typeArg = { code: 'check' };
							if (HELPER.Utils.isEmptyOrWhitespace(this.displayName))
								this.displayName = HELPER.Utils.getLabel('TXT_SELECTION_SHORT');
						}
                        else
						    this.width = this.width ? this.width : '41px';

						if (this.typeArg.hasHeaderImage) {
							this.headerFormatter = function (col, grid) {
								var cssClass = '';
								if (col.typeArg.enableSelectAll) cssClass = 'headeraction';

								return '<img class="' + cssClass + '" src="XaCommon/Img/' + col.typeArg.code + '_false.png" />';
							}
						}


						break;


					case '0widthgroupable':
						this.displayName = '',
						this.width = '0px';
						this.minWidth = '0px';
						this.resizable = false;
						this.headerCssClass = 'zero-width';
						this.focusable = false;
						break;


					case 'action':
						this.width = this.width || '100px';
						this.groupage = false;
						this.sortable = false;
						this.alwaysShow = this.alwaysShow !== false;
						if (HELPER.Utils.isEmptyOrWhitespace(this.displayName))
							this.displayName = HELPER.Utils.getLabel('TXT_ACTION');

						break;

					case 'libelle':
						if (HELPER.Utils.isEmpty(this.typeArg))
							break;

						// Upper case necessaire pour la récupération des libellés
						this.typeArg = this.typeArg.toUpperCase();
						this.cellFilter = 'XaFilterValeurToLibelle';
						break;

					case 'pastille':
						if (HELPER.Utils.isEmpty(this.typeArg))
							break;
						this.cellClass = 'grid-cell-image';
						this.headerCssClass = 'grid-cell-image';
						this.cellFilter = 'XaFilterValeurToPastilleFromField';
						break;

					case 'imagefix':
						if (HELPER.Utils.isEmpty(this.typeArg))
							break;
						this.cellFilter = 'XaFilterValeurToImageFix';
						this.cellClass = 'grid-cell-image';
						this.width = this.width ? this.width : '80px';
						break;

					case 'multitype':
						this.cellFilter = 'XaFilterValeurToMultiType';
						this.width = this.width ? this.width : '150px';

						break;

					case 'imageavecommentaire':
						if (HELPER.Utils.isEmpty(this.typeArg))
							break;
						this.cellFilter = 'XaFilterValeurToImageAvecCommentaire';
						this.cellClass = 'grid-cell-image';
						this.width = this.width ? this.width : '80px';
						break;

					case 'couleur':
						this.cellFilter = 'XaFilterValeurToCouleur';
						break;

					case 'cr':
						this.width = this.width ? this.width : '100px';
						this.cellFilter = 'XaFilterValeurToExamenCrStatus';
						data.clickFunction = function applyClickOnCrColumn(row, classId, col) { HELPER.Form.openWindow('ExamenListCR', row[col.typeArg]); };
						break;

					case 'pj':
						this.width = this.width ? this.width : '60px';
						this.cellClass = 'grid-cell-image';
						this.cellFilter = 'XaFilterValeurToExamenPjStatus';
						data.clickFunction = function applyClickOnPjColumn(row, classId, col, grid) {
							HELPER.Form.openWindow('FichiersAttaches', 'EXAMEN', col.typeArg.modeOuverture, row[col.typeArg.idExamenField]).then(reloadCell);

							function reloadCell() {
								if (col.typeArg.modeOuverture == 'EDIT')
									HELPER.Api.callApiApplication('FichiersAttaches', 'GetNbFichiersAttachesByIdExamen', row[col.typeArg.idExamenField]).then(function (result) {
										row[col.field] = result;
										grid.refreshItem(row);
									});
							}
							
						};
						break;

					case 'imageviewer':
						this.width = this.width ? this.width : '50px';
						this.cellFilter = 'XaFilterValeurToImageViewerStatus';
						data.clickFunction = function applyClickOnImageColumn(row, classId, col) {
						    ViewerService.openViewerForExamen(row[col.typeArg]);
						};
						break;

					case 'commentairedemande':
						this.width = this.width ? this.width : '50px';
						this.cellFilter = 'XaFilterValeurToCommentaireDemande';
						if (HELPER.Utils.isEmptyOrWhitespace(this.displayName))
							this.displayName = HELPER.Utils.getLabel('TXT_COMMENTAIRE');

						data.clickFunction = function applyClickOnCrColumn(row, classId, col, gridOptions) {
							HELPER.Form.openWindow('CommentairesFiche', row[col.typeArg]).then(function (result) {
								if (result.success) {
									if (result.data && result.data.length > 0)
										row[col.field] = true;
									else
										row[col.field] = false;

									HELPER.Grid.refreshRowDisplay(gridOptions, row);
								}
							});

						};

						break;

					case 'email':
						this.cellFilter = 'XaFilterValeurToEmail';
						break;

				}

				// Gestion des tailles minimales de colonnes
				if (this.minWidth == undefined) {
					if (this.width)
						this.minWidth = this.width;
					else
						this.minWidth = '70px';
				}



				if (this.enableCellEdit == true) {
					switch (this.type) {
						case 'montant':
							this.editorSettings = this.editorSettings || {};
							this.editorSettings.nbDecimal = 2;
							this.editorSettings.type = 'montant';
							break;

						case 'nombre':
							this.editorSettings = this.editorSettings || {};
							this.editorSettings.nbDecimal = this.typeArg;
							this.editorSettings.type = 'nombre';
							break;

						case 'nombreentier':
							this.editorSettings = this.editorSettings || {};
							this.editorSettings.nbDecimal = 0;
							this.editorSettings.type = 'nombre';
							break;

						case 'date':
							this.editorSettings = this.editorSettings || {};
							this.editorSettings.type = 'date';
							break;

						case 'heure': case 'time':
							this.editorSettings = this.editorSettings || {};
							this.editorSettings.type = 'heure';
							break;

						case 'couleur':
							this.editorSettings = this.editorSettings || {};
							this.editorSettings.type = 'color';
							break;

						case 'multitype':
							this.editorSettings = this.editorSettings || {};
							this.editorSettings.type = 'multitype';
							this.editorSettings.autoOpenCombo = true;
							break;

						case 'checkbox':
							break;

						default:
							this.editorSettings = this.editorSettings || {};
							this.editorSettings.type = 'string';
							break;

							/*  case 'date':
							 this.cellFilter = ' <input ng-class="'colt' + col.index" ng-input="COL_FIELD" />';
							 break;*/
					}

				}

				if (data.clickFunction) {
					this.buttons = this.buttons || [];
					this.buttons.push({ args: data.typeArg, filter: data.filter || this.cellFilter, click: data.clickFunction });
					//this.cellTemplate = this.getCustomCell(data.filter, data.clickFunction);
					//this.filter = data.fitlter;
				}
			};

			GridColumnModel.prototype.setClickFunction = function (func, clickability) {
				this.buttons = this.buttons || [];
				this.buttons.push({ args: this.typeArg, filter: this.filter || this.cellFilter, click: func, visibilityFn: clickability });
			}

		

			return GridColumnModel;
		})


		.factory('GridActionModel', function (HELPER) {

			var GridActionModel = function (src) {
				HELPER.Utils.extendPropFrom(this, src);
			};

			return GridActionModel;
		})



		.factory('GridConfigModel', function (HELPER, ExportGridService, GridColumnCollection, $rootScope) {

			var GridConfigModel = function (data) {

				if (HELPER.Utils.isEmpty(data.datasource) || HELPER.Utils.isUndefined(data.columnDefs))
					throw new Error("une propriété datasource et columnDefs doivent absolument être transmise lors de la création d'un objet GridConfigModel");

				this.title = data ? data.title : '';
				this.footer = data ? data.footer : '';
				this.data = data.datasource;

				// Supprimer les colonnes undefined.
				this.columnDefs = new GridColumnCollection(HELPER.Array.findFromFunction(data.columnDefs, function (item) { return item != null }));

				if (data.hideDefaultHeaderButtons === true) {
					this.gridButtons = [];
				}
				else {
					this.gridButtons = [
						   { imgUrl: 'XaCommon/Img/printer_small.png', click: function (gridOptions) { ExportGridService.printGrid(gridOptions); }, resourceKey: 'TXT_IMPRIMER' },
						   { imgUrl: 'XaCommon/Img/FileType/xls.png', click: function (gridOptions) { ExportGridService.exportGridXlsx(gridOptions); }, resourceKey: 'TXT_EXPORTER_EXCEL' },
						   { imgUrl: 'XaCommon/Img/FileType/pdf.png', click: function (gridOptions) { ExportGridService.exportGridPdf(gridOptions); }, resourceKey: 'TXT_EXPORTER_PDF' }
					];
				}

				this.noGroupingHeader = data && data.showGridHeader == false ? true : false;

				if (!HELPER.Utils.isUndefined(data.showGroupPanel) && this.noGroupingHeader != true)
					this.showGroupPanel = data.showGroupPanel;
				else
					this.showGroupPanel = false;

				if (!HELPER.Utils.isUndefined(data.afterSelectionChange))
					this.afterSelectionChange = data.afterSelectionChange;

				if (!HELPER.Utils.isEmpty(data.rowTemplate))
					this.rowTemplate = data.rowTemplate;

				this.enableRowSelection = true;
				this.selectionMode = data.enableMultiSelection === true ? 'multiple' : (data.selectionMode || 'single'); //none
				this.showColumnMenu = false;
				this.enableColumnResize = true;
				//this.i18n = HELPER.User.getAppParameter("Language", "fr-FR").substring(0, 2);
				this.fixed = true;
				this.groupsCollapsedByDefault = data.groupsCollapsedByDefault;
				this.quickSearchFields = data.quickSearchFields;

				this.groups = data ? data.groupInfo : [];
				this.sortInfo = data ? data.sortInfo : [];
				this.canedit = data.canedit;
				this.height = data.height;
				this.minheight = data.minheight;
				this.maxRows = data.maxRows;
				this.gridName = data.gridName;
				this.uniqueKey = data.uniqueKey;
				this.handlers = (data && data.handlers) ? data.handlers : {};
				this.keyRegistryColumnOption = data.keyRegistryColumnOption || 'GRD_DISPLAY';
				this.standAloneMode = false;
				this.showColumnOptions = (data && !HELPER.Utils.isUndefined(data.showColumnOptions)) ? data.showColumnOptions : false;
				this.showBulleAide = true;
				this.allowRowMove = data && !!data.allowRowMove ? true : false;
				this.selectFirstItemOnStart = data.selectFirstRowOnStart;
				this.rowHeight = data.rowHeight;
				this.exportIsDynamicRowHeight = data.exportIsDynamicRowHeight;
				this.exportFontSize = data.exportFontSize;
				this.hideCheckboxSelectAllButtons = data.hideCheckboxSelectAllButtons;
				this.fixedGridPresentation = data.fixedGridPresentation || null;   // Presentation de la fixe de la grille et desactivation de la personnalisation pour les dashboard statistiques.
				this.destroyFn = data.onDestroyFn;
				this.columnPersoFn = data.onColumnPersoFn;
				this.allowDeleteFromKeyboard = data.allowDeleteFromKeyboard;
				this.enableDeleteFromKeyboard = data.enableDeleteFromKeyboard;

				// Propriété utilisé pour le traveller du drag and drop et le message de confirmation.
				this.rowSummaryLabel = data.rowSummaryLabel;

				// Propriété d'une selection de ligne par defaut
				this.initalSelectedItem = data.initalSelectedItem;

				// Patch si virtualisation active, fonction présente mais on ne fait rient
				this.refreshGridDatasource = function () { }
				this.resizeFn = function () { }

				this.currentPrefrenceDisplayType = 'NONE';

				var ctxGrid = this;
				if (this.showColumnOptions == true) {
					var ctx = this;

					if (HELPER.Utils.isEmpty(this.gridName))
						throw new Error('Merci de donner une valeur à la propriété gridName si showColumnOptions = true');

					this.handlers.getUserPreferences = function () {
						// Dans un dashboard statistique, on a transmis un presentation fixe de la grille.
						if (ctxGrid.fixedGridPresentation != null)
							return ctxGrid.fixedGridPresentation;
							
						// Chargement de la preference utilisateur
						var pref = HELPER.User.getPreference(ctx.keyRegistryColumnOption, ctx.gridName, "");
						if (!HELPER.Utils.isEmpty(pref)) {
							ctx.currentPrefrenceDisplayType = 'USER';
							return HELPER.Utils.jsonToObject(pref);
						}
						else {
							// Chargement de la preference profil
							var pref = HELPER.User.getPreference(ctx.keyRegistryColumnOption, ctx.gridName, "", true);
							if (!HELPER.Utils.isEmpty(pref)) {
								ctx.currentPrefrenceDisplayType = 'PROFIL';
								return HELPER.Utils.jsonToObject(pref)
							}
							else {
								ctx.currentPrefrenceDisplayType = 'NONE';
								return null;
							}
						}
					}

					this.handlers.showTooltip = function (content, selector, clickFn) {
						HELPER.Form.openTooltip('GridTooltip', selector, content, clickFn);
					}

					this.gridButtons.unshift({
						imgUrl: 'XaFramework/Img/parametres24.png',
						click: function () {
							if (ctx.handlers.onBeforeShowColumnPersonnalisation)
								ctx.handlers.onBeforeShowColumnPersonnalisation();

							HELPER.Form.openWindow('GridConf', ctx.keyRegistryColumnOption, ctx.gridName, ctx.columnDefs.getColumnsForCustomization(), ctx.getCurrentDisplayState(), ctx.currentPrefrenceDisplayType, ctx.standAloneMode).then(function (result) {
								if (result.success) {
									if (ctx.handlers.customSetUserPreferences)
										ctx.handlers.customSetUserPreferences(result.data);

									ctx.columnDefs.refreshColumns();
									if (ctx.columnPersoFn)
										ctx.columnPersoFn();
								}
							});
						},
						resourceKey: 'TXT_PARAMETRAGE',
						visibilityFn: function (){ return  ctxGrid.fixedGridPresentation == null;}
					});

					// Evenement a realiser avant la personnalisation, permet à la searchbox 
					this.handlers.onBeforeShowColumnPersonnalisation = null;

					this.getCurrentVisibleColumnsName = function () {
						// Si la grille n'est pas chargé, on doit récupérer l'objet dans les préférences. Sinon on peut récupérér l'état de la grille.
						var preference = null
						if (ctx.getCurrentDisplayState)
							preference = ctx.getCurrentDisplayState();
						else {
							// si grille non chargé on est obigé de piocher dans les preferences.
							preference = ctx.handlers.getUserPreferences();

							if (preference) {
								// Récupération des colonnes always visible qui ont peut etre pas été stocké dans les préférences.
								preference.personalised = _.union(preference.personalised, HELPER.Array.mapProperty(
								HELPER.Array.findFromFunction(ctx.columnDefs.columns, function (col) {
									return col.alwaysShow == true || col.alwaysFirst == true
								}), 'field'));

								// Supprimer les colonnes qui ne sont plus disponibles
								HELPER.Array.removeItemsFromFunction(preference.personalised, function (name) {
									return name == '' || HELPER.Array.findFirstFromProperty(ctx.columnDefs.columns, 'field', name) == null;
								});
							}

						}

						var visibleColumns = null;
						if (preference != null) {
							// Fusion colonnes et bulle d'aide
							visibleColumns = _.union(preference.personalised, preference.bulle);
						}
						else {
							visibleColumns = HELPER.Array.mapProperty(
														HELPER.Array.findFromFunction(ctx.columnDefs.columns, function (col) {
															return col.alwaysShow == true || col.alwaysFirst == true || col.visible != false
														}), 'field');
						}
						return visibleColumns;
					}
				}


				//Colonne de type action
				var actionColumn = HELPER.Array.findFirstFromProperty(this.columnDefs.columns, 'type', 'action');
				if (actionColumn && HELPER.Array.isArray(actionColumn.typeArg)) {
					HELPER.Array.forEach(actionColumn.typeArg, function (item) {
						switch (item.code) {
							case 'patient':
								HELPER.Grid.addButtonActionInColumn(ctxGrid, actionColumn.field, 'XaCommon/Img/Patient20.png', 'TXT_CONSULTER_FICHE_PATIENT',
								function applyDetailFichePatient(row) {
									HELPER.Form.openWindow('PatientFiche', row[item.field], item.option ? item.option : 'CONSULT');
								},
								function (row) { return row && !HELPER.Utils.isEmptyOrWhitespace(row[item.field]) });
								break;
							case 'organisme':
								HELPER.Grid.addButtonActionInColumn(ctxGrid, actionColumn.field, 'XaCommon/Img/organisme_caisse20.png', 'TXT_ORGANISME',
								function applyDetailFichePatient(row) {
									HELPER.Form.openWindow('OrganismeFiche', row[item.field], null , item.option ? item.option : 'CONSULT');
								},
								function (row) { return row && !HELPER.Utils.isEmptyOrWhitespace(row[item.field]) });
								break;
							case 'prescripteur':
								HELPER.Grid.addButtonActionInColumn(ctxGrid, actionColumn.field, 'XaCommon/Img/Prescripteur20.png', 'TXT_WINDOW_PRESCRIPTEUR',
								function applyDetailFichePatient(row) {
									HELPER.Form.openWindow('PrescripteurFiche', row[item.field], 'PRESCRIPTEUR', 'CONSULT');
								},
								function (row) { return row && !HELPER.Utils.isEmptyOrWhitespace(row[item.field]) });
								break;

							case 'appelexterne':
								HELPER.Grid.addButtonActionInColumn(ctxGrid, actionColumn.field, 'XaCommon/Img/appelexterne_20px.png', 'TXT_APPEL_EXTERNE',
								function applyClickOnAppelExterneColumn(row, classId, col) {
									HELPER.Form.openTooltip('AppelExterne', classId, row[item.field]);
								},
								function (row) { return row && !HELPER.Utils.isEmptyOrWhitespace(row[item.field]) });
								break;

							case 'facturation':
								HELPER.Grid.addButtonActionInColumn(ctxGrid, actionColumn.field, 'XaCommon/Img/FeuilleSoins20.png', 'TXT_CONSULTER_FACTURE',
								function applyDetailFicheFacture(row) {
									HELPER.Form.openWindow('Facturation', row[item.field], item.option ? item.option : 'CONSULT');
								},
								function (row) { return row && !HELPER.Utils.isEmptyOrWhitespace(row[item.field]) });
								break;

						    case 'grillexml':
						        HELPER.Grid.addButtonActionInColumn(ctxGrid, actionColumn.field, 'XaCommon/Img/DonneesXML_20px.png', 'TXT_CONSULTER_FACTURE',
								function applyDetailFicheFacture(row) {
								    HELPER.Form.openWindow('GrillesXML', item.modeGrille ? item.modeGrille : 'EXAMEN', 'EDIT', row[item.field]);
								});
						        break;
						}
					});
				}

				// Bouton selectionner tous
				var checkBoxesColumn = [];
				checkBoxesColumn = HELPER.Array.findFromProperty(this.columnDefs.columns, 'type', 'checkbox');
				if (this.hideCheckboxSelectAllButtons !== true) {
					if (checkBoxesColumn.length == 1 && checkBoxesColumn[0].enableCellEdit == true && checkBoxesColumn[0].visible == true && ctxGrid.canedit == true) {
						this.gridButtons.unshift(
						   { imgUrl: 'XaCommon/Img/SelectTous.png', click: function () { changeAllCheckBoxValues(ctxGrid.data(), checkBoxesColumn[0], true) }, resourceKey: 'TXT_SELECTIONNER_TOUS' },
						   { imgUrl: 'XaCommon/Img/SelectAucun.png', click: function () { changeAllCheckBoxValues(ctxGrid.data(), checkBoxesColumn[0], false) }, resourceKey: 'TXT_SELECTIONNER_AUCUN' });
					}
				}

				// Déclation action sur checkbox
				HELPER.Array.forEach(checkBoxesColumn, setCheckBoxValue);
				function setCheckBoxValue(column) {
					if (column.type == 'checkbox' && column.enableCellEdit == true && ctxGrid.canedit == true) {
						column.setClickFunction(function (item) {
							var newValue = !HELPER.Utils.getValueFromStringProperty(item, column.field);
							changeCheckBoxValue(item, column, newValue, true);
							if (column.typeArg.unselectOthers == true && newValue == true) {
								changeAllCheckBoxValues(ctxGrid.data(), column, false, item);
							}
							HELPER.Grid.refreshRowDisplay(ctxGrid, item);

							// Faire un digest sur toute la fenêtre pour prise en charge du suivi des checkboxes
							if (!$rootScope.$$phase)
								$rootScope.$digest();

						});
					}
				}
				HELPER.Array.forEach(checkBoxesColumn, setSelectAllCheckBoxValue);
				function setSelectAllCheckBoxValue(column) {
					if (column.type == 'checkbox' && column.enableCellEdit == true && ctxGrid.canedit == true && column.unselectOthers != true && column.typeArg.enableSelectAll == true) {
						column.headerClick = function (a, b, column) {
							if (HELPER.Array.findFirstFromProperty(ctxGrid.data(), column.field, true) == null)
								changeAllCheckBoxValues(ctxGrid.data(), column, true);
							else
								changeAllCheckBoxValues(ctxGrid.data(), column, false);

						}
					}
				}


				// Function change all values
				function changeAllCheckBoxValues(gridData, column, value, exceptItem) {
					for (var i = 0; i < gridData.length; i++) {
						var item = gridData[i];
						if (exceptItem == item)
							continue;

						changeCheckBoxValue(item, column, value, i == data.length - 1);
					};

					HELPER.Grid.refreshGridDisplay(ctxGrid);

					// Faire un digest sur toute la fenêtre pour prise en charge du suivi des checkboxes
					if (!$rootScope.$$phase)
						$rootScope.$digest();
				}

				// Réalisation du changement de valeur
				function changeCheckBoxValue(item, column, value, lastValueFromBulk) {
					var oldValue = HELPER.Utils.getValueFromStringProperty(item, column.field);
					if (oldValue == value) return;

					if (column.typeArg.isEnabledFn && !column.typeArg.isEnabledFn(item, column))
						return;

					if (ctxGrid.handlers && ctxGrid.handlers.onBeforeEditCell)
						if (ctxGrid.handlers.onBeforeEditCell(item, column) == false)
							return;

					if (ctxGrid.handlers && ctxGrid.handlers.onCellChanging) {
						if (ctxGrid.handlers.onCellChanging(oldValue, value, item, column, lastValueFromBulk) == false)
							return;
					}

					HELPER.Utils.setValueFromStringProperty(item, column.field, value);
					if (ctxGrid.handlers && ctxGrid.handlers.onCellChange)
						ctxGrid.handlers.onCellChange(oldValue, item, column, lastValueFromBulk);
				}

			};

			return GridConfigModel;
		});
})();
