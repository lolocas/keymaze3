(function (local) {
    'use strict';
    local.directive('xaImageCheckbox', function ($timeout, xaTranslation) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/imageCheckbox/imageCheckbox.tpl.html',
            scope: {
                imageForTrue: '@?',
                imageForFalse: '@?',
                isChecked: '=inputValue',
                willChange: '&?',
                didChange: '&?',
                canedit: '='
            },
            link: function (scope, element, attrs, modelCtrl) {
                var lblElem = element.find('span.lbl');

                lblElem.html(xaTranslation.getResource(attrs.resourceKey, attrs.isHtml));

                scope._isCheckedInternal = scope.isChecked;
                if (scope.canedit === false)
                    element.attr('disabled', '');

                // Check if name attribute is set and if so add it to the DOM element
                if (scope.name !== undefined) {
                    element.name = scope.name;
                }

                scope.$watch('isChecked', function (newVal) {
                    if (newVal != scope._isCheckedInternal) {
                        scope._isCheckedInternal = newVal;
                        changeImage();
                    }
                });

                // On click swap value and trigger onChange function
                element.on("click", function () {
                    
                    scope.$apply(function () {

                        scope._isCheckedInternal = !scope._isCheckedInternal;

                        var fnWillChange = scope.willChange ? scope.willChange() : undefined;
                        var fnDidChange = scope.didChange ? scope.didChange() : undefined;

                        var cont = true;
                        if (angular.isFunction(fnWillChange))
                            cont = fnWillChange(scope.isChecked);
                        if (cont === false) {
                            scope._isCheckedInternal = scope.isChecked; //cancel changes
                            return;
                        }

                        var oldVal = scope.isChecked;
                        scope.isChecked = scope._isCheckedInternal;

                        if (angular.isFunction(fnDidChange)) {
                            $timeout(function () {
                                fnDidChange(scope.isChecked, oldVal);
                            });
                        }
                        changeImage();
                    });
                });

                setTimeout(changeImage);

                function changeImage() {
                    element.find('img').attr('src', scope.isChecked ? scope.imageForTrue : scope.imageForFalse);
                }

                scope.$on('$destroy', function () {
                    element.off('click');
                });
            }
        };
    });

})(window.XaNgFrameworkImageCheckbox);
