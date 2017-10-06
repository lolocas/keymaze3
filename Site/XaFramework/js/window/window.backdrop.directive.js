(function(local) {
	'use strict';

	local.directive('xaWindowBackdrop', function() {
			return {
				restrict: 'EA',
				replace: true,
				templateUrl: '../js/window/backdrop.tpl.html',
				link: function(scope, element, attrs) {
					if (attrs.backdropClass) {
						element.addClass(attrs.backdropClass);
					}
				}
			};
		}
	);

})(window.XaNgFrameworkWindow);