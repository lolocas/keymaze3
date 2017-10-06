(function (local) {
    'use strict';

    local.directive('xaImageServer', function (xaTranslation, xaDirectiveHelper, xaFrameworkSetting) {
        
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/ImageServer/ImageServer.tpl.html',
            scope: {
            	imageServerUrl: '=',
            },
            link: function (scope, element, attrs) {
       
            }
        };

    });

})(window.XaNgFrameworkImageServer);
