(function (local) {
    'use strict';
    local.controller('TabsetController', function TabsetCtrl($scope) {
    var ctrl = this,
        tabs = ctrl.tabs = $scope.tabs = [];


    ctrl.isDisposing = false;
    ctrl.select = function (selectedTab) {
    	if (ctrl.isDisposing)
    		return;

        angular.forEach(tabs, function (tab) {
            if (tab.active && tab !== selectedTab) {
                tab.active = false;

                var deselectFn = tab.onDeselect();
                if (angular.isFunction(deselectFn) && !tab.isDisposing)
                    deselectFn();
            }
        });
        selectedTab.active = true;

        var selectFn = selectedTab.onSelect();
        if(angular.isFunction(selectFn) && !selectedTab.isDisposing)
            selectFn();
    };

    ctrl.addTab = function addTab(tab) {
        tabs.push(tab);
        // we can't run the select function on the first tab
        // since that would select it twice
        if (tabs.length === 1) {
            tab.active = true;
        } else if (tab.active) {
            ctrl.select(tab);
        }
    };

    ctrl.removeTab = function removeTab(tab) {
        var index = tabs.indexOf(tab);
        //Select a new tab if the tab to be removed is selected
        if (tab.active && tabs.length > 1) {
            //If this is the last tab, select the previous tab. else, the next tab.
            var newActiveIndex = 0;
            ctrl.select(tabs[newActiveIndex]);
        }
        tabs.splice(index, 1);
    };
})

.directive('xaTab', function (xaTranslation) {
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            type: '@',
            theme: '@?',
        },
        controller: 'TabsetController',
        templateUrl: '../js/tab/tab.tpl.html',
        link: function (scope, element, attrs, controller) {
            if (!scope.theme) scope.theme = 'modern';
            //if (scope.fixedHeader) {
            //    element.addClass('fixedTab');
            //}

            scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
            scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;

            scope.$on('$destroy', function () {
            	controller.isDisposing = true;
            	
            });
        }
    };
})

.directive('xaTabItem', function ($parse,$timeout, $window, xaTranslation, xaDirectiveHelper) {
    return {
        require: '^xaTab',
        restrict: 'EA',
        transclude: true,
        replace: true,
        templateUrl: '../js/tab/tabItem.tpl.html',
        scope: {
            active: '=?',
            resourceKey: '@',
            heading: '@',
            onSelect: '&onSelect', //This callback is called in contentHeadingTransclude
            //once it inserts the tab's content into the dom
            onDeselect: '&onDeselect',
            redrawOnActive: '@?',
            virtualise: '@?'
        },
        controller: function () {
            //Empty controller so other directives can require being 'under' a tab
        },
        compile: function (elm, attrs, transclude) {
            //scope.wasExpanded = false;
            return function postLink(scope, elm, attrs, tabsetCtrl) {



                var unwatchActive = scope.$watch('active', function (active) {
                    if (active) {
                        //scope.wasExpanded = true;
                        tabsetCtrl.select(scope);
                       
                        if (scope.redrawOnActive) {
                        	$timeout(function () {
                        		var $win = angular.element($window);
                        		$win.trigger('resize');
                        	},0,false);
                        }
                    }
                });

               

                scope.disabled = false;
                var unwatchDis = null;
                if (attrs.disabled) {
                    unwatchDis = scope.$parent.$watch($parse(attrs.disabled), function (value) {
                        scope.disabled = !!value;
                    });
                }

                scope.select = function () {
                    if (!scope.disabled) {
                        scope.active = true;
                    }
                };

                tabsetCtrl.addTab(scope);
                scope.$on('$destroy', function () {
                	scope.isDisposing = true;
                	tabsetCtrl.removeTab(scope);
                    unwatchActive();
                    if (unwatchDis)
                        unwatchDis();
                });

                //We need to transclude later, once the content container is ready.
                //when this link happens, we're inside a tab heading.
                scope.$transcludeFn = transclude;
            };
        }
    };
})

.directive('xaTabContentTransclude', function () {
    return {
        restrict: 'A',
        require: '^xaTab',
        link: function (scope, elm, attrs) {
            var tab = scope.$eval(attrs.xaTabContentTransclude);

            //Now our tab is ready to be transcluded: both the tab heading area
            //and the tab content area are loaded.  Transclude 'em both.
           
            var doTransclusion = function () {
                if (wasTrancl) return;
             
                wasTrancl = true;
                tab.$transcludeFn(tab.$parent, function (contents) {
                    angular.forEach(contents, function (node) {
                        if (isTabHeading(node)) {
                            //Let tabHeadingTransclude know.
                            tab.headingElement = node;
                        } else {
                            elm.append(node);
                        }
                    });
                });
            };

            var wasTrancl = false;
            if (tab.virtualise) {
                tab.$watch('active', function (newVal) {
                    if (newVal && tab.virtualise)
                        doTransclusion();
                });
            }
            else doTransclusion();

        }
    };
    function isTabHeading(node) {
        return node.tagName && (
          node.hasAttribute('tab-heading') ||
          node.hasAttribute('data-tab-heading') ||
          node.tagName.toLowerCase() === 'tab-heading' ||
          node.tagName.toLowerCase() === 'data-tab-heading'
        );
    }
});


})(window.XaNgFrameworkTab);
