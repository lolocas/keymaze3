(function (local) {
    'use strict';
    local.directive('xaSplitter', function ($rootScope, $compile) {

        var splitterHTML = '<div class="split-handler" ng-class="::{\'vertical-splitter\': orientation == \'vertical\'}"><div class="col-centered">' +
            '<a class="splitter-btn" href="javascript:void(0);" ng-click="upOrLeft()"><i class="glyphicon" ng-class="::{\'glyphicon-chevron-left\': orientation != \'vertical\', \'glyphicon-chevron-up\': orientation == \'vertical\' }"></i></a>' +
            '<a class="splitter-btn" href="javascript:void(0);" ng-click="defaultPosition()"><i class="glyphicon glyphicon-resize-horizontal"></i></a>' +
            '<a class="splitter-btn" href="javascript:void(0);" ng-click="downOrRight()"><i class="glyphicon" ng-class="::{\'glyphicon-chevron-right\': orientation != \'vertical\', \'glyphicon-chevron-down\': orientation == \'vertical\' }"></i></a>' +
            '</div></div>';

        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                orientation: '@',
                savePosition: '&?',
                loadPosition: '&?',
                position: '=?',
                canDrag: '=?'
            },
            template: '<div class="split-panes {{:: orientation}}" ng-transclude></div>',
            controller: function ($scope) {
                $scope.panes = [];

                this.addPane = function (pane) {
                    if ($scope.panes.length > 1) {
                        throw new Error('splitters can only have two panes');
                    }
                    $scope.panes.push(pane);
                    return $scope.panes.length;
                };
            },
            link: function (scope, element) {

                var compiled = $compile(splitterHTML)(scope);

                var savePositionFn = scope.savePosition ? scope.savePosition() : scope.savePosition;
                var loadPositionFn = scope.loadPosition ? scope.loadPosition() : scope.loadPosition;

                var handler = angular.element(compiled);
                var pane1 = scope.panes[0];
                var pane2 = scope.panes[1];
                var vertical = scope.orientation == 'vertical';
                var drag = false;

                var handlerHeight = 12; //keeps changing, first is 14, then 12. hardcode here until I find a better method. As long as the css is not modified, there's no issue

                if (vertical) {
                	pane2.elem.css('margin-top', handlerHeight);
                }
                else {
                	pane2.elem.css('margin-left', handlerHeight);
                }
                pane1.elem.after(handler);

                var unwatchExternalModel = scope.$watch('position', function (newVal, oldVal) {
                    if (!isUpdatingPosition && newVal)
                        updateSplitterPosition(newVal, true, true);
                });
                var isFirstLoad = true;
                var isUpdatingPosition = false;
                var updateSplitterPosition = function (heightOrWidth, resizeWindow, skipPositionUpdate) {
                    //handlerHeight = handlerHeight || handler.outerHeight(true);
                    isUpdatingPosition = true;
                    if (heightOrWidth < 10) //round to 0
                        heightOrWidth = '0%';

                    var isPercentage = heightOrWidth.toString().indexOf('%') > -1;
                    if (!skipPositionUpdate && resizeWindow) { //only update on stop moving
                        scope.position = heightOrWidth;
                        if (!scope.$$phase && !$rootScope.$$phase) scope.$apply();
                    }

                    var topHeightOrWidth = isPercentage ? heightOrWidth : heightOrWidth + 'px';

                    if (vertical) {

                        handler.css({ 'bottom': 'auto', 'top': topHeightOrWidth });

                        if (topHeightOrWidth == '100%') {
                            handler.css({ 'bottom': '0', 'top': 'auto' }); //need to leave room for scrollbar
                        }
                        else if (topHeightOrWidth == '0%')
                            handler.css({ 'bottom': 'auto', 'top': '0' });
                    }
                    else {
                        handler.css({ 'left': topHeightOrWidth, 'right': 'auto' });
                       
                        if (topHeightOrWidth == '100%') {
                            handler.css({ 'right': '0', 'left': 'auto' }); //need to leave room for scrollbar
                        }
                        else if (topHeightOrWidth == '0%')
                            handler.css({ 'right': 'auto', 'left': '0' });
                    }

                    if (resizeWindow) {
                        if (vertical) {
                            pane1.elem.css({ 'top': '0', 'bottom': '0', 'height': topHeightOrWidth });
                            if (topHeightOrWidth == '100%') pane1.elem.css('height', 'calc(100% - ' + handlerHeight + 'px)');
                            pane2.elem.css('top', topHeightOrWidth);
                        }
                        else {
                            pane1.elem.css('width', topHeightOrWidth);
                            if (topHeightOrWidth == '100%') pane1.elem.css('width', 'calc(100% - ' + handlerHeight + 'px)');
                            pane2.elem.css('left', topHeightOrWidth);
                        }
                        if (isFirstLoad)
                        	isFirstLoad = false;
                        else {
                        	if (angular.isFunction(savePositionFn)) savePositionFn(heightOrWidth);

                        	$(window).resize();
                        }
                    }

                    setTimeout(function () { //wait for digest to NOT execute, then release
                        isUpdatingPosition = false;
                    });
                };

                if (angular.isFunction(loadPositionFn)) {
                    var topPos = loadPositionFn();
                    if (topPos != undefined && topPos != null)
                    	scope.position = topPos;
                }

                if (scope.position == undefined)
                	scope.position = '50%';

                updateSplitterPosition(scope.position, true);
                //if (window.localStorage['splh']) {
                //    var savedHeight = +window.localStorage['splh'];
                //    updateSplitterPosition(savedHeight, true);
                //}

                scope.upOrLeft = function () {
                	var updatePos = angular.isDefined(scope.canDrag) ? scope.canDrag : true
                	if (updatePos) {
						updateSplitterPosition('0%', true);
                	}
                }

                scope.downOrRight = function () {
                	var updatePos = angular.isDefined(scope.canDrag) ? scope.canDrag : true
                	if (updatePos) {
                		updateSplitterPosition('100%', true);
                	}
                }

                scope.defaultPosition = function () {
                	var updatePos = angular.isDefined(scope.canDrag) ? scope.canDrag : true
                	if (updatePos && loadPositionFn) {
                		var position = loadPositionFn(true);
                		updateSplitterPosition(position, true);
                	}
                }

                var startPos = 0;
                var endPos = 0;

                var splitterMove = function (clientX, clientY) {
                    if (!drag) return;

                    var bounds = element[0].getBoundingClientRect();
                    var pos = 0;

                    if (vertical) {
                        //var height = bounds.bottom - bounds.top;
                        pos = clientY - bounds.top;
                        if (bounds.bottom - handlerHeight < clientY)
                            pos = bounds.bottom - handlerHeight - bounds.top;

                    } else {
                        //var width = bounds.right - bounds.left;
                        pos = clientX - bounds.left;
                    }



                    if (!startPos) startPos = pos;
                    else endPos = pos;

                    if (startPos && endPos) // && Math.abs(startPos - endPos) > 10)
                        updateSplitterPosition(pos);

                };

                handler.on('mousedown touchstart', function (evt) {
                    //if (evt.button != 0) return;
                    evt.preventDefault();
                    drag = angular.isDefined(scope.canDrag) ? scope.canDrag : true;
                    startPos = 0;
                    endPos = 0;

                    handler.addClass('active');
                });

                element.on('mousemove', function (evt) {
                    if (!drag) return;

                    splitterMove(evt.clientX, evt.clientY);
                });
                element.on('touchmove', function (evt) {
                    if (!drag) return;

                    evt.preventDefault();
                    var orig = evt.originalEvent;
                    //page = vertical ? orig.changedTouches[0].pageY : orig.changedTouches[0].pageX;

                    splitterMove(orig.changedTouches[0].pageX, orig.changedTouches[0].pageY);
                });

                function documentMouseUpHandler() {
                    handler.removeClass('active');

                    if (!drag) return;
                    drag = false;
                    

                    if (startPos != endPos) {
                        //$(window).resize(); //trigger fake window resize to re-calculate grids height and width

                        //use percentage
                        var posPerc = 0;

                        if (vertical) {
                            var totalHeight = element.height();
                            var topHeightPX = +handler.css('top').replace('px', '');
                            posPerc = Math.floor(topHeightPX * 100 / totalHeight, 2) + '%';

							//raul: we do a rounding when the handler is 1% to the bottom, to hide pane2 completely!
                            if (totalHeight - topHeightPX - handlerHeight <= 10) //10 px offset, just put 100%
                                posPerc = '100%';
                        }
                        else {
                            var totalWidth = element.width();
                            var leftWidthPX = +handler.css('left').replace('px', '');
                            posPerc = Math.floor(leftWidthPX * 100 / totalWidth, 2) + '%';
                        }
				        //window.localStorage['splh'] = pane1.elem.height();

                        updateSplitterPosition(posPerc, true, true);
                    }
                }

                angular.element(document).on('touchend.splitter-' + scope.$id + ' mouseup.splitter-' + scope.$id, documentMouseUpHandler);

                scope.$on('$destroy', function () {
                    unwatchExternalModel();
                    element.off();
                    handler.off();
                    handler.remove();
                    angular.element(document).off('touchend.splitter-' + scope.$id + ' mouseup.splitter-' + scope.$id, documentMouseUpHandler);
                });
            }
        };
    });

    local.directive('xaPane', function () {
        return {
            restrict: 'E',
            require: '^xaSplitter',
            replace: true,
            transclude: true,
            scope: {

            },
            template: '<div class="xa-splitter-pane split-pane{{index}}" ng-transclude></div>',
            link: function (scope, element, attrs, xaSplitterCtrl) {
                scope.elem = element; // TODO: DOM references in scope should be avoided: http://thenittygritty.co/angularjs-pitfalls-using-scopes
                scope.index = xaSplitterCtrl.addPane(scope);

                scope.$on('$destroy', function () {
                    scope.elem = null; //raul: this was in the original splitter code.
                });
            }
        };
    });

})(window.XaNgFrameworkSplitter);
