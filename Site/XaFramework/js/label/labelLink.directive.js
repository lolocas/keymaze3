(function(local) {
	'use strict';

	local.directive('xaLabelLink', function (xaTranslation, xaDirectiveHelper) {
		return {
			restrict: 'EA',
			replace: true,
			template: '<div class="textLink" ng-click="click()"></div>',
			scope: {
			    click: '&',
			    resourceKey: '@'
			},
			link: function (scope, element, attrs) {
			    element.html(xaTranslation.getResource(scope.resourceKey));
			    xaDirectiveHelper.setTestIdOnElement(element, 'btn', scope.resourceKey);

			    scope.$on('$destroy', function () {
			        element.empty();
			        element = null;
			    });
			}
		};

	});

})(window.XaNgFrameworkLabel);