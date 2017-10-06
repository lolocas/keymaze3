(function (local) {
    'use strict';

    local.directive('xaButton', function ($filter, xaTranslation, xaDirectiveHelper) {
        
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/buttons/button.tpl.html',
            scope: {
				resourceKey: '@'
            },
            
            link: function (scope, element, attrs) {

                scope.click = function () {
                    scope.$parent.$eval(attrs.click);
                };

                if (scope.resourceKey)
                	scope.text = xaTranslation.instant(scope.resourceKey);

                xaDirectiveHelper.setTestIdOnElement(element, 'btn', scope.resourceKey);

                scope.$on('$destroy', function () {
                    element.empty();
                    element = null;
                });
            }
        };

    });

})(window.XaNgFrameworkButtons);
