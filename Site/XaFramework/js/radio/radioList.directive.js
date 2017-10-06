(function (local) {
    'use strict';
    local.directive('xaRadioList', function ($timeout, xaTranslation, xaDirectiveHelper, xaKeyHelper) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/radio/radioList.tpl.html',
            scope: {
                itemWidth: '@?',
                source: '=', // array of strings or objects - optional
                canedit: '=?', // boolean used to determine if the input is editable or not. - optional, default is true
                displayProp: '@?', // the property name to be used for display of items in the input control. - required for complex objects
                valueProp: '@?', // the property name to be used for value of items. - required for complex objects
                willChange: '&?', // callback when an item is selected from the dropdown. - optional
                didChange: '&?',
                selection: '=inputValue'
            },
            link: function (scope, element, attrs) {
                scope.itemWidth = scope.itemWidth || '20%';
                scope.group = 'radioList_' + scope.$id;
                if (scope.canedit == undefined) scope.canedit = true;

                scope.source = scope.source || [];
                var isStringArr = scope.source.length > 0 && typeof scope.source[0] == 'string';

                if (!isStringArr)
                	scope._innerSource = _.map(scope.source, function (item) {
                		return {
                			text: item.resourceKey ? xaTranslation.instant(item.resourceKey) : item[scope.displayProp],
                			value: item[scope.valueProp],
							testId: xaDirectiveHelper.getTestId('rad', attrs.inputValue) + '_' + item[scope.valueProp]
                		}
                	});
                else
                	scope._innerSource = _.map(scope.source, function (str) {
                		return {
                			text: str,
                			value: str,
                			testId: str
                		}
                	});
                
                scope._internalSelection = scope.selection;

                scope.$watch('selection', function (newVal, oldVal) {
                    if (newVal == oldVal) return; //nothing changed!
                    scope._internalSelection = newVal;
                });


                var fnWillChange = scope.willChange ? scope.willChange() : undefined;
                var fnDidChange = scope.didChange ? scope.didChange() : undefined;
                
                scope.keyPress = function (val, evt) {
                    if (xaKeyHelper.isSpace(evt.keyCode) || xaKeyHelper.isEnter(evt.keyCode)) {
                        scope.internalChange(val);
                    }
                }

                scope.internalChange = function (val) {
                    if (!scope.canedit) return false;
                    var cont = true;
                    if (angular.isFunction(fnWillChange))
                        cont = fnWillChange(val.value);
                    if (cont === false) {
                        $timeout(function () {
                            scope._internalSelection = scope.selection; //cancel changes
                        });
                        return;
                    }

                    var oldVal = scope.selection;
                    scope.selection = scope._internalSelection = val.value;

                    xaDirectiveHelper.removeErrorTooltip(element);
                    if (angular.isFunction(fnDidChange)) {
                        $timeout(function () {
                            fnDidChange(scope.selection, oldVal);
                        });
                    }
                }
            }
        };
    });

})(window.XaNgFrameworkRadio);
