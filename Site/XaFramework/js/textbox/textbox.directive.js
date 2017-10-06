(function (local) {
	'use strict';

	local.directive('xaTextBox', function ($timeout, $rootScope, xaKeyHelper, xaTranslation, xaKeyboard, xaDirectiveHelper) {

		var selectionThrottleDelay = 50;
		var minLengthError = xaTranslation.instant('TXT_NUMBERMINERROR_TITRE');

		return {
			restrict: 'EA',
			replace: true,
			templateUrl: '../js/textbox/textbox.tpl.html',
			scope: {
				inputValue: '=',
				canedit: '=?',
				willChange: '&?',
				didChange: '&?',
				onEnter: '&?',
				onlyNumeric: '@?',
				minlength: '@?',
				ignoreChars: '@?',
				maxlength: '@?',
				capitalize: '@?'
			},
			link: function (scope, element, attrs) {

				if (scope.canedit == undefined) scope.canedit = true;
				var textElement = element.find('input');

				if (attrs.maxlength)
					textElement.attr('maxlength', attrs.maxlength);

				xaDirectiveHelper.setTestIdOnElement(element, 'txt', attrs.inputValue);

				scope.internalValue = scope.inputValue;

				var unwatchExternalModel = scope.$watch('inputValue', function (newVal, oldVal) {
					if (scope.capitalize == "true" && newVal) newVal = newVal.toUpperCase();
					scope.internalValue = newVal;
				});

				var unwatchModel = scope.$watch("internalValue", function (newVal, oldVal) {
					if (scope.inputValue == scope.internalValue) return;
					if (!newVal) newVal = textElement.val();

					if (scope.capitalize == "true" && newVal) newVal = newVal.toUpperCase();

					//validate minlength
					if (scope.minlength && textElement.val().length < scope.minlength) {
						showError(minLengthError);
						scope.internalValue = scope.inputValue;
						return;
					}
					removeError();

					var willChangeFn = scope.willChange ? scope.willChange() : undefined;
					var didChangeFn = scope.didChange ? scope.didChange() : undefined;
					var onEnterFn = scope.onEnter ? scope.onEnter() : undefined;

					var cont = true;
					if (angular.isFunction(willChangeFn))
						cont = willChangeFn(newVal, oldVal);

					if (cont === false) {
						$timeout(function () {
							scope.internalValue = scope.inputValue;
						});
					}
					else {
						scope.inputValue = newVal;
						xaDirectiveHelper.removeErrorTooltip(element);
						if (angular.isFunction(didChangeFn) || (xaKeyHelper.isEnter(lastKey) && angular.isFunction(onEnterFn)))
							$timeout(function () {
								if (angular.isFunction(didChangeFn))
									didChangeFn(newVal, oldVal);


								if (xaKeyHelper.isEnter(lastKey) && angular.isFunction(onEnterFn)) {
									lastKey = null;
									onEnterFn();
								}

							});


					}
				});


				textElement.on('focus', function () {
					$(this).select();
				});

				//bindCtrlEnter();
				var lastKey = null;
				textElement.on('keypress', function (e) {
					var pressedKey = xaKeyHelper.getKey(e, 'keypress');

					if (xaKeyHelper.isNavigationKey(pressedKey))
						return true;

					lastKey = pressedKey;

					if (scope.onlyNumeric) { //disallow other chars
						var allow = xaKeyHelper.isNumber(pressedKey);

						if (!allow) e.preventDefault();
					}
					else if (scope.ignoreChars) {
						var char = String.fromCharCode(pressedKey);
						if (scope.ignoreChars.indexOf(char) > -1)
							e.preventDefault();
					}

					if (xaKeyHelper.isEnter(pressedKey)) {
						// Si pas de changement de valeur on declenche directe
						var onEnterFn = scope.onEnter ? scope.onEnter() : undefined;
						if (angular.isFunction(onEnterFn) && textElement.val() == scope.inputValue) {
							lastKey = null;
							onEnterFn();
						}
						// Si changement de valeur sera effectué après le dichangefn
						else {
							textElement.trigger('blur');
							textElement.trigger('focus');
						}
					}
				});

				function showError(text) {
					var tooltipData = {
						placement: 'bottom',
						trigger: 'focus',
						html: true,
						title: text
					};
					textElement.addClass('has-err').tooltip(tooltipData);
				}

				function removeError() {
					element.removeClass('has-err').tooltip('destroy');
				}


				scope.$on('$destroy', function () {
					unwatchModel();
					unwatchExternalModel();
					removeError();
					textElement.off('focus keypress');
				});

			}
		};

	});

})(window.XaNgFrameworkTextBox);
