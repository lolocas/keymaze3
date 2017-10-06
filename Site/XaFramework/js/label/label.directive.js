(function(local) {
	'use strict';

	local.directive('xaLabel', function (xaTranslation) {

		return {
			restrict: 'EA',
			replace: true,
			template: '<div class="xaLabel"></div>',
			compile: function(tElement, tAttrs) {
			    tElement.html(xaTranslation.getResource(tAttrs.resourceKey, tAttrs.isHtml));
			}
		};

	});

})(window.XaNgFrameworkLabel);