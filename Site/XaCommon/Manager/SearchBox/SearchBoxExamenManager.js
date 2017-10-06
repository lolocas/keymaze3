(function () {
    'use strict';

    angular.module('XaCommon').factory('SearchBoxExamenManager', function (GridColumnModel, HELPER, TdbItemModel, SearchboxTo, searchBoxAction, $q) {

        function SearchBoxExamenManager() {
            
            this.columns = [new GridColumnModel({ field: 'EXAMEN_CODE', displayName: 'TXT_CODE', width: '120px' }),
                            new GridColumnModel({ field: 'EXAMEN_LIBELLE', displayName: 'TXT_NOM' }),
                            new GridColumnModel({ field: 'EXAMEN_TYPE', displayName: 'TXT_TYPE' })];

        	this.gridSettings = {
        		sortInfo: [{ field: 'EXAMEN_LIBELLE', direction: 'asc' }]
        	},

            this.formatFn = function (entity) {
                return entity["libelleDisplay"];
            }

            this.searchPattern = HELPER.Utils.getLabel('TXT_CODE') + ' '
                + HELPER.Utils.getLabel('TXT_OU') + ' ' + HELPER.Utils.getLabel('TXT_LIBELLE') + ' '
                + HELPER.Utils.getLabel('TXT_OU') + ' ' + HELPER.Utils.getLabel('TXT_TYPE');

            this.maxRows = 99;

            var ctxManager = this;

            this.searchFn = function (query) {
             
            	var extraCriteria = {};
            	if (ctxManager.beforeSearchFn && ctxManager.beforeSearchFn(query, extraCriteria) === false) {
            		return HELPER.Utils.emptyPromise([], false);
            	}

            	var criteria = _.extend({ Rechercher_Pattern: query, Rechercher_ToutesDates: false }, extraCriteria);

                var columns = _.map(this.columns, function (item) { return item.field; });
                columns.push('id'); columns.push('libelleDisplay');

                var data = {
                    Type: 'Examen',
                    RequestedColumns: columns,
                    Criteria: criteria
                };


                return HELPER.Api.callApiApplication('Tdb', 'getList', data).then(function (resultFromServer) {
                    return HELPER.Utils.convertTdbArrayToType(resultFromServer, TdbItemModel);
                });

             
            };

        
        }

        return SearchBoxExamenManager;
    });

})();
