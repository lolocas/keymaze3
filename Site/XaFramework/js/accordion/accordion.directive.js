(function (local) {
    'use strict';
    local
    .constant('accordionConfig', {
    	closeOthers: true,
    	redrawOnExpand: false
    })

    .controller('AccordionController', ['$scope', '$attrs', '$window', 'accordionConfig', function ($scope, $attrs, $window, accordionConfig) {

    // This array keeps track of the accordion groups
    this.groups = [];

    // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
    this.closeOthers = function (openGroup) {
        var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
        if (closeOthers) {
            angular.forEach(this.groups, function (group) {
                if (group !== openGroup) {
                    group.isOpen = false;
                }
            });
        }
    };

    // Redraw browser to redraw the grid display behind the accordeon
    this.redrawOnExpand = function (force) {
    	var redrawOnExpand = force || (angular.isDefined($attrs.redrawOnExpand) ? $scope.$eval($attrs.redrawOnExpand) : accordionConfig.redrawOnExpand);
    	if (redrawOnExpand) {
    		var $win = angular.element($window);
    		$win.trigger('resize');
    	}
    }


    // This is called from the accordion-group directive to add itself to the accordion
    this.addGroup = function (groupScope) {
        var that = this;
        this.groups.push(groupScope);

        groupScope.$on('$destroy', function (event) {
            that.removeGroup(groupScope);
        });
    };

    // This is called from the accordion-group directive when to remove itself
    this.removeGroup = function (group) {
        var index = this.groups.indexOf(group);
        if (index !== -1) {
            this.groups.splice(index, 1);
        }
    };

}])
.directive('xaAccordion', function () {
    return {
        restrict: 'EA',
        controller: 'AccordionController',
        transclude: true,
        replace: false,
        templateUrl: '../js/accordion/accordion.tpl.html'
    };
})
.directive('xaAccordionGroup', function (xaTranslation, xaDirectiveHelper, xaFrameworkSetting) {
    return {
        require: '^xaAccordion',         // We need this directive to be inside an accordion
        restrict: 'EA',
        transclude: true,              // It transcludes the contents of the directive into the template
        replace: true,                // The element containing the directive will be replaced with the template
        templateUrl: '../js/accordion/accordionGroup.tpl.html',
        scope: {
        	resourceKey: '@',
        	heading: '@',               // Interpolate the heading attribute onto this scope
            isOpen: '=?',
            isDisabled: '=?',
            onExpand: '&onExpand',
            onCollapse: '&onCollapse',
            virtualise: '@?',
        	redrawOnExpand:'@?'
        },
        controller: function () {
            this.setHeading = function (element) { 
                this.heading = element;
            };
        },
        link: function (scope, element, attrs, accordionCtrl, transcludeFn) {
            accordionCtrl.addGroup(scope);
            scope.wasExpanded = false;

            if (scope.resourceKey)
            	scope.heading = xaTranslation.instant(scope.resourceKey);

            xaDirectiveHelper.setTestIdOnElement(element, 'acc', scope.resourceKey);

            var unregOpen = scope.$watch('isOpen', function (value, oldValue) {
                if(value) scope.wasExpanded = true;

				// Ajout de la détection d'ouverture des accordéons.
                if (xaFrameworkSetting.TestMode === true)
				   element.find('.panel-heading').attr('tstc-is-open', value);

                if (value) {
                    accordionCtrl.closeOthers(scope);
                }

                if (value != oldValue) {
                	accordionCtrl.redrawOnExpand(scope.redrawOnExpand === 'true');

                    if (!value) {
                        var collapseFn = scope.onCollapse();
                        if (angular.isFunction(collapseFn))
                            collapseFn();
                    }
                    else
                    {
                        setTimeout(function () {
                            element.find('.panel-collapse').height('auto');
                        });
                        var expandFn = scope.onExpand();
                        if (angular.isFunction(expandFn))
                            expandFn();
                    }
                }
            });

            scope.toggleOpen = function () {
                if (!scope.isDisabled) {
                    scope.isOpen = !scope.isOpen;
                }
            };

            scope.$on('$destroy', function () {
                unregOpen();
            });
        }
    };
})
.directive('xaAccordionHeading', function () {
    return {
        restrict: 'EA',
        transclude: true,   // Grab the contents to be used as the heading
        template: '',       // In effect remove this element!
        replace: true,
        require: '^xaAccordionGroup',
        link: function (scope, element, attr, accordionGroupCtrl, transclude) {
            // Pass the heading to the accordion-group controller
            // so that it can be transcluded into the right place in the template
            // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
            accordionGroupCtrl.setHeading(transclude(scope, function () { }));
        }
    };
})
.directive('xaAccordionTransclude', function () {
    return {
        require: '^xaAccordionGroup',
        link: function (scope, element, attr, controller) {
            var unregGroup = scope.$watch(function () { return controller[attr.accordionTransclude]; }, function (heading) {
                if (heading) {
                    element.html('');
                    element.append(heading);
                }
            });

            scope.$on('$destroy', function () {
                unregGroup();
            });
        }
    };
});

})(window.XaNgFrameworkAccordion);
