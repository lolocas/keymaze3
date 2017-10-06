(function (local) {
    'use strict';
    local.directive('xaColorPickerPopup', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '../js/colorPicker/colorPicker.popup.tpl.html'
        }
    });

    local.directive('xaColorPicker', function ($timeout, xaTranslation, $compile, $rootScope, xaDirectiveHelper, xaKeyboard) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/colorPicker/colorPicker.tpl.html',
            scope: {
                color: '=inputValue',
                canedit: '=?',
                autoOpen: '@?',
                willChange: '&?',
                didChange: '&?'
            },
            link: function (scope, element, attrs) {

                scope.SELECT_COLOR = xaTranslation.instant('TXT_COLOR_SELECT');

                if (scope.color && scope.color.length == 9)
                    scope.color = scope.color.replace(/#FF/gi, "#");

                scope.customColor = scope.color;

                var idElem = 'colorPicker_' + scope.$id;

                element.attr('id', idElem);

                xaDirectiveHelper.setTestIdOnElement(element, 'cpi', attrs.inputValue);


                scope.togglePopup = togglePopup;
                scope.selectColor = selectColor;

                if (scope.autoOpen) {
                    $timeout(function () {
                        togglePopup();
                    });
                }

                var colorPickerContextId = 'colorPicker' + scope.$id;
                var $tpl = null;
                var isVisible = false;
                function togglePopup(evt) {
                    if (evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                    }

                    if (!$tpl) {
                        $tpl = $compile('<xa-color-picker-popup xa-positioner="' + idElem + '" />')(scope, function (clone, popupScope) {
                            $('body').append(clone);

                            popupScope.positionSetEvent = function () {
                                open();
                                popupScope.positionSetEvent = undefined;
                            }
                        });
                    }
                    else {
                        if (!isVisible) open();
                        else close();
                    }

                    function open() {
                        $tpl.addClass('opened');
                        $timeout(function () { // need timeout because click is triggered automatically!
                            $(document).on('click.colorPicker', function (evt) {
                                if ($(evt.target).hasClass('colorPickerPopup') || $(evt.target).closest('.colorPickerPopup').length > 0) return;

                                close();
                            });
                        }, 0, false);

                        xaKeyboard.setContext(colorPickerContextId);
                        xaKeyboard.bind('esc', close, colorPickerContextId);
                        isVisible = true;
                    }

                    function close() {
                        $tpl.removeClass('opened');
                        $(document).off('click.colorPicker');

                        xaKeyboard.unbind('esc', colorPickerContextId);
                        xaKeyboard.resetContext(colorPickerContextId);

                        isVisible = false;
                    }
                }

                function selectColor(newColor, evt) {
                    scope.customColor = newColor;

                    var willChangeFn = scope.willChange ? scope.willChange() : undefined;
                    if (willChangeFn) {
                        var res = willChangeFn(newColor, scope.color);
                        if (res === false) return false;
                    }

                    var oldColor = scope.color;
                    scope.color = newColor;

                    if (newColor) //TOGGLE POPUP  ONLY FOR SELECTING COLOR, NOT ALSO FOR reseting
                        togglePopup(evt);

                    xaDirectiveHelper.removeErrorTooltip(element);

                    var didChangeFn = scope.didChange ? scope.didChange() : undefined;
                    if (didChangeFn) {
                        $timeout(function () {
                            didChangeFn(scope.color, oldColor);
                        });
                    }
                }


                scope.removeColor = function () {
                    selectColor(null);
                }
                scope.$on('$destroy', function () {
                    if ($tpl) $tpl.remove();
                });

                scope.colorList = ['#FFFFFF', '#000000', '#EEECE1', '#1F497D', '#4F81BD', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646',
                    '#F2F2F2', '#808080', '#DDD9C3', '#C5D9F1', '#DBE5F1', '#F2DDDC', '#EAF1DD', '#E5E0EC', '#DBEEF3', '#FDE9D9',
                    '#D8D8D8', '#5A5A5A', '#C5BE97', '#8DB4E3', '#B8CCE4', '#E6B9B8', '#D7E4BC', '#CCC0DA', '#B6DDE8', '#FCD5B4',
                    '#BFBFBF', '#404040', '#948B54', '#538ED5', '#95B3D7', '#D99795', '#C2D69A', '#B2A1C7', '#93CDDD', '#FAC090',
                    '#A5A5A5', '#272727', '#4A452A', '#17375D', '#376091', '#953735', '#75923C', '#60497B', '#31849B', '#E46D0A',
                    '#7F7F7F', '#0D0D0D', '#1D1B11', '#0F253F', '#254061', '#632523', '#4F6228', '#3F3151', '#215867', '#974807',
                    '#C00000', '#FF0000', '#FFC000', '#FFFF00', '#92D050', '#00B050', '#00B0F0', '#0070C0', '#002060', '#7030A0'];
            }
        };
    });

})(window.XaNgFrameworkColorPicker);
