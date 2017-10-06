(function (local) {
    'use strict';
    local.directive('xaCheckbox', function ($timeout, xaTranslation, xaDirectiveHelper) {
        return {
            restrict: 'EA',
            replace: true,
            template: '<div class="xaCheckboxControl"><label><input type="checkbox" class="xaInputControl xaValidationTooltip" ng-disabled="!canedit" ng-class="{\'xaDisabledIgnore\': !canedit }" ng-model="_isCheckedInternal" ng-change="internalChange()" />  <span class="lbl"></span></label></div>',
            scope: {
                mode:'@',
                isChecked: '=inputValue',
                canedit: '=?',
                willChange: '&?',
                didChange: '&?'
            },
            link: function (scope, element, attrs) {
                var lblElem = element.find('span.lbl');
                lblElem.html(xaTranslation.getResource(attrs.resourceKey, attrs.isHtml));


                scope.canedit = scope.canedit == undefined ? true : scope.canedit;
                scope._isCheckedInternal = null;

                function getValeurToInternal(newVal) {
                    if (scope.mode === 'string')
                        return newVal === '-1' ? true : false;
                    else
                        return newVal;
                }

                function getValeurToExternal(newVal) {
                    if (scope.mode === 'string')
                        return newVal === true ? '-1'  : '0';
                    else
                        return newVal;
                }

                scope.$watch('isChecked', function (newVal, oldVal) {
                    scope._isCheckedInternal = getValeurToInternal(newVal);
                });

                xaDirectiveHelper.setTestIdOnElement(element, 'chk', attrs.inputValue);

                scope.internalChange = function () {

                	var fnWillChange = scope.willChange ? scope.willChange() : undefined;
                	var fnDidChange = scope.didChange ? scope.didChange() : undefined;

                    var cont = true;
                    if (angular.isFunction(fnWillChange))
                        cont = fnWillChange(scope._isCheckedInternal);
                    if (cont === false) {
                        scope._isCheckedInternal = getValeurToInternal(scope.isChecked); //cancel changes
                        return;
                    }

                    var oldVal = getValeurToExternal(scope.isChecked);
                    scope.isChecked = getValeurToExternal(scope._isCheckedInternal);

                    if (angular.isFunction(fnDidChange)) {
                        $timeout(function () {
                            fnDidChange(scope.isChecked, oldVal);
                        });
                    }
                }
            }
        };
    });

})(window.XaNgFrameworkCheckbox);
