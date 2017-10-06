(function () {
    'use strict';

    var app = angular.module('Keymaze', ['XaNgFramework', 'XaCommon', 'ngSanitize']);

    angular.module('XaCommon').constant('ConfConst', {
        PRODUCT_TITLE: "Keymaze",
        DEFAULT_VIEW: 'Main'
    });

})();
