(function () {
    'use strict';

    angular.module('XaCommon').factory('ImpressionModeleTO', function (HELPER) {
        function ImpressionModeleTO(src) {
            HELPER.Utils.extendPropFrom(this, src);
        }
        return ImpressionModeleTO;
    });

    angular.module('XaCommon').factory('ImpressionTO', function (HELPER, ImpressionModeleTO) {
        function ImpressionTO(src) {
            this.id = src ? src.id : '';
            this.libelle = src ? src.libelle : '';
            this.report = src ? src.report : '';
            this.defaultModeleId = src ? src.defaultModeleId : '';
            this.modeles = src ? HELPER.Utils.convertArrayToType(src.modeles, ImpressionModeleTO) : [];
            this.isWeb = src ? src.isWeb : false;
            this.isStandard = src ? src.isStandard : false;
            this.isDuplicata = src ? src.isDuplicata : false;
            this.canChangeDuplicata = src ? src.canChangeDuplicata : false;
            this.defaultSelected = src ? src.defaultSelected : false;
            this.type = src ? src.type : '';
        }
        return ImpressionTO;
    });

    angular.module('XaCommon').factory('ImpressionMargins', function (HELPER) {
        function ImpressionMargins(src) {
            HELPER.Utils.extendPropFrom(this, src);
        }
        return ImpressionMargins;
    });
        
    angular.module('XaCommon').factory('ImpressionParametersTO', function (HELPER, ImpressionTO, ImpressionModeleTO, ImpressionMargins) {
        function ImpressionParametersTO(src) {
            this.impression = src ? HELPER.Utils.convertObjectOrArrayToType(src.impression, ImpressionTO) : null;
            this.modele = src ? HELPER.Utils.convertObjectOrArrayToType(src.modele, ImpressionModeleTO) : null;
            this.isDuplicata = src ? src.isDuplicata : false; 
            this.NUMDEM = src ? src.NUMDEM : '';
            this.margins = src ? HELPER.Utils.convertObjectOrArrayToType(src.margins, ImpressionMargins) : null;
        }
        return ImpressionParametersTO;
    });

    angular.module('XaCommon').factory('ImpressionLogParamsTo', function (HELPER) {
        function ImpressionLogParamsTo(src) {
            HELPER.Utils.extendPropFrom(this, src);
        }
        return ImpressionLogParamsTo;
    });
    
})();

