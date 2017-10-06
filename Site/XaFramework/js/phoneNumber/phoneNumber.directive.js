(function (local) {
    'use strict';
    local.directive("xaPhoneNumber", function ($filter, $parse, $rootScope, xaTelephonyService, xaKeyHelper, xaFrameworkSetting, xaDirectiveHelper) {

        return {
            restrict: "EA",
            replace: true,
            scope: {
                country: '@?', //time format, 12h or 24h
                inputValue: '=', //value to bind to
                canedit: '=?',
                willChange: '&?',
                didChange: '&?'
            },
            templateUrl: '../js/phoneNumber/phoneNumber.tpl.html',
            link: function (scope, element, attrs, ngModel) {
                if (scope.canedit == undefined) scope.canedit = true;

                if (!scope.country) scope.country = xaFrameworkSetting.TelephonyCountryCode || "FR";

                xaDirectiveHelper.setTestIdOnElement(element, 'tel', attrs.inputValue);

                var formatIntPhone = function (val) {
                    try {
                    	return xaTelephonyService.getDisplayValue(scope.country, val);
                    }
                    catch (ex) {
                        return val;
                    }
                }

                function formatValue(val) {
                	if (val === "")
                		return "";
                	else if (val) {
                        return formatIntPhone(val || '');
                    }
                    else
                		return xaTelephonyService.getStorageValue(scope.country, val || '');
                }
                scope.internValue = formatValue(scope.inputValue);
                var initialValue = null;

                var $inputElem = element.find('input');

                var willChangeFn = scope.willChange ? scope.willChange() : undefined;
                var didChangeFn = scope.didChange ? scope.didChange() : undefined;
                $inputElem.on('blur', function (e) {
                    if (scope.internValue == initialValue) return; //no change

                    if (scope.internValue) {

                        scope.internValue = formatIntPhone(scope.internValue);
                      
                        var newVal = xaTelephonyService.getStorageValue(scope.country, scope.internValue);
                    }

                    var cont = true;
                    if (angular.isFunction(willChangeFn))
                        cont = willChangeFn(newVal);

                    if (cont === false) {
                        scope.internValue = formatValue(scope.inputValue);
                    }
                    else {
                        var oldVal = scope.inputValue;
                        scope.inputValue = newVal;
                        xaDirectiveHelper.removeErrorTooltip(element);
                        if (angular.isFunction(didChangeFn))
                            didChangeFn(newVal, oldVal);
                    }

                    if (!$rootScope.$$phase) {
                        $rootScope.$apply();
                    }
                
                }).on('focus', function () {
                    initialValue = scope.internValue;
                    $(this).select();
                    if (scope.inputValue) {
                        scope.internValue = formatIntPhone(scope.internValue);

                        if (!$rootScope.$$phase) {
                            scope.$apply();
                        }
                    }                    
                }).on('keypress', function (e) {
                    var pressedKey = xaKeyHelper.getKey(e, 'keypress');

                    if (xaKeyHelper.isEnter(pressedKey)) {
                        $inputElem.triggerHandler('blur');
                        $inputElem.triggerHandler('focus');
                        e.preventDefault(); return;
                    }
                });

                scope.$on('$destroy', function () {
                    $inputElem.off("focus blur keypress");
                });
      

        
            }
        };

    });

})(window.XaNgFrameworkPhoneNumber);
