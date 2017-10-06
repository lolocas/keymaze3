(function () {
    'use strict';

    angular.module('XaCommon')
        .service('CacheHelper', CacheHelper);

    function CacheHelper($translate, $http, $q, ApiHelper, UtilsHelper, ArrayHelper) {
        var ctx = this;

        // Méthode cachée
        this.getDataFromCommonServerOrMemory = function (controllerName, apiName, liste, callback) {
            var defered = $q.defer();
            
            //arguments
            if (liste != null) {
                defered.resolve(liste);
            }
            else {
                ApiHelper.callApiApplication(controllerName, apiName).then(function (result) {
                    var lstTyped = callback(result);
                    defered.resolve(lstTyped);
                });
            }
            return defered.promise;
        }

        this.getDataFromApplicationServerOrMemory = function (controller, apiName, liste, callback) {
            var defered = $q.defer();

            //arguments
            if (liste != null) {
                defered.resolve(liste);
            }
            else {
                ApiHelper.callApiApplication(controller, apiName).then(function (result) {
                    var lstTyped = callback(result);
                    defered.resolve(lstTyped);
                });
            }
            return defered.promise;
        }

    };
})();