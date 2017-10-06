(function (local) {
    'use strict'; //got from https://github.com/randallmeeker/ps-input-time
    local.directive("xaTimePicker", function ($filter, $rootScope, $parse, $timeout, xaKeyHelper, xaTranslation, xaDirectiveHelper) {
        var invalidTime = xaTranslation.instant('TXT_HEURE_INVALIDE');

        return {
            restrict: "EA",
            replace: true,
            scope: {
                timeFormat: '@?', //time format, 12h or 24h
                inputValue: '=', //value to bind to
                willChange: '&?',
                didChange: '&?',
                canedit: '=?'
            },
            templateUrl: '../js/timePicker/timePicker.tpl.html',
            link: function (scope, globalElement, attrs, ngModel) {

                var element = globalElement.find('input');

                if (scope.canedit == undefined) scope.canedit = true;

                xaDirectiveHelper.setTestIdOnElement(element, 'tip', attrs.inputValue);

                //scope.internalValue = scope.inputValue;
                var initialValue = null; //scope.inputValue;

                function getDefaultTime() {
                    var dt = new Date();

                    return $filter('date')(dt, "HH:mm");
                }

                function getValue(value, defaultValue) {
                    return angular.isDefined(value) ? scope.$parent.$eval(value) : defaultValue;
                }

                var setCharAt = function (str, index, chr) {
                    if (index > str.length - 1) return str;
                    return str.substr(0, index) + chr + str.substr(index + 1);
                }

                element.on('keydown', function (e) {
                    var pressedKey = xaKeyHelper.getKey(e, 'keydown');
                    var val = element.val();

                    switch (pressedKey) {
                        case 38: // up button hit
                        case 107: // + button
                            addMinute(1);
                            e.preventDefault();
                            break;

                        case 40: // down button hit
                        case 109: // - button
                            addMinute(-1);
                            e.preventDefault();
                            break;

                        case 13: // Enter
                            element.trigger('blur');
                            element.trigger('focus');
                            element.select();
                            e.preventDefault();
                            break;

                        case 8: //Backspace
                            if (val.indexOf(":") == val.length - 1)
                                element.val(val.substr(0, val.length - 1));
                            break;

                        case 110: // . button (detectable uniquement sur keydown car le code dans le keypress correspond a la touche Suppr.)
                            e.preventDefault();
                            break;
                    }
                })
                .on('keypress', function (e) { //backspace not caught by keypress
                    var pressedKey = xaKeyHelper.getKey(e, 'keypress');

                    if (xaKeyHelper.isNavigationKey(pressedKey))
                        return;

                    var isNumeric = xaKeyHelper.isNumber(pressedKey);
                    var allow = isNumeric || xaKeyHelper.isChar(pressedKey, ':'); //also allow ":";
                    var advPosition = false;

                    if (!allow) {
                        e.preventDefault();
                        return;
                    }

                    //insert :
                    var val = element.val();

                    var cursorPos = element[0].selectionStart;
                    if (val.length == 1 && isNumeric) {
                        //insert char + :, cancel event
                        val = val + xaKeyHelper.getChar(pressedKey) + ":";
                        cursorPos += val.length;
                        e.preventDefault();
                    }
                    else if (val.length >= 2 && (val.indexOf(':') == -1)) { //2rd char is typed -> insert placeholder
                        val = val.substr(0, 2) + ':' + val.substr(2);
                    }

                    //user typed : but has been already added? skip
                    if (xaKeyHelper.isChar(pressedKey, ':') && val.indexOf(':') > -1) {
                        element.val(val);
                        e.preventDefault();
                        return;
                    }

                    //replace next char, if maxlen reached
                    if (val.length == 5 && element[0].selectionStart == element[0].selectionEnd) { //
                        if (cursorPos < val.length) {
                            if (val[cursorPos] == ':') cursorPos += 1;
                            val = setCharAt(val, cursorPos, xaKeyHelper.getChar(pressedKey));
                            e.preventDefault();
                            advPosition = true;
                        }
                    }

                    if (element.val() != val) {
                        //leave the cursor where it was
                        //var pos = element[0].selectionStart;
                        element.val(val);
                        if (cursorPos < val.length)
                            element[0].setSelectionRange(cursorPos + 1, cursorPos + 1);
                    }
                    else if (advPosition) {
                        if (cursorPos < val.length)
                            element[0].setSelectionRange(cursorPos + 1, cursorPos + 1);
                    }
                })
                .on('focus', function () {
                    initialValue = element.val();
                    $(this).select();

                })
                .on('blur', function () {
                    if (!checkValidTime()) {
                        showError(invalidTime);
                        scope.internalValue = scope.inputValue;
                    }
                    else {
                        removeError();
                        //normalize time display. ex when typing 10:
                        var val = element.val() || '';
                        if (val != "" && val.length != 5) {
                            var timeObj = parseTime();
                            scope.internalValue = ((timeObj.h < 10 ? "0" : "") + timeObj.h) + ":" + ((timeObj.m < 10 ? "0" : "") + timeObj.m);
                            element.val(scope.internalValue);
                        }

                        triggerValueChange();
                    }
                    if (!$rootScope.$$phase) scope.$apply();
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

                function parseTime() {
                    var time = element.val();
                    if (time.indexOf(':') == -1)
                        time += ':';
                    var parts = time.split(":");
                    var h = +parts[0];
                    var m = +parts[1];

                    if (!angular.isNumber(h) || !angular.isNumber(m)) return null;

                    return { h: h, m: m };
                }

                function checkValidTime() {
                    if (element.val() == '')
                        return true;

                    var timeObj = parseTime();
                    if (!timeObj) return false;
                    if (isNaN(timeObj.h) || isNaN(timeObj.m) || timeObj.h > 23 || timeObj.m > 59) return false;

                    return true;
                }

                function addMinute(number) {
                    var timeObj = parseTime();
                    if (!timeObj) return;

                    var step = (number ? number : 1);
                    timeObj.m += step;
                    if (timeObj.m > 59) {
                        timeObj.h += 1;
                        timeObj.m = timeObj.m - 60;
                    }
                    else if (timeObj.m < 0) {
                        timeObj.h -= 1;
                        timeObj.m = timeObj.m + 60;
                    }

                    if (timeObj.h > 23) timeObj.h = 0;
                    else if (timeObj.h < 0) timeObj.h = 23;


                    scope.internalValue = ((timeObj.h < 10 ? "0" : "") + timeObj.h) + ":" + ((timeObj.m < 10 ? "0" : "") + timeObj.m);
                    if (!$rootScope.$$phase) scope.$apply();
                }

                function formatTime() {
                    var timeObj = parseTime();
                    if (!timeObj) return;

                    return ((timeObj.h < 10 ? "0" : "") + timeObj.h) + ":" + ((timeObj.m < 10 ? "0" : "") + timeObj.m)
                }

                var unwatchExternalModel = scope.$watch('inputValue', function (newVal, oldVal) {
                    scope.internalValue = newVal;
                });

                var unwatchModel = scope.$watch("internalValue", function (newValRaw, oldValRaw) {
                    if (newValRaw == oldValRaw || scope.inputValue == scope.internalValue) return;

                    var newVal = element.val();
                    if (!checkValidTime(newVal)) return;

                    var oldVal = oldValRaw;
                });

                var willChangeFn = scope.willChange ? scope.willChange() : undefined;
                var didChangeFn = scope.didChange ? scope.didChange() : undefined;
                var triggerValueChange = function () {
                    var newVal = element.val();

                    if (newVal == initialValue) return;

                    var cont = true;
                    if (angular.isFunction(willChangeFn))
                        cont = willChangeFn(newVal, initialValue);

                    if (cont === false) {
                        $timeout(function () {
                            scope.internalValue = scope.inputValue;
                        });
                    }
                    else {
                    	scope.inputValue = newVal;
                    	xaDirectiveHelper.removeErrorTooltip(globalElement);
                        if (angular.isFunction(didChangeFn))
                            $timeout(function () {
                                didChangeFn(newVal, initialValue);
                            });
                    }
                };

                scope.$on("$destroy", function () {
                    unwatchExternalModel();
                    unwatchModel();
                    element.off('keypress keyup blur focus');
                    removeError();
                });
            }
        };
    });

})(window.XaNgFrameworkTimePicker);
