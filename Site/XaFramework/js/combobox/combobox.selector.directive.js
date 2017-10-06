(function(local) {
	'use strict';

	local.directive('xaComboBoxPopup', function($timeout) {

		return {
			restrict: 'E',
			replace: true,
			templateUrl: '../js/combobox/xa-combobox.selector.tpl.html',
			compile: function() {
				return {
					post: postLinkingFn
				};
			}
		};

		function postLinkingFn(scope, element) {

			var scrollBlurCanceletion,
				gridViewPort;

			element.attr({ id: 'pop-' + scope.ownerId });

			scope.$on('$destroy', function () {
				element.off();
			});


		}
	});


})(window.XaNgFrameworkComboBox);