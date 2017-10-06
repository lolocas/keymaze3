(function(local) {
	'use strict';

	local.directive('xaSearchBoxInput', function (xaKeyboard, $rootScope, $timeout, xaKeyHelper) {

		var separator = ',',
			customActionButtonWidth = 23,
			hotKeys = [9, 27 ,37, 39, 13, 46, 38, 40];

		function calculateInputStyle(actions) {
			var buttonsCount = actions.length + 1;
			return {
				'padding-right': (buttonsCount * customActionButtonWidth) + 'px'
			};
		}

		return {
			restrict: 'A',
			link: function(scope, element) {

				var ua = window.navigator.userAgent;
				var isIE = (ua.indexOf('MSIE ') >= 0 || ua.indexOf('Trident/') >= 0)
					
				scope.activeSeparatorInterval = 0;

				scope.refreshStyle = function() {
					scope.inputStyle = calculateInputStyle(scope.visibleCustomActions);
				};

				scope.setFocus = function () {
					//IE needs delay in setting focus! Chrome works fine without delay!
					// This fix the bug when i press erase value i cannot type in the seachbox

					$timeout(function () { element.focus(); }, 0, false);
					
				};

				function countSeparatorsBeforeIndex(index) {

					var count = 0;

					if (!angular.isNumber(index) || !scope.selectedText || index < 0) {
						return 0;
					}

					for (var i = 0; i < index; i++) {
						if (scope.selectedText[i] === separator) {
							count++;
						}
					}

					return count;
				}

				function updateCaretInterval() {
					// Optimisation pour ne pas lancer un digest au démarrage de la directive.
					if (scope.focus == true) {
						var caret = element.caret();
						scope.activeSeparatorInterval = countSeparatorsBeforeIndex(caret);
						if (!$rootScope.$$phase) scope.$apply();
					}
					
						
				}

				element.on('focus', function() {
					scope.focus = true;
					if (!$rootScope.$$phase) scope.$digest();
				});

				element.on('blur', function() {
				scope.focus = false;
				if (!scope.show) {
						scope.doBlur()
						if (!$rootScope.$$phase && !scope.$$phase) scope.$digest();
					}
				});

				element.on('keydown', function(e) {
                    var pressedKey = xaKeyHelper.getKey(e, 'keydown');
            
					// Caractere GS (<ascii29>) 186 dans IE, 164 dans firefox, ctrlKey pour detecter le lancement du caractere invisble plutot que ü pour l'allemagne
                    if (((e.which == '186' || e.which == '164') && e.ctrlKey == true) && !scope.readonly) {
						$(this).val($(this).val() + '<ASCII29>');
                    	scope.selectedText = $(this).val();
                    	scope.$apply();
                    	e.preventDefault();
                    	e.stopPropagation();
                    	return;
                    }

                    if (e.key == ';' && !scope.readonly) {
                    	$(this).val($(this).val() + ',');
                    	scope.selectedText = $(this).val();
                    	scope.$apply();
                    	e.preventDefault();
                    	e.stopPropagation();
                     	return;
                    }

                    if (hotKeys.indexOf(pressedKey) === -1) {
                        if (scope.readonly && !xaKeyHelper.isEsc(pressedKey)) { //need to allow esc in order to close the window!
                            e.preventDefault();
                            e.stopPropagation();
                        }
						return;
					}
				
					if (!scope.focus) 
						return;

					// esc
					if (xaKeyHelper.isEsc(pressedKey) || pressedKey === 9) {
						if (scope.show) {
							scope.hidePopup();
							e.stopPropagation();
							e.preventDefault();
						}
					}

					
					// Delete
					if (pressedKey === 46 && scope.readonly) {
					    e.preventDefault();
					    e.stopPropagation();
					    scope.clear();
					}

					// Left/Right keyboard caret movement.
					if (pressedKey === 37 || pressedKey === 39) {
						updateCaretInterval();
					}


					// Enter key.
					if (pressedKey === 13) {
						if (!e.ctrlKey && !scope.readonly && scope.active == -1 ) {
							// VTO : Dans le cadre d'une saisie de douchette, sur IE nous devons repousser la touche entrée , pour que l'ensemble du code barre est bien été saisie dans le controle input.
							if (isIE) {
								setTimeout(function () {
									scope.search(null, true);
								}, 0);
							}
							else
								scope.search(null, true);

							e.stopPropagation();
							e.preventDefault();
						}
						else if (scope.show && scope.active > -1) {
							scope.select(scope.gridOptions.getData()[scope.active]);
							e.stopPropagation();
							e.preventDefault();
						}
						else {
							// Pas de stop de propagation pour laisser passer le ctrl + enter
						
						}
					}


					// Up
					if (scope.show && pressedKey === 38) {
						e.preventDefault();
						e.stopPropagation();
						scope.changeActiveValue((scope.active > 0 ? scope.active : scope.gridOptions.getData().length) - 1);

					}

					// Down 
					if (scope.show && pressedKey === 40) {
						e.preventDefault();
						e.stopPropagation();
						scope.changeActiveValue((scope.active + 1) % scope.gridOptions.getData().length);
					}

					scope.$apply();
				});

				element.on('click', function() {

					if (scope.readonly) {
						return;
					}

					updateCaretInterval();
				
					if (_.any(scope.dataSource)) {
						scope.showPopup();
					}
				});

				var unwatchSelText = scope.$watch('selectedText', function(newVal, oldVal) {

				    updateCaretInterval();
				
					if (oldVal !== undefined && scope.selectedText === '') {
						scope.selectedValue = null;
					}

					scope.dirty = newVal !== oldVal;
					if (scope.dirty) {
						scope.active = -1;
					}
					if (scope.selectedText && scope.selectedValue == null)
						scope.selectedText = scope.selectedText.replace('?', ',');
				});

				scope.$on('$destroy', function() {
					element.off();
					unwatchSelText();
				});
			}
		};
	});

})(window.XaNgFrameworkSearchBox);