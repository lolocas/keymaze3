(function () {
    'use strict';

    angular.module('XaCommon').service('LocalHelper', LocalHelper);

    function LocalHelper(LocalService, UtilsHelper, UrlHelper, ArrayHelper, ParametersService, $q, $http, $location) {

        this.isLocalHostConnected = isLocalHostConnected;
        this.isControllerConnected = isControllerConnected;
        this.getLocalConfiguration = getLocalConfiguration;
        this.applicationIsInstalled = applicationIsInstalled;
        this.installApplication = installApplication;

        function isLocalHostConnected() {
            return LocalService._isLocalHostConnected;
        }

        function isControllerConnected() {
            return LocalService.isControllerConnected;
        }

        function getLocalConfiguration() {
            return LocalService.conf;
        }

        function applicationIsInstalled(applicationName) {
            if (LocalService.isControllerConnected) {
                return LocalService.getInstalledApplication().then(function (result) {
                    var application = ArrayHelper.findFirstFromProperty(result, 'Name', applicationName);
                    if (application)
                        return application.IsInstalled;
                    else
                        return false;
                });
            }
            else {
                return UtilsHelper.emptyPromise(false);
            }
        }
     
        function installApplication(applicationName) {
            if (LocalService.isControllerConnected) {
                return LocalService.updateApplication(applicationName, true);
            }
            else {
                return UtilsHelper.emptyPromise(false);
            }
        }
    };

})();