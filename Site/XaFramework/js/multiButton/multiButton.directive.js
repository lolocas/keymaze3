(function (local) {
    'use strict';

    local.directive('xaMultiButton', function ($timeout, xaTranslation, xaDirectiveHelper) {

        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/multiButton/multiButton.tpl.html',
            scope: {
			 	actionList: '=actionlist'
            },
            link: function (scope, element, attr) {
                scope.enableMenu = false;
                scope.showListMenu = false;
                scope.menuActions = [];

                if (!attr.testId)
                	xaDirectiveHelper.setTestIdOnElement(element, "btn", "CurrentAction" )
                
                function menuActionFilter (a) {
                    return scope.selectedAction && scope.selectedAction.name !== a.name;
                }

                var unwatchActList = scope.$watchCollection('actionList', function () {
                    scope.actionList.forEach(function (item) {
                    	item.label = xaTranslation.instant(item.name);
                    	item.testId = xaDirectiveHelper.getTestId("mbtn", item.name.replace('TXT_', ''));
                    });
                    scope.selectedAction = _.first(scope.actionList);
                    scope.menuActions = _.filter(scope.actionList, menuActionFilter);
                    scope.enableMenu = _.any(scope.menuActions);

                });

                scope.actionClick = function (action, $event) {
                	action.action(action.code);
                    $event.preventDefault();
                };

                var $detail = element.find('.dropdown-menu');
                scope.toggleMenu = function ($evt) {
                    $evt.preventDefault();
                    if (element.hasClass('open')) {
                        element.removeClass("open");
                        $(document).off('click.multibutton');
                    }
                    else {
                        element.addClass("open");
                        $timeout(function () {
                            $(document).on('click.multibutton', function (evt) {
                                if ($(evt.target).hasClass('dropdown-menu')) return;

                                element.removeClass("open");
                                $(document).off('click.multibutton');
                            })
                        }, 0, false);
                    }
                }

                scope.$on('$destroy', function () {
                    $(document).off('click.multibutton');
                    unwatchActList();
                });
            }
        };
    });


})(window.XaNgFrameworkMultiButton);
