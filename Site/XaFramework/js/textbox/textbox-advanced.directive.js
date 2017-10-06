(function (local) {
	'use strict';

	local.directive('xaTextBoxAdvanced', function ($timeout, $rootScope, xaKeyHelper, xaTranslation, xaKeyboard, xaDirectiveHelper) {

		var selectionThrottleDelay = 50;
		var minLengthError = xaTranslation.instant('TXT_NUMBERMINERROR_TITRE');

		return {
			restrict: 'EA',
			replace: true,
			templateUrl: '../js/textbox/textbox-advanced.tpl.html',
			scope: {
				inputValue: '=',
				canedit: '=?',
				willChange: '&?',
				didChange: '&?',
				onEnter: '&?',
				onlyNumeric: '@?',
				minlength: '@?',
				ignoreChars: '@?',
				buttons: '=',
				maxlength: '@?',
				capitalize: '@?',
				defaultValue: '='
			},
			link: function (scope, element, attrs) {

				scope.restoreDefaultValue = function () {
					scope.inputValue = scope.defaultValue;
				};
			}
		};

	});

})(window.XaNgFrameworkTextBox);
