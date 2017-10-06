(function (local) {
    'use strict';
    local.directive("xaNumericTextBox", function ($filter, $parse, $rootScope, $locale, xaTranslation, xaKeyHelper, xaDirectiveHelper) {

        return {
            restrict: "EA",
            replace: true,
            scope: {
                inputValue: '=', //value to bind to
                canedit: '=?',
                nbDecimal: '=?',
                min: '=?',
                max: '=?',
                willChange: '&?',
                didChange: '&?'
            },
            templateUrl: '../js/numericTextbox/numericTextbox.tpl.html',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {


                function showError(text) {
                    var tooltipData = {
                        placement: 'bottom',
                        trigger: 'focus',
                        html: true,
                        title: text
                    };
                    element.addClass('has-err').tooltip(tooltipData);
                }

                function removeError() {
                    element.removeClass('has-err').tooltip('destroy');
                }

                xaDirectiveHelper.setTestIdOnElement(element, 'txn', attrs.inputValue);

                if (scope.canedit == undefined) scope.canedit = true;

                if (scope.nbDecimal == undefined || isNaN(parseInt(scope.nbDecimal))) 
                    scope.nbDecimal = 0;
                else
                    scope.nbDecimal =  parseInt(scope.nbDecimal);

                if (scope.min == undefined || isNaN(parseInt(scope.min))) 
                    scope.min = undefined;
                else
                    scope.min =  parseInt(scope.min);

                if (scope.max == undefined || isNaN(parseInt(scope.max))) 
                    scope.max = undefined;
                else
                    scope.max =  parseInt(scope.max);

                if (scope.inputValue != undefined && typeof scope.inputValue == 'string')
                    scope.inputValue = parseFloat(scope.inputValue.replace(',','.'));

                if (scope.inputValue != undefined && !isNaN(parseFloat(scope.nbDecimal)))
                    scope.internValue = scope.inputValue.toFixed(scope.nbDecimal).replace(',', $locale.NUMBER_FORMATS.DECIMAL_SEP).replace('.', $locale.NUMBER_FORMATS.DECIMAL_SEP);
                else
                    scope.internValue = '';


                var initialValue = null;

                var unwatchExternalModel = scope.$watch('inputValue', function (newVal, oldVal) {
                	if ((newVal != undefined   && newVal != '') || (newVal === 0))
                		scope.internValue = newVal.toFixed(scope.nbDecimal).replace(',', $locale.NUMBER_FORMATS.DECIMAL_SEP).replace('.', $locale.NUMBER_FORMATS.DECIMAL_SEP);
                	else
                		scope.internValue = '';
                });

                var willChangeFn = scope.willChange ? scope.willChange() : undefined;
                var didChangeFn = scope.didChange ? scope.didChange() : undefined;
                element.on('blur', function (e) {
                    
                    removeError();

                    if (scope.internValue == initialValue) return; //no change

                    var isError=false;
                    var newVal = scope.internValue == '' ?  undefined : parseFloat(scope.internValue.replace(',', '.'));

                    if (newVal != undefined) {
                        if (isNaN(newVal) || !angular.isNumber(newVal)) {
                            isError = true;
                            showError(xaTranslation.instant('TXT_ERR_NUMERIC_INVALID'));
                        }
                        else if (scope.max && newVal > scope.max) {
                            isError = true;
                            showError(xaTranslation.instant('TXT_ERR_NUMERIC_MAX') + ' ' + scope.max);
                        }
                        else if (scope.min != undefined && newVal < scope.min) {
                            isError = true;
                            showError(xaTranslation.instant('TXT_ERR_NUMERIC_MIN') + ' ' + scope.min);
                        }
                    }
                    
                    if (isError) {
                        scope.internValue = initialValue;

                    }
                    else {

                        var cont = true;
                        if (angular.isFunction(willChangeFn))
                            cont = willChangeFn(newVal);

                        if (cont === false) {
                            scope.internValue = scope.inputValue;
                            return;
                        }

                        var oldVal = scope.inputValue;
                        scope.inputValue = newVal;
                        if (newVal != undefined)
                            scope.internValue = newVal.toFixed(scope.nbDecimal).replace(',', $locale.NUMBER_FORMATS.DECIMAL_SEP).replace('.', $locale.NUMBER_FORMATS.DECIMAL_SEP);

                       	xaDirectiveHelper.removeErrorTooltip(element);

                        if (angular.isFunction(didChangeFn))
                        {
                        	if (!$rootScope.$$phase) scope.$apply();

                        	didChangeFn(newVal, oldVal);

                        }
                    }
                    if (!$rootScope.$$phase) {
                        scope.$apply();
                    }

                });
                element.on('focus', function () {
                    initialValue = scope.internValue;
                    $(this).select();
                    if (scope.inputValue) {
                        scope.internValue = scope.internValue;

                        if (!$rootScope.$$phase) {
                            scope.$apply();
                        }
                    }
                });
                element.on('keypress', function (evt) {
                	var pressedKey = xaKeyHelper.getKey(evt, 'keypress');

                	if (xaKeyHelper.isNavigationKey(pressedKey))
                		return true;

                	if (xaKeyHelper.isCtrlA(pressedKey, evt.ctrlKey))
                		return true;

                    if (xaKeyHelper.isEnter(pressedKey)) {
                        element.triggerHandler('blur');
                        element.triggerHandler('focus');
                        evt.preventDefault(); return;
                    }

                    var isNumber = xaKeyHelper.isNumber(pressedKey, evt.ctrlKey, false);

                    var currVal = element.val();
                    var isCharValid = true;

                    // blocage de decimal sur cigle , et. Raul: don't understand what you try to do here, but I recomment xaKeyHelper.isChar(...)
                    // prevent , or . if ngDec = 0;
                    //if , or . already there, don't allow it again!
                    // 123,23.32 ^

                    var isComma = xaKeyHelper.isChar(pressedKey, ',');
                    var isPoint = xaKeyHelper.isChar(pressedKey, '.');
                    var isNegative = xaKeyHelper.isChar(pressedKey, '-');


                    if (isComma || isPoint ) {
                        if (scope.nbDecimal == 0) 
                            isCharValid = false;
                        else if(currVal.indexOf(',') > -1 || currVal.indexOf('.') > -1)
                            isCharValid = false;
                    } else if (isNegative) {
                    	if (scope.min && scope.min >= 0)
                    		isCharValid = false;
                    }
                    else if (!isNumber)
                        isCharValid = false;
              
                    if (!isCharValid)
                        evt.preventDefault();
                });

                scope.$on('$destroy', function () {
                	unwatchExternalModel();
                    element.off("focus blur keypress");
                });
            }
        };
    });

})(window.XaNgFrameworkNumericTextBox);
