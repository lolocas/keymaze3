(function (local) {
    'use strict';
    local.directive('xaWidget', function ($timeout, $injector, $q, $rootScope, $controller, $compile, $templateCache, $http, $log, xaDirectiveHelper) {
        return {
            restrict: 'EA',
            replace: true,
            //priority: 99,
            templateUrl: '../js/widgetContainer/widget.tpl.html',
            scope: {
                widgetInfo: '=widgetInfo'
            },
            link: function (scope, element, attrs) {

                var debug = false;

                var widgetScope = null;
                var $widget = element.find('.widget');

                var colLen = scope.$parent.colLen;
                var colWidth = scope.$parent.colWidth;

                xaDirectiveHelper.setTestIdOnElement(element, 'wid', scope.widgetInfo.numeroJob + "-" + scope.widgetInfo.controller);

                $(document.body).addClass('hideBodyForWidgetPrint');

                scope.menu = {
                    text: 'action',
                    menuOptionList: [
                        { text: '<i class="glyphicon glyphicon-arrow-left"></i>', val: 'left' },
                        { text: '<i class="glyphicon glyphicon-arrow-right"></i>', val: 'right' },
                        { text: '<i class="glyphicon glyphicon-arrow-up"></i>', val: 'up' },
                        { text: '<i class="glyphicon glyphicon-arrow-up"></i> +', val: 'up-newrow' },
                        { text: '<i class="glyphicon glyphicon-arrow-down"></i>', val: 'down' },
                        { text: '<i class="glyphicon glyphicon-arrow-down"></i> +', val: 'down-newrow' },
                        { text: '<i class="glyphicon glyphicon glyphicon-zoom-in"></i>', val: 'grow' },
                        { text: '<i class="glyphicon glyphicon glyphicon-zoom-out"></i>', val: 'shrink' },
                        { text: '<i class="glyphicon glyphicon-resize-full"></i>', val: 'grow-h' },
                        { text: '<i class="glyphicon glyphicon-resize-small"></i>', val: 'shrink-h' },
                        { text: '<i class="glyphicon glyphicon glyphicon-print"></i>', val: 'print' },
                        { text: '<i class="glyphicon glyphicon-remove"></i>', val: 'remove' },
                        { text: '<i class="glyphicon glyphicon glyphicon-pencil"></i>', val: 'edit' }
                    ],
                    click: function(item) {
                        switch (item.val) {
                            case 'left': moveLeft();break;
                            case 'right': moveRight();break;
                            case 'up': moveUp();break;
                            case 'up-newrow': moveUp(true);break;
                            case 'down': moveDown();break;
                            case 'down-newrow': moveDown(true);break;
                            case 'grow': resize(1); break;
                            case 'shrink': resize(-1); break;
                            case 'grow-h': resize(0, 1); break;
                            case 'shrink-h': resize(0, -1); break;
                            case 'print': print(); break;
                            case 'edit': edit(); break;
                            case 'remove': remove(); break;
                        }
                    }
                };

                //$log.debug('widget init');

                function print() {
                    var html = element.clone().css({
                        'margin': '10px 20%',
                        'position': '',
                        'width': '60%'
                    }).get(0).outerHTML;
                    scope.$parent.print(html);
                }

                function edit() {
                    if (widgetScope && widgetScope.vm && widgetScope.vm.editFn) {
                        widgetScope.vm.editFn();
                    }
                }

                function remove() {
                    removeWidget();
                }

                //order change! +/-1 
                function moveLeft() {
                    moveWidget(-1);
                };
                function moveRight() {
                    moveWidget(+1);
                };

                function moveUp(shiftRows) {
                    moveWidget(0, -1, shiftRows);
                };
                function moveDown(shiftRows) {
                    moveWidget(0, 1, shiftRows);
                };

                function updateDebugInfo() {
                    if (debug)
                        $widget.find('.debug-footer').html('row: ' + scope.widget.row + '; column: ' + scope.widget.col + ', colspan: ' + scope.widget.colspan + ', offset: ' + scope.widget.offset);
                }

                scope.$parent.afterAlignHandler(updateDebugInfo);

                var unwatchWidgetInfo = scope.$watch('widgetInfo', initializeWidget);

                function initializeWidget(winfo) {
                    if (!winfo) return;

                    element.attr('data-name', winfo.name);

                    $widget.empty();

                    if (winfo.cssClass) element.addClass(winfo.cssClass);
                    $widget.append('<h2 class="title">' + winfo.title + '</h2>'); //todo support template / html titles!

                    var initPromise = null;
                    if (winfo.template) {
                        initPromise = generateInlineTemplate(winfo);
                    }
                    else if (winfo.templateUrl) {
                        initPromise = generateRemoteTemplate(winfo);
                    }

                    initPromise.then(function () {
                        if (debug) $widget.append('<div class="debug-footer"></div>');

                        $widget.find('.body').css('height', getMaxHeight());

                        notifyWidgetReady();
                    });
                }

                function generateInlineTemplate(winfo) {
                    var def = $q.defer();
                    $widget.append('<div class="body clearfix">' + winfo.template + '</div>');
                    def.resolve();
                    return def.promise;
                }

                function generateRemoteTemplate(winfo) {
                    var def = $q.defer();

                    var templateUrl = winfo.templateUrl;

                    var deffer = $q.deffer;

                    function getTemplatePromise(tpl) {
                        return tpl ? $q.when(tpl) :
                            $http.get(angular.isFunction(templateUrl) ? (templateUrl)() : templateUrl,
                            { cache: $templateCache }).then(function (result) {
                                return result.data;
                            });
                    };

                    function getResolvePromises(resolves) {
                        var promisesArr = [];
                        angular.forEach(resolves, function (value) {
                            if (angular.isFunction(value) || angular.isArray(value)) {
                                promisesArr.push($q.when($injector.invoke(value)));
                            }
                        });
                        return promisesArr;
                    }

                    // Compatibilité dans analyse
                    if (winfo.numeroJob) {
                        winfo.resolve = {
                            formParam:
                                function () {
                                    return { numeroJob: winfo.numeroJob }
                                }
                        };
                    }
                    // Compatibilité pour exploitation.
                    else
                    {
                        winfo.resolve = {
                            formParam:
                                function () {
                                    return { parametre: winfo.parametre }
                                }
                        };
                    }

                    var resolve = winfo.resolve || {}; //add here stuff to resolve?!

                    var templateAndResolvePromise =
                            $q.all([getTemplatePromise()].concat(getResolvePromises(resolve)));

                    templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {
                        widgetScope = scope.$new();
                        widgetScope.close = function () { };//add stuff to scope

                        var ctrlInstance, ctrlLocals = {};
                        var resolveIter = 1;

                        ctrlLocals.$scope = widgetScope;
                        ctrlLocals.$widget = { close: function () { } };

                        widgetScope.close = function () { };

                        winfo.props = winfo.props || {};
                        widgetScope.getProp = function (key) {
                            return winfo.props[key];
                        };
                        widgetScope.setProp = function (key, value) {
                            winfo.props[key] = value;

                            notifyWidgetSave();
                        };

                        angular.forEach(winfo.resolve, function (value, key) {
                            ctrlLocals[key] = tplAndVars[resolveIter++];
                        });

                        ctrlLocals['$windowInstance'] = {};

                        ctrlInstance = $controller(winfo.controller, ctrlLocals);
                        var hasControllerLoaded = false;
                        if (ctrlInstance.willTriggerLoadEvent) {
                            ctrlInstance.widgetLoaded = function () {
                                hasControllerLoaded = true;
                                $timeout(function () { //wait for digest
                                    def.resolve();
                                });
                            }
                        } else {
                            hasControllerLoaded = true; 
                        }

                        if (winfo.ctrlAs) {
                            widgetScope[winfo.ctrlAs] = ctrlInstance;
                        }

                        if (ctrlInstance.init)
                            ctrlInstance.init();

                        var template = tplAndVars[0];

                        $compile(template)(widgetScope, function (cloned, chScope) {
                            $timeout(function () {
                                $widget.append($('<div class="body clearfix"></div>').append(cloned));
                                $(window).trigger('resize'); //force grid calculation inside widget! maybe move to a flag?!?!

                                if (hasControllerLoaded) { //resolve only if controller loaded before compile
                                    def.resolve();
                                }
                                
                            }, 0, false); //raul: check this working
                        });
                    });

                    return def.promise;
                }

                function notifyWidgetSave() {
                    scope.$parent.saveWidgetsState && scope.$parent.saveWidgetsState();
                }
                function notifyWidgetReady() {
                    scope.$parent.initDone && scope.$parent.initDone();
                }
                function notifyParentRedraw() {
                    scope.$parent.alignWidgets && scope.$parent.alignWidgets();
                }
                function moveWidget(colOffset, rowOffset, shiftRows) {
                    scope.$parent.moveWidget && scope.$parent.moveWidget(element.attr('data-name'), colOffset, rowOffset, shiftRows);
                }
                function resize(factorW, factorH) {
                    scope.$parent.resize && scope.$parent.resize(element.attr('data-name'), factorW, factorH, element);
                    $(window).trigger('resize');
                }

                function removeWidget() {
                    element.remove();
                    scope.$parent.removeWidget && scope.$parent.removeWidget(element.attr('data-name'));
                }

                function getMaxHeight() {
                    return scope.$parent.widgetDetail.maxHeight;
                }

                element.on('click', function () {
                    scope.$apply(function () {
                        scope.$parent.select(scope.widgetInfo);
                    });
                });

                scope.$on('$destroy', function () {
                	unwatchWidgetInfo();
                	$(document.body).removeClass('hideBodyForWidgetPrint');
                	element.off('click');
                	if (widgetScope) {
                	    if (widgetScope.vm && widgetScope.vm.unload) widgetScope.vm.unload();
                	    widgetScope.$destroy();
                	}
                });
            }
        };
    });

})(window.XaNgFrameworkWidgetContainer);
