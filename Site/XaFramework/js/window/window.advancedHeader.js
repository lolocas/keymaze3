(function (local) {
    'use strict';

    local.directive('xaWindowAdvancedHeader', function (xaTranslation) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: '../js/window/advancedHeader.tpl.html',
                link: function postLink(scope, element, attrs) {

                	var unwatchHideClose = angular.noop;
                	var unwatchHideValidate = angular.noop;
                	var unwatchFormStatus = angular.noop;
                	var unwatchModalTitle = angular.noop;

                	scope.menuCenterTemplateUrl = attrs.menucentertemplateurl || '../js/window/empty.tpl.html';
                	scope.menuRightTemplateUrl = attrs.menurighttemplateurl || '../js/window/empty.tpl.html';
                	scope.menuLeftTemplateUrl = attrs.menulefttemplateurl || '../js/window/empty.tpl.html';

                	if (attrs.icon)
                		scope.modalIcon = attrs.icon;

                	if (attrs.resourceKey)
                		scope.modalTitle = xaTranslation.instant(attrs.resourceKey);

                	if (attrs.dynicon)
                		scope.modalIcon = attrs.dynicon !== undefined && scope.$eval(attrs.dynicon);

                	if (attrs.dyntitle)
                	    unwatchModalTitle = scope.$watch(attrs.dyntitle, function (newValue) { scope.modalTitle = newValue });


                	if (attrs.formStatus == undefined || attrs.formStatus === 'CONSULT' || attrs.formStatus === 'EDIT' || attrs.formStatus === 'CREATE')
                		scope.formStatus = attrs.formStatus;
                	else
                		unwatchFormStatus = scope.$watch(attrs.formStatus, function (newValue) { scope.formStatus = newValue; });

                	if (attrs.hideclose == undefined || attrs.hideclose === 'true' || attrs.hideclose === 'false')
                		scope.hideClose = attrs.hideclose !== undefined && scope.$eval(attrs.hideclose);
					else
                		unwatchHideClose = scope.$watch(attrs.hideclose, function (newValue) { scope.hideClose = newValue; });
                
                	if (attrs.hidevalidate == undefined || attrs.hidevalidate === 'true' || attrs.hidevalidate === 'false')
                		scope.hideValidate = attrs.hidevalidate !== undefined && scope.$eval(attrs.hidevalidate);
                	else
                		unwatchHideValidate = scope.$watch(attrs.hidevalidate, function (newValue) { scope.hideValidate = newValue; });

                	scope.$on('$destroy', function () {
                		unwatchHideClose();
                		unwatchHideValidate();
                		unwatchFormStatus();
                		unwatchModalTitle();
                	});

                }
            };
        }
    );

})(window.XaNgFrameworkWindow);