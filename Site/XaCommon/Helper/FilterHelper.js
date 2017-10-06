(function () {
    'use strict';

    angular.module('XaCommon').service('FilterHelper', FilterHelper);

    function FilterHelper( $filter, UtilsHelper,xaTranslation) {

        this.toDateString = $filter('XaFilterDate');
        this.toMontantString = $filter('XaFilterMontant');
        this.toDateTimeString = $filter('XaFilterDateTime');
        this.toMontantString = $filter('XaFilterMontant');
        this.toLibelleString = $filter('XaFilterValeurToLibelle');
        this.toNombreString = $filter('XaFilterNombre');
        this.toNombreEntierString = $filter('XaFilterNombreEntier');
        this.toTelephoneString = $filter('XaFilterTelephone');
        this.toAgeString = UtilsHelper.getAge;
        this.toHourString = $filter('XaFilterHour');
        this.toDateAvecJour = $filter('XaFilterDateAvecJour');
        
        
    };

})();




