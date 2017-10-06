(function () {
	'use strict';

	angular.module('XaCommon').factory('SearchBoxProduitManager', function (HELPER, GridColumnModel, TdbItemModel, SearchboxTo, searchBoxAction, $q) {

		function SearchBoxProduitManager() {

			this.columns = [new GridColumnModel({ field: 'codeProduit', displayName: 'TXT_CODE', width: '120px' }),
                            new GridColumnModel({ field: 'libelleProduit', displayName: 'TXT_NOM' }),
							new GridColumnModel({ field: 'numeroLot', displayName: 'TXT_LOT' })];

			this.gridSettings = {
				sortInfo: [{ field: 'libelleProduit', direction: 'asc' }]
			},

            this.formatFn = function (entity) {
            	return entity["libelleDisplay"];
            }

			this.searchPattern = HELPER.Utils.getLabel('TXT_CODE') + ' '
                + HELPER.Utils.getLabel('TXT_OU') + ' ' + HELPER.Utils.getLabel('TXT_LIBELLE');

			this.maxRows = 99;

			var ctxManager = this;

			this.searchFn = function (query) {
				if (HELPER.Utils.isEmpty(query))
					return HELPER.Utils.emptyPromise(false, false);

				var extraCriteria = {};
				if (ctxManager.beforeSearchFn && ctxManager.beforeSearchFn(query, extraCriteria) === false) {
					return HELPER.Utils.emptyPromise([], false);
				}
				var produitRechercheCriteriaTo = _.extend({ Rechercher_Pattern: query }, extraCriteria);
	
				return HELPER.Api.callApiApplication('FicheProduit', 'RechercheProduits', produitRechercheCriteriaTo).then(function (result) {

					if (ctxManager.onSearchResult)
					{
						if (ctxManager.onSearchResult(query, extraCriteria, result) === false)
							return HELPER.Utils.emptyPromise(false, false);
						else
							return result.listeProduits;
							
					}
					else
						return result.listeProduits;
				});
			};

			this.customActions = [];
			this.customActions.push(new searchBoxAction('XaCommon/img/ProduitsFamilles20.png', 'whenSearch', 'TXT_PRODUIT_FAMILLE', OpenFamillePanierProduit, 'whenEdit'));


			function OpenFamillePanierProduit() {
				var ctxCtrl = this;
				var extraCriteria = {};
				var extraFields = ctxManager.opts && ctxManager.opts.extraFields ? ctxManager.opts.extraFields : [];
				if (ctxManager.beforeSearchFn && ctxManager.beforeSearchFn(ctxCtrl.selectedText, extraCriteria) === false)
					return;

				var window = HELPER.Form.openWindow('FicheFamillePanierProduit', extraCriteria.Rechercher_Fournisseur, extraCriteria.Rechercher_SitesSelectionnes);
				window.then(
                  function refreshSearchBoxValue(resultTo) {
                  	if (resultTo.success) {
                  		var test = ctxManager;
                  		var oldValue = ctxCtrl.selectedValue;
                  		if (ctxCtrl.willChange && ctxCtrl.willChange()) {
                  		    var l_Produit = {};
                  		    l_Produit.numeroProduit = resultTo.data.id;
                  			if (!ctxCtrl.willChange()(l_Produit, oldValue)) {
                  				ctxCtrl.selectedValue = null;
                  				return false;
                  			}
                  		}
                  		ctxCtrl.selectedValue = resultTo.data;
                  		if (ctxCtrl.didChange)
                  			ctxCtrl.didChange(oldValue, ctxCtrl.selectedValue);
                  	}
                  })
			}
		}
		return SearchBoxProduitManager;
	});

})();
