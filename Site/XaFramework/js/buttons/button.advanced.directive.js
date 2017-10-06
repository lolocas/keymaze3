(function (local) {
    'use strict';

    local.directive('xaButtonAdvanced', function ($filter, xaTranslation, xaDirectiveHelper) {
        
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/buttons/button.advanced.tpl.html',
            scope: {
				resourceKey: '@',
            	text: '=?text',
                selected: '=?selected',
                disabled: '=?disabled'
            },
            
            link: function (scope, element, attrs) {

                scope.click = function () {
                    scope.$parent.$eval(attrs.click);
                };

                if (scope.resourceKey)
                	scope.text = xaTranslation.instant(scope.resourceKey);

                if (scope.resourceKey)
                	xaDirectiveHelper.setTestIdOnElement(element, 'btn', scope.resourceKey);
                else
                	xaDirectiveHelper.setTestIdOnElement(element, 'btn', scope.text);

                scope.$on('$destroy', function () {
                    element.empty();
                    element = null;
                });
            }
        };

    });

})(window.XaNgFrameworkButtons);
