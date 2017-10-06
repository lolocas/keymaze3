(function () {
	'use strict';

	angular.module('XaCommon')

		.factory('QuickFilterConfigModel', function (HELPER) {

			function QuickFilterConfigModel(src) {
				this.preferenceRubrique = src.preferenceRubrique;
				this.preferenceKey = src.preferenceKey;
				this.enableCleanFilter = src.enableCleanFilter;
				this.applyQuickFilterFn = src.applyQuickFilterFn;
				this.quickFilterFilteringFn = src.quickFilterFilteringFn;
				this.applyEmptyFilter = src.applyEmptyFilter;
				this.loadOnInit = src.loadOnInit !== false;
			}
			return QuickFilterConfigModel;
		})

		.factory('QuickFilterStateModel', function (HELPER) {

			function QuickFilterStateModel(src) {
				this.showPersonnelFilter = src.showPersonnelFilter;
				this.showProfilFilter = src.showProfilFilter;
				this.codeProfil = src.codeProfil;
				}
			return QuickFilterStateModel;
		})

		 .factory('QuickFilterSaveModel', function (HELPER) {
		 	function QuickFilterSaveModel(data) {
		 		this.text = data ? data.text : null;
		 		this.savePeriod = data ? data.savePeriod : null;
		 		this.saveSelection = data ? data.saveSelection : null;
		 		this.codeTypeFilter = data ? data.codeTypeFilter : null;
		 		this.typeFilter = data ? data.typeFilter : null;
		 	};
		 	return QuickFilterSaveModel;
		 })

		.factory('QuickFilterModel', function (HELPER) {

			function QuickFilterModel(src) {
				this.updateWithValues(src);
			}

			QuickFilterModel.prototype = {
				updateWithValues: function (src) {
					this.text = src.text;
					this.infoFilter = src.infoFilter;
					this.sites = src.sites;
					this.selection = src.selection;
					this.period = src.period;
					this.typeFilter = src.typeFilter || 'U';
					this.codeTypeFilter = src.codeTypeFilter;
				}
			};
			return QuickFilterModel;
		})

	 

})();