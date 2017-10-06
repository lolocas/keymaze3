(function () {
	'use strict';

	angular.module('XaCommon').factory('SearchBoxPatientManager', function (HELPER, SesamHelper, GridConfigModel, GridColumnModel, TdbItemModel, SearchboxTo, searchBoxAction) {

		function SearchBoxPatientManager(enableCreateEdit, opts) {
			var ctxManager = this;

			this.enableCreateEdit = enableCreateEdit == true;

			this.opts = opts;
			this.isLectureCV = false;


			this.searchFn = function (query, queryIsNumdos) {
				var extraCriteria = {};
				if (!queryIsNumdos && ctxManager.beforeSearchFn && ctxManager.beforeSearchFn(query, extraCriteria) === false) {
					return HELPER.Utils.emptyPromise([], false);
				}

				var columns = _.map(ctxManager.gridSettings.columnDefs.columns, function (item) { return item.field; });

				columns.push('id'); columns.push('libelleDisplay');
				if (opts && opts.extraFields)
					columns = HELPER.Array.joinArrays(columns, opts.extraFields);

				var criteria = (queryIsNumdos === true) ? { Rechercher_Key: query } : _.extend({ Rechercher_Pattern: query }, extraCriteria);
				var data = {
					Type: 'Patient',
					RequestedColumns: columns,
					Criteria: criteria
				};

				return HELPER.Api.callApiApplication('Tdb', 'getList', data).then(function (resultFromServer) {
					var result = HELPER.Utils.convertTdbArrayToType(resultFromServer, TdbItemModel);
					ctxManager.isLectureCV = false;
					if (queryIsNumdos === true)
						return result[0];
					else
						return result;
				});
			};


			this.gridSettings = new GridConfigModel({
				sortInfo: [{ field: 'PATIENT_NOMPAT', direction: 'asc' }, { field: 'PATIENT_PNOPAT', direction: 'asc' }],
				showGridHeader: true,
				showGroupPanel: true,
				showColumnOptions: true,
				hideDefaultHeaderButtons: true,
				gridName: 'GRIDSEARCHPATIENT',
				datasource: function () { },
				columnDefs: [
                       new GridColumnModel({ field: 'PATIENT_NOMPAT', displayName: 'TXT_NOM' }),
                       new GridColumnModel({ field: 'PATIENT_PNOPAT', displayName: 'TXT_PRENOM' }),
                       new GridColumnModel({ field: 'PATIENT_NJFPAT', displayName: 'TXT_NOM_NAISSANCE' }),
                       new GridColumnModel({ field: 'PATIENT_DATNAI', displayName: 'TXT_DATE_NAISSANCE', type: 'date' }),
                       new GridColumnModel({ field: 'PATIENT_VILLE', displayName: 'TXT_VILLE' }),
                       new GridColumnModel({ field: 'PATIENT_CODPOS', displayName: 'TXT_CODE_POSTAL_SHORT', width: '70px' }),
                       new GridColumnModel({ field: 'PATIENT_NUMPER', displayName: 'TXT_IPP', width: '90px' }),
                       new GridColumnModel({ field: 'PATIENT_NUMPER_ORI', displayName: 'TXT_ORIGINE_IPP', width: '70px' })
				]

			});
			this.gridSettings.handlers.onGetRowStyle = function (row) { if (row.PATIENT_COULEUR != "") return 'background-color: ' + row.PATIENT_COULEUR };



			this.formatFn = function (entity) {
				return entity["libelleDisplay"];
			}

			this.searchPattern = HELPER.Utils.getLabel('TXT_NOM') + ',' + HELPER.Utils.getLabel('TXT_PRENOM') + ',' + HELPER.Utils.getLabel('TXT_DATE_NAISSANCE') + ' (' + HELPER.Utils.getLabel('TXT_OU') + ' ' + HELPER.Utils.getLabel('TXT_IPP') + ' ' + HELPER.Utils.getLabel('TXT_OU') + ' ' + HELPER.Utils.getLabel('TXT_NUM_SEJOUR') + ')';

			this.maxRows = 99;

			this.OpenDetailAndRefreshSearchBox = OpenDetailAndRefreshSearchBox;
			this.LireCarteVitale = LireCarteVitale;
			this.RechercheAvancee = RechercheAvancee;

			this.customActions = [];
			this.customActions.push(new searchBoxAction('XaCommon/img/LoupePlus.png', 'whenSearch', 'TXT_RECHERCHE_AVANCEE', this.RechercheAvancee, 'whenEdit'));
			if (this.enableCreateEdit) {
				if (!(opts && opts.hideConsult))
					this.customActions.push(new searchBoxAction('XaCommon/img/ConsultSearchbox.png', 'whenSelected', 'TXT_CONSULTER', this.OpenDetailAndRefreshSearchBox, 'whenReadonly'));
				if (!(opts && opts.hideEdit))
					this.customActions.push(new searchBoxAction('XaCommon/img/EditSearchbox.png', 'whenSelected', 'TXT_EDITION', this.OpenDetailAndRefreshSearchBox, 'whenEdit'));
				this.customActions.push(new searchBoxAction('XaCommon/img/add_20px.png', 'whenSearch', 'TXT_CREATION', this.OpenDetailAndRefreshSearchBox, 'whenEdit'));
			}
			else {
				if (!(opts && opts.hideConsult))
					this.customActions.push(new searchBoxAction('XaCommon/img/ConsultSearchbox.png', 'whenSelected', 'TXT_CONSULTER', this.OpenDetailAndRefreshSearchBox, 'whenEditAndReadonly'));
			}

			if (opts && opts.lectureSesamVitale) {
				this.customActions.push(new searchBoxAction('XaCommon/img/Sesam/SesameVitale20.png', 'whenSearch', 'TXT_CARTE_VITALE', this.LireCarteVitale, 'whenEdit'));
			}


			if (opts && opts.initialText)
				this.initialText = opts.initialText;



			function OpenDetailAndRefreshSearchBox(valeurSelectionnee, ctxCtrlSource, createPatternSource) {
				var ctxCtrl = ctxCtrlSource || this;
				var otherOptions = null;
				var modeOuverture = '';
				var idPatient = (valeurSelectionnee != null) ? valeurSelectionnee.id : null;
				if (!ctxManager.enableCreateEdit || ctxCtrl.canedit === false)
					modeOuverture = 'CONSULT';
				else
					modeOuverture = (valeurSelectionnee != null) ? 'EDIT' : 'CREATE';


				if (modeOuverture == 'CREATE') {
					var createPatternString = createPatternSource || ctxCtrl.selectedText
					var tmp = (createPatternString ? createPatternString.split(',') : '');
					if (otherOptions == null)
						otherOptions = {};

					if (tmp.length == 3) {
						otherOptions.nomPourCreation = tmp[0] || '';
						otherOptions.prenomPourCreation = tmp[1] || '';
						otherOptions.dateNaissancePourCreation = tmp[2] || '';
					}
					else if (tmp.length == 2) {
						otherOptions.nomPourCreation = tmp[0] || '';
						otherOptions.prenomPourCreation = tmp[1] || '';
					}
					else if (tmp.length == 1) {
						otherOptions.nomPourCreation = tmp[0] || '';
					}
				}

				if (ctxManager.opts && ctxManager.opts.dateReferenceFunction) {
					if (otherOptions == null)
						otherOptions = {};
					otherOptions.dateReference = ctxManager.opts.dateReferenceFunction();
				}

				var window = HELPER.Form.openWindow('PatientFiche', idPatient, modeOuverture, otherOptions);

				window.then(
                    function onWindowClose(resultTo) {
                    	if (resultTo.success)
                    		return ctxManager.searchFn(resultTo.data, true);
                    })
                .then(
                    function refreshSearchBoxValue(searchboxTo) {
                    	if (searchboxTo != null) {
                    		var oldValue = ctxCtrl.selectedValue;
                    		ctxCtrl.selectedValue = searchboxTo;
                    		if (ctxManager.didChange)
                    			ctxManager.didChange(ctxCtrl.selectedValue, oldValue);
                    	}
                    })
			}


			function LireCarteVitale() {
				var l_dteReference = new Date(2012, 5, 1); //Date de lecture par défaut pour la facturation 01/06/2012
				var l_strCurrentSite = '';
				if (ctxManager.opts && ctxManager.opts.currentSiteFunction) {
					l_strCurrentSite = ctxManager.opts.currentSiteFunction();
					if (opts.currentSiteObligatoire && HELPER.Utils.isEmptyOrWhitespace(l_strCurrentSite)) {
						HELPER.Dialog.showErrorMessage('TXT_ERREUR', HELPER.Utils.getLabel('TXT_RECHERCHE_PATIENT_SITE_OBLIGATOIRE'));
						return false;
					}
				}
				var ctxCtrl = this;
				var l_objRessources = SesamHelper.getDefautLecteurRessources();
				var optsCV = { dateReference: l_dteReference, autoriseSansCPS: true, currentSite: l_strCurrentSite };
				var promiss = SesamHelper.lireCarteVitale(l_objRessources.CPS, l_objRessources.Log_SV, true, optsCV)
                .then(
                    function onWindowClose(resultTo) {
                    	if (resultTo.success && resultTo.data && resultTo.data.numdos) {
                    		return ctxManager.searchFn(resultTo.data.numdos, true);
                    	}
                    })

                .then(
                function refreshSearchBoxValue(searchboxTo) {
                	if (searchboxTo != null) {
                		var oldValue = ctxCtrl.selectedValue;
                		ctxCtrl.selectedValue = searchboxTo;
                		ctxManager.isLectureCV = true;
                		if (ctxManager.didChange)
                			ctxManager.didChange(ctxCtrl.selectedValue, oldValue);
                	}
                })
			}

			function RechercheAvancee() {
				var ctxCtrl = this;
				var extraCriteria = {};
				var extraFields = ctxManager.opts && ctxManager.opts.extraFields ? ctxManager.opts.extraFields : [];
				if (ctxManager.beforeSearchFn && ctxManager.beforeSearchFn(ctxCtrl.selectedText, extraCriteria) === false)
					return;

				var window = HELPER.Form.openWindow('PatientRechercheAvancee', ctxCtrl.selectedText, extraCriteria, extraFields);
				window.then(
                  function onWindowClose(resultTo) {
                  	if (resultTo.success) {
                  		if (resultTo.data.action == 'select')
                  			return resultTo.data.patientInfo;
                  		else if (resultTo.data.action == 'add') {
                  			return ctxManager.OpenDetailAndRefreshSearchBox(null, ctxCtrl, resultTo.data.patientPattern);
                  		}
                  	}
                  })
              .then(
                  function refreshSearchBoxValue(searchboxTo) {
                  	if (searchboxTo != null) {
                  		var oldValue = ctxCtrl.selectedValue;
                  		ctxCtrl.selectedValue = searchboxTo;
                  		if (ctxManager.didChange)
                  			ctxManager.didChange(ctxCtrl.selectedValue, oldValue);
                  	}
                  })
			}

		}


		return SearchBoxPatientManager;
	});

})();

