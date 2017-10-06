(function(local) {
	'use strict';

	local.directive('xaSelection', function ($filter, $rootScope, $document, xaKeyboard, $timeout, xaDirectiveHelper, xaTranslation, xaFrameworkSetting) {

		return {
			restrict: 'EA',
			replace: true,
			templateUrl: '../js/selection/selection.tpl.html',
			scope: {
				options: '=',
				willChange: '&?',
				didChange: '&?',
                canedit: '=?',
				inputValue: '='
			},
			link: function(scope, element, attrs) {

				var popupId = 'selection-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
				element.attr({ 'id': 'owner-' + popupId });

				xaDirectiveHelper.setTestIdOnElement(element, 'sel', attrs.inputValue);

				scope.currSelText = $rootScope.translate('TXT_SELECTION_COURANTE');
				scope.showListSelection = false;
				scope.activeIdx = -1;

				for (var i = 0; i < scope.options.length; i++) {
					/* Nettoyage des menus inactifs par les droits et saisie des ressources */
					var item = scope.options[i];
					if (item.resourceKey) item.text = xaTranslation.instant(item.resourceKey);
					item.testId = xaDirectiveHelper.getTestId('mit', item.resourceKey ? item.resourceKey : item.text);
					if (item.rightKey && xaFrameworkSetting.UserRights.indexOf(item.rightKey) >= 0) {
						scope.options.splice(i, 1);
						i--;
					}
				}

				scope.toggle = function() {

					scope.showListSelection = !scope.showListSelection;

					if (scope.showListSelection) {
						//bindKeyboard();
						bindDocumentClick();
					} else {
						//unbindKeyboard();
						unbindDocumentClick();
						scope.activeIdx = -1;
					}
				};

				var willChangeFn = scope.willChange ? scope.willChange() : undefined;
				var didChangeFn = scope.didChange ? scope.didChange() : undefined;
				scope.changeFn = function(newItem, oldItem) {
				    
				    var cont = true;
				    if(angular.isFunction(willChangeFn))
				        cont = willChangeFn(newItem);
				    if (cont === false)
				    {
				        return;
				    }

				    scope.inputValue = newItem;

				    if (angular.isFunction(didChangeFn)) {
                        $timeout(function() { didChangeFn(newItem, oldItem); });
                    }
				};

				scope.isActive = function(index) {
					return index === scope.activeIdx;
				};

				scope.activateIndex = function(index) {
					scope.activeIdx = index;
				};

				/*function bindKeyboard() {
					xaKeyboard.setContext(scope.$id);
					xaKeyboard.bind('esc', scope.toggle, scope.$id);
					xaKeyboard.bind('down', moveDown, scope.$id, false);
					xaKeyboard.bind('up', moveUp, scope.$id, false);
					xaKeyboard.bind('enter', enter, scope.$id);
				}

				function unbindKeyboard() {
					xaKeyboard.unbind('enter,esc,down,up', scope.$id);
					xaKeyboard.resetContext(scope.$id);
				}*/

				function enter() {
					if (scope.activeIdx > -1 && scope.activeIdx < scope.options.length) {
						scope.changeFn(scope.options[scope.activeIdx]);
						scope.toggle();
					}
				}

				function moveDown() {
					if (_.any(scope.options)) {
						scope.activeIdx = (scope.activeIdx + 1) % scope.options.length;
					} else {
						scope.activeIdx = -1;
					}
					scope.$digest();
				}

				function moveUp() {
					if (_.any(scope.options)) {
						scope.activeIdx = (scope.activeIdx > 0 ? scope.activeIdx : scope.options.length) - 1;
					} else {
						scope.activeIdx = -1;
					}
					scope.$digest();
				}

				function dismissClickHandler(evt) {
					var parents = $(evt.target).parents('#owner-' + popupId);
					if (element.eq(0) !== evt.target && parents.length === 0) {
						scope.toggle();
						scope.$digest();
					}
				};

				var selectionContextId = "Selection" + scope.$id;
				function bindDocumentClick() {
				    $document.on('click', dismissClickHandler);

				    xaKeyboard.setContext(selectionContextId);
				    xaKeyboard.bind('esc', scope.toggle, selectionContextId);
				}

				function unbindDocumentClick() {
				    $document.off('click', dismissClickHandler);
				    xaKeyboard.unbind('esc', selectionContextId);
				    xaKeyboard.resetContext(selectionContextId);
				}

				scope.$on('$destroy', function() {
					// unbindKeyboard();
					unbindDocumentClick();
				});

			}
		};

	});

})(window.XaNgFrameworkSelection);