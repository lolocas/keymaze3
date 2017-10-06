(function () {
    'use strict';

    angular.module('XaCommon').factory('SearchBoxPersonnelManager', function (GridColumnModel, HELPER, TdbItemModel, SearchboxTo, searchBoxAction, $q) {

        function SearchBoxPersonnelManager() {

            this.columns = [new GridColumnModel({ field: 'PERSON_CODPER', displayName: 'TXT_CODE', width: '50px' }),
                            new GridColumnModel({ field: 'PERSON_NOMAGE', displayName: 'TXT_NOM' }),
                            new GridColumnModel({ field: 'PERSON_PRNAGE', displayName: 'TXT_PRENOM' }),
                            new GridColumnModel({ field: 'PERSON_QUALIF', displayName: 'TXT_QUALIF', width: '50px' })];

            this.formatFn = function (entity) {
                return entity["libelleDisplay"];
            }

            this.searchPattern = HELPER.Utils.getLabel('TXT_NOM') + ',' + HELPER.Utils.getLabel('TXT_PRENOM');

            this.maxRows = 99;

            this.customActions = [];

            var ctxManager = this;
			this.searchFn = function (query) {
                var columns = _.map(this.columns, function (item) { return item.field; });
                columns.push('id'); columns.push('libelleDisplay');

                var data = {
                    Type: 'Personnel',
                    RequestedColumns: columns,
                    Criteria: { Rechercher_Pattern: query }
                };

            
               return HELPER.Api.callApiApplication('Tdb', 'getList', data).then(function (resultFromServer) {
                    return HELPER.Utils.convertTdbArrayToType(resultFromServer, TdbItemModel);
                });
            };

  
        }

        return SearchBoxPersonnelManager;
    });

})();
