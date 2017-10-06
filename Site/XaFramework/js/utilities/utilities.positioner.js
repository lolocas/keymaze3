(function (local) {
    'use strict';

    /*
     * This directive is used for auto-positioning of elements when they are not visible on the screen,
     * such as xaDatePicker, xaCamboBox, etc.
     * It works by setting css classes on the target element: left, right, top, bottom.
     * It is up to consumer to set the css as needed.
     * To activate, simply broadcast from the scope an event like: scope.$broadcast('updatePosition', defaultPos);
     * where defaultPos is something the user would set. In case there is no space in the current viewport
     * for the defaultPos, the value is not taken into account.
     */
    local.directive('xaPositioner', function ($window) {

        function getBoundingRectangle(el) {
            return el[0].getBoundingClientRect();
        }

        return {
            restrict: 'A',
            priority: 199,
            scope: false,
            link: xaPositionerLinkFn
        };

        function xaPositionerLinkFn(scope, element, attrs) {

            var animid,
					parentElement,
					windowElement = angular.element($window),
					scrollableContainer;

            var once = attrs.$observe('xaPositioner', function (id) {
                if (!id) {
                    throw new Error('xaPositioner: invalid parent selector.');
                }
                var parentId = null; //'#' + attrs.xaPositioner;

                parentElement = null;
                if (attrs.xaPositioner) {
                    parentId = attrs.xaPositioner;
                    if (parentId.match(/^[A-Z]/i)) //if selector is ID, prepend #
                        parentId = "#" + attrs.xaPositioner;

                    if (parentId.indexOf("#") == 0) //escape string if selector is ID because, for example, search with id that contains / or : does not work
                        parentId = parentId.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");

                    parentElement = $(parentId); //ref elem is hardcoded with ID
                }

                scrollableContainer = parentElement.closest(":scrollable(vertical)"); //todo stefan: this is specific for combobox?!! isolate it behind a flag!!!
                attachHandlers();
                deferedRepositioning();
                once();
            });

            function doPosition() {
                positioner.positionElementToRef(element, parentElement, attrs.forcePosition, attrs.autoWidth, scope.isCombo, scope.width);
                if (scope.positionSetEvent) scope.positionSetEvent();
            }

            function deferedRepositioning() {
                cancelAnimationFrame(animid);
                animid = requestAnimationFrame(doPosition);
            }


            scope.updatePosition = deferedRepositioning; // updatePosition;


            function notifyScroll() {
                scope.$eval(attrs.xaPositionerOnScroll);
            }

            function attachHandlers() {
                detachHandlers();
                windowElement.on('resize', deferedRepositioning);
                scrollableContainer.on('scroll', notifyScroll); //todo: maybe have a flag to activate this?!?
            }

            function detachHandlers() {
                windowElement.off('resize', deferedRepositioning);
                scrollableContainer.off('scroll', notifyScroll);
            }

            scope.$on('$destroy', function () {
                detachHandlers();
                cancelAnimationFrame(animid);
                element.remove();
            });
        }

    });



})(window.XaNgFrameworkUtilities);