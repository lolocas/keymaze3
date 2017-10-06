(function (local) {
    'use strict';

    local.directive('xaPassword', function ($timeout, xaKeyHelper, xaTranslation, xaKeyboard, xaDirectiveHelper) {

        var selectionThrottleDelay = 50;

        return {
            restrict: 'EA',
            replace: true,
            template: '<input type="password" class="xa-textbox xaValidationTooltip xaInputControl form-control" ng-class="{\'xaDisabledIgnore\': !canedit }" ng-model-options="{ updateOn: \'blur\'}" ng-model="internalValue" ng-disabled="!canedit" />',
            scope: {
                inputValue: '=',
                canedit: '=?',
                willChange: '&?',
                onlyNumeric: '@?',
                didChange: '&?',
                onEnter: '&?',
               // cssClass: '@?',
                maxlength: '@?'
            },
            link: function (scope, element, attrs) {

                if (scope.canedit == undefined) scope.canedit = true;


                if (attrs.maxlength)
                    element.attr('maxlength', attrs.maxlength);

                xaDirectiveHelper.setTestIdOnElement(element, 'txp', attrs.inputValue);

                scope.internalValue = scope.inputValue;

             
                scope.restoreDefaultValue = function () {
                    scope.internalValue = scope.defaultValue;
                };

                var unwatchExternalModel = scope.$watch('inputValue', function (newVal, oldVal) {
                    scope.internalValue = newVal;
                });

                var unwatchModel = scope.$watch("internalValue", function (newVal, oldVal) {
                    if (newVal == oldVal || scope.inputValue == scope.internalValue) return;
    
                    //validate minlength
                    if (scope.minlength && element.val().length < scope.minlength) {
                        showError(minLengthError);
                        scope.internalValue = scope.inputValue;
                        return;
                    }
                    removeError();

                    var willChangeFn = scope.willChange ? scope.willChange() : undefined;
                    var didChangeFn = scope.didChange ? scope.didChange() : undefined;
                    var onEnterFn = scope.onEnter ? scope.onEnter() : undefined;

                    var cont = true;
                    if (angular.isFunction(willChangeFn))
                        cont = willChangeFn(newVal, oldVal);

                    if (cont === false) {
                        $timeout(function () {
                            scope.internalValue = scope.inputValue;
                        });
                    }
                    else {
                    	scope.inputValue = newVal;
                    	xaDirectiveHelper.removeErrorTooltip(element);
                        if (angular.isFunction(didChangeFn) || (xaKeyHelper.isEnter(lastKey) && angular.isFunction(onEnterFn)))
                            $timeout(function () {
                                if (angular.isFunction(didChangeFn))
                                    didChangeFn(newVal, oldVal);

                                if (xaKeyHelper.isEnter(lastKey) && angular.isFunction(onEnterFn)) {
                                    lastKey = null;
                                    onEnterFn();
                                }
                                  
                            });

                      

                    }
                });

            

                element.on('focus', function () {
                	$(this).select();
                });


                //bindCtrlEnter();
                var lastKey= null;
                element.on('keypress', function (e) {
                    var pressedKey = xaKeyHelper.getKey(e, 'keypress');

                    lastKey = pressedKey;
                    if (scope.onlyNumeric) {
                        var allow = xaKeyHelper.isNumber(pressedKey);

                        if (!allow) e.preventDefault();
                    }

                    if (xaKeyHelper.isEnter(pressedKey)) {
                    	// Si pas de changement de valeur on declenche directe
                    	var onEnterFn = scope.onEnter ? scope.onEnter() : undefined;
                    	if (angular.isFunction(onEnterFn) && element.val() == scope.inputValue) {
                    		lastKey = null;
                    		onEnterFn();
                    	}
                    		// Si changement de valeur sera effectué après le dichangefn
                    	else {
                    		element.trigger('blur');
                    		element.trigger('focus');
                    	}
                    }
                });

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

                scope.$on('$destroy', function () {
                    unwatchModel();
                    unwatchExternalModel();
                    removeError();
                    element.off('focus keypress');
                });

            }
        };

    });

})(window.XaNgFrameworkTextBox);
  