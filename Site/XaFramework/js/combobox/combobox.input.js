(function(local) {
	'use strict';

	local.directive('xaComboBoxInput', function($rootScope) {

		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, element, attrs, ngModelController) {

				function modelParser(inputText) {

					// This method is triggered whenever the input changes in the control (DOM).

					scope.$dirty = true;
					scope.$manualSelection = false;
					if (scope.dataSource && scope.dataSource.setDisplayText) {
						scope.dataSource.setDisplayText(inputText, true);
					}
					scope.showPopup(true);
					return inputText;

				}

				initializeMaxLengthValidation();

				ngModelController.$parsers.push(modelParser);

                //fixes bug where dragged text is not taken into account
				//element.on('input', function () {
				//    var $this = $(this);
				//    $this.trigger('change');
				//});

				element.on('focus', function() {
					scope.bindKeyboard();
					if (!$rootScope.$$phase) {
						scope.$digest();
					} 
				});

				element.on('blur', function () {
					scope.unbindKeyboard();

					if (!scope.show) {
						scope.doBlur();
					}
				});

				element.on('mousedown', function(e) {
				    scope.showHidePopupFromClick();
				    element.focus();
					e.preventDefault();
				});

				scope.$on('$destroy', function() {
					element.off();
				});

				/*
				 * This function is responsible for stripping down the input text
				 * whenever a maxLength property is defined on the scope.
				 */
				var unwatchText = null;

				function initializeMaxLengthValidation() {
					if (scope.maxlength) {

						// TODO: maxLength is not defined anywhere.
						element.attr('maxlength', scope.maxlength);

						unwatchText = scope.$watch(function() {

							return scope.defaultText;

						}, function() {

							var stringified = scope.defaultText + '';
							if (stringified.length > scope.maxlength) {
								scope.defaultText = stringified.substring(0, scope.maxlength); /// TODO: should it sync with the datasource?
							}

						});
					}
				}

				scope.$on('$destroy', function() {
					if (unwatchText) unwatchText();
				});
			}
		};
	});

})(window.XaNgFrameworkComboBox);