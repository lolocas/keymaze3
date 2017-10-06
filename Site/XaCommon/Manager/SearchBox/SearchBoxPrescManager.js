(function () {
    'use strict';

    angular.module('XaCommon').factory('SearchBoxPrescManager', function (GridColumnModel, HELPER,  TdbItemModel, SearchboxTo, searchBoxAction, $q) {

        // prescType = prescripteur/medecintraitant/destinataire (utilisé pour changer le titre de la fenêtre)
        function SearchBoxPrescManager(prescType, enableCreateEdit, opts) {
            if (prescType != 'prescripteur' && prescType != 'medecintraitant' && prescType != 'destinataire')
                throw new Error("Parametre pour SearchBoxPrescManager incorrect fournir prescType= prescripteur/medecintraitant/destinataire");

            this.enableCreateEdit = enableCreateEdit == true;

            this.prescType = prescType;
            this.opts = opts;

            this.searchFn = function (query) {
                var columns = _.map(this.columns, function (item) { return item.field; });
                columns.push('id'); columns.push('libelleDisplay');
                if (opts && opts.extraFields)
                	columns = HELPER.Array.joinArrays(columns, opts.extraFields);

                var data = {
                    Type: 'Presc',
                    RequestedColumns: columns,
                    Criteria: { Rechercher_Pattern: query, Rechercher_ToutesDates: false }
                };

           
                return HELPER.Api.callApiApplication('Tdb', 'getList', data).then(function (resultFromServer) {
                   return HELPER.Utils.convertTdbArrayToType(resultFromServer, TdbItemModel);
                });
           

            };

            this.columns = [new GridColumnModel({ field: 'PRESC_NOM', displayName: 'TXT_NOM' }),
                            new GridColumnModel({ field: 'PRESC_PRENOM', displayName: 'TXT_PRENOM' }),
                            new GridColumnModel({ field: 'PRESC_SPECIALITE', displayName: 'TXT_SPECIALITE' }),
							new GridColumnModel({ field: 'PRESC_ADRESSE1', displayName: 'TXT_ADRESSE' }),
                            new GridColumnModel({ field: 'PRESC_CODPOS', displayName: 'TXT_CODE_POSTAL_SHORT', width: '120px' }),
                            new GridColumnModel({ field: 'PRESC_VILLE', displayName: 'TXT_VILLE' })];

            this.formatFn = function (entity) {
                return entity["libelleDisplay"];
            }

            this.searchPattern = HELPER.Utils.getLabel('TXT_SEARCHBOX_PRESCRIPTEUR');

            this.maxRows= 99;

            this.OpenDetailAndRefreshSearchBox = OpenDetailAndRefreshSearchBox;
      
            this.customActions = [];

            if (enableCreateEdit && HELPER.User.hasRight('PRESCRIPTEUR_EDITION_EDITION')) {
            	this.customActions.push(new searchBoxAction('XaCommon/img/ConsultSearchbox.png', 'whenSelected', 'TXT_CONSULTER', this.OpenDetailAndRefreshSearchBox, 'whenReadonly'));
            	this.customActions.push(new searchBoxAction('XaCommon/img/EditSearchbox.png', 'whenSelected', 'TXT_EDITION', this.OpenDetailAndRefreshSearchBox, 'whenEdit'));
            	this.customActions.push(new searchBoxAction('XaCommon/img/add_20px.png', 'whenSearch', 'TXT_CREATION', this.OpenDetailAndRefreshSearchBox, 'whenEdit'));
            }
            else {
            	this.customActions.push(new searchBoxAction('XaCommon/img/ConsultSearchbox.png', 'whenSelected', 'TXT_CONSULTER', this.OpenDetailAndRefreshSearchBox, 'whenEditAndReadonly'));
            }

            var ctxManager = this;

            function OpenDetailAndRefreshSearchBox(valeurSelectionnee) {
                var ctxCtrl = this;

                var otherOptions = null;
                var modeOuverture = '';
                var prescType = ctxManager.prescType.toUpperCase();
                var idPrescripteur = (valeurSelectionnee != null) ? valeurSelectionnee.id : null;

                    modeOuverture = 'CONSULT';
                if (ctxManager.enableCreateEdit && HELPER.User.hasRight('PRESCRIPTEUR_EDITION_EDITION'))
                	modeOuverture = (valeurSelectionnee != null) ? 'EDIT' : 'CREATE';

                if (modeOuverture == 'CREATE')
                {
                	otherOptions = {};
                	var tmp = ctxCtrl.selectedText.split(',');
                	if (tmp.length > 1) {
                    	otherOptions.nomPourCreation =  tmp[0] || '';
                	    otherOptions.prenomPourCreation =  tmp[1] || '';;
                	}
                }

                var window = HELPER.Form.openWindow('PrescripteurFiche', idPrescripteur, prescType,  modeOuverture, otherOptions);

                window.then(
                    function onWindowClose(resultTo) {
                        if (resultTo.success)
                            return HELPER.Api.callApiApplication('Tdb', 'getSearchboxValue', { tdbType: 'Presc', id: resultTo.data }, SearchboxTo)
                    })
                .then(
                    function refreshSearchBoxValue(searchboxTo) {
                        if (searchboxTo != null) {
                            ctxCtrl.selectedValue = searchboxTo;

                            if (ctxManager.didChange)
                                ctxManager.didChange(ctxCtrl.selectedValue);
                        }
                    })
            }

      
        }

        return SearchBoxPrescManager;
    });

})();

