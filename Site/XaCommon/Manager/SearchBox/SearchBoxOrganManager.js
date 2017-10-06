(function () {
    'use strict';

    angular.module('XaCommon').factory('SearchBoxOrganManager', function (GridColumnModel, HELPER, TdbItemModel, SearchboxTo, searchBoxAction, $q) {

        //organType = caisse/mutuelle/both (utilisé pour changer le titre de la fenêtre)
        function SearchBoxOrganManager(organType, enableCreateEdit) {
            if (organType != 'caisse' && organType != 'mutuelle' && organType != 'both' && organType != undefined)
                throw new Error("Paramètre pour SearchBoxOrganManager incorrect fournir organType=caisse/mutuelle/both");

            this.enableCreateEdit = enableCreateEdit == true;

            this.organType = organType;
            if (HELPER.User.getAppParameter('CodePaysTelephone') == 'FR')
            {
            	this.columns = [new GridColumnModel({ field: 'ORGAN_CODE', displayName: 'TXT_CODE', width: '120px' }),
                            new GridColumnModel({ field: 'ORGAN_NOM', displayName: 'TXT_NOM' }),
                            new GridColumnModel({ field: 'ORGAN_TYPE', displayName: 'TXT_TYPE', width: '80px', visible: organType == 'both' }),
                            new GridColumnModel({ field: 'ORGAN_TAUX', displayName: 'TXT_TAUX', width: '80px' }),
                            new GridColumnModel({ field: 'ORGAN_CODPOS', displayName: 'TXT_CODE_POSTAL_SHORT', width: '100px' }),
                            new GridColumnModel({ field: 'ORGAN_VILLE', displayName: 'TXT_VILLE' })];
            }
            else
            {
            	this.columns = [new GridColumnModel({ field: 'ORGAN_CODE', displayName: 'TXT_CODE', width: '120px' }),
                            new GridColumnModel({ field: 'ORGAN_NOM', displayName: 'TXT_NOM' }),
                            new GridColumnModel({ field: 'ORGAN_TYPE', displayName: 'TXT_TYPE', type: 'libelle', typeArg: 'TXT_ASSURANCE_', width: '80px' }),
                            new GridColumnModel({ field: 'ORGAN_CODPOS', displayName: 'TXT_CODE_POSTAL_SHORT', width: '100px' }),
                            new GridColumnModel({ field: 'ORGAN_VILLE', displayName: 'TXT_VILLE' })];
            }

            this.formatFn = function (entity) {
                return entity["libelleDisplay"];
            }

            this.searchPattern = HELPER.Utils.getLabel('TXT_SEARCHBOX_ORGANISME');

            this.maxRows = 99;

            this.OpenDetailAndRefreshSearchBox = OpenDetailAndRefreshSearchBox;

            this.customActions = [];

            if (this.enableCreateEdit && HELPER.User.hasRight('ORG_EDITION')) {
            	this.customActions.push(new searchBoxAction('XaCommon/img/ConsultSearchbox.png', 'whenSelected', 'TXT_CONSULTER', this.OpenDetailAndRefreshSearchBox, 'whenReadonly'));
            	this.customActions.push(new searchBoxAction('XaCommon/img/EditSearchbox.png', 'whenSelected', 'TXT_EDITION', this.OpenDetailAndRefreshSearchBox, 'whenEdit'));
                this.customActions.push(new searchBoxAction('XaCommon/img/add_20px.png', 'whenSearch', 'TXT_CREATION', this.OpenDetailAndRefreshSearchBox, 'whenEdit'));
            }
            else
            {
            	this.customActions.push(new searchBoxAction('XaCommon/img/ConsultSearchbox.png', 'whenSelected', 'TXT_CONSULTER', this.OpenDetailAndRefreshSearchBox, 'whenEditAndReadonly'));
            }

            
            
            var ctxManager = this;

            this.searchFn = function (query) {
           
                var columns = _.map(this.columns, function (item) { return item.field; });
                columns.push('id'); columns.push('libelleDisplay');
                //Si both (Caisses + Mutuelles) -> pas de filtre sur le type d'organisme
                var organType = (ctxManager.organType == 'both') ? 'both' : ctxManager.organType;

                var data = {
                    Type: 'Organisme',
                    RequestedColumns: columns,
                    Criteria: { Rechercher_Type: organType, Rechercher_Pattern: query, Rechercher_ToutesDates: false }
                };


                return HELPER.Api.callApiApplication('Tdb', 'getList', data).then(function (resultFromServer) {
                  return  HELPER.Utils.convertTdbArrayToType(resultFromServer, TdbItemModel);
                });
           
            };

            function OpenDetailAndRefreshSearchBox(valeurSelectionnee) {
                var ctxCtrl = this;

                var modeOuverture = '';

                var organType = (ctxManager.organType || "BOTH").toUpperCase();
                if (organType == 'BOTH' && valeurSelectionnee != null) {
                    switch (valeurSelectionnee.ORGAN_TYPE) {
                        case 'C': organType = 'CAISSE';
                        case 'M': organType = 'MUTUELLE';
                    }
                }

                var idOrganisme = (valeurSelectionnee != null) ? valeurSelectionnee.id : null;

                if (!ctxManager.enableCreateEdit || ctxCtrl.canedit === false)
                    modeOuverture = 'CONSULT';
                else
                    modeOuverture = (valeurSelectionnee != null) ? 'EDIT' : 'CREATE';

                var window = HELPER.Form.openWindow('OrganismeFiche', idOrganisme, organType, modeOuverture);

                window.then(
                    function onWindowClose(resultTo) {
                        if (resultTo.success)
                            return HELPER.Api.callApiApplication('Tdb', 'getSearchboxValue', { tdbType: 'Organisme', id: resultTo.data }, SearchboxTo)
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

        return SearchBoxOrganManager;
    });

})();
