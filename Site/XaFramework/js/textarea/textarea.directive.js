(function (local) {
    'use strict';

    local.directive('xaTextArea', function ($timeout, xaDirectiveHelper) {

        var selectionThrottleDelay = 50;

        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/textarea/textarea.tpl.html',
            scope: {
                inputValue: '=',
                canedit: '=?',
                willChange: '&?',
                didChange: '&?'
            },
            link: function (scope, element, attrs) {
                if (scope.canedit == undefined) scope.canedit = true;
                scope.internalValue = scope.inputValue;
                
                xaDirectiveHelper.setTestIdOnElement(element, 'txa', attrs.inputValue);

                var unwatchExternalModel = scope.$watch('inputValue', function (newVal, oldVal) {
                    scope.internalValue = newVal;
                });
             
                var willChangeFn = scope.willChange ? scope.willChange() : undefined;
                var didChangeFn = scope.didChange ? scope.didChange() : undefined;
                var unwatchModel = scope.$watch("internalValue", function (newVal, oldVal) {
                    if ( newVal == oldVal || scope.inputValue == scope.internalValue) return;

                    var cont = true;
                    if (angular.isFunction(willChangeFn))
                        cont = willChangeFn(newVal);

                    if (cont === false) {
                        scope.internalValue = scope.inputValue;
                        return;
                    }

                    scope.inputValue = newVal;
                    xaDirectiveHelper.removeErrorTooltip(element);
                    if (angular.isFunction(didChangeFn))
                        $timeout(function () {
                            didChangeFn(newVal, oldVal);
                        });
                });

                scope.$on('$destroy', function () {
                    unwatchModel();
                    unwatchExternalModel();
                    element.off('focus');
                });
            }
        };

    });

})(window.XaNgFrameworkTextArea);
  