(function (local) {
    'use strict';

    local.controller('xaErrorServerController', function ($scope, $rootScope, $injector, $windowInstance, error) {
        this.instance = error;
        $scope.closeFn = $windowInstance.dismiss;
    });

})(window.XaNgFrameworkServices);