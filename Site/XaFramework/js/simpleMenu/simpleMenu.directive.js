(function (local) {
	'use strict';
	local.directive('xaSimpleMenuDropDown', function () {
		return {
			restrict: 'EA',
			replace: true,
			templateUrl: '../js/simpleMenu/simpleMenu.popup.tpl.html'
		};
	});
	local.directive('xaAccordionMenuDropDown', function () {
		return {
			restrict: 'EA',
			replace: true,
			templateUrl: '../js/simpleMenu/accordionMenu.popup.tpl.html'
		};
	});

	local.directive('xaSimpleMenu', function ($filter, $rootScope, xaTranslation, xaDirectiveHelper, $document, xaKeyboard, xaFrameworkSetting, $timeout, $compile, xaKeyHelper) {

		return {
			restrict: 'EA',
			replace: true,
			templateUrl: '../js/simpleMenu/simpleMenu.tpl.html',
			scope: {
				menuText: '=?',
				menuIcon: '=?',
				menuResourceKey: '=?',
				options: '=',
				didChange: '&?',
				willChange: '&?',
				type: '@?',
				selectedItem: '=?'
			},
			link: function (scope, element) {
			    var menuId = 'owner-selection-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
			    var popupId = 'popup-' + menuId;
			    element.attr({ 'id': menuId });

			    var popupTag = 'xa-simple-menu-drop-down';
			    if (scope.type == 'accordion') popupTag = 'xa-accordion-menu-drop-down';


			    if (scope.menuResourceKey) scope.menuText = xaTranslation.instant(scope.menuResourceKey);

			    for (var i = 0; i < scope.options.length; i++) {

			        /* Nettoyage des menus inactifs par les droits et saisie des ressources */
			        var item = scope.options[i];
			        if (item.resourceKey) item.text = xaTranslation.instant(item.resourceKey);
			        item.testId = xaDirectiveHelper.getTestId('mit', item.resourceKey ? item.resourceKey : item.text);
			        if (item.rightKey && xaFrameworkSetting.UserRights.indexOf(item.rightKey) >= 0) {
			            scope.options.splice(i, 1);
			            i--;
			        }

			        if (item.items) {
			            for (var j = 0; j < item.items.length; j++) {
			                var itemSub = item.items[j];
			                if (itemSub.resourceKey) itemSub.text = xaTranslation.instant(itemSub.resourceKey);
			                itemSub.testId = xaDirectiveHelper.getTestId('mit', itemSub.resourceKey ? itemSub.resourceKey : itemSub.text);

			                if (itemSub.rightKey && xaFrameworkSetting.UserRights.indexOf(itemSub.rightKey) >= 0) {
			                    item.items.splice(j, 1);
			                    j--;
			                }
			            }

			            // On enleve un menu sans aucun droit actif
			            if (item.items.length == 0) {
			                scope.options.splice(i, 1);
			                i--;
			            }
			        }
			    }

			    /* le menu n'est pas affiché si aucun choix présent */
			    if (scope.options && scope.options.length > 0)
			        scope.showMenu = true;
			    else
			        scope.showMenu = false;

			
			    //precompile the popup and append to menu
			    $timeout(function () {
			        $compile('<' + popupTag + ' id="' + popupId + '" xa-positioner="' + menuId + '" auto-width="false" />')(scope, function (clone, newScope) {
			            $('body').append(clone);
			        });
			    }, 0, false);


			    scope.showListSelection = false;
			    scope.activeIdx = -1;

			    if (scope.selectedItem) { //open selected group
			    	_.each(scope.options, function (group) {
			    		if (group == scope.selectedItem) 
			    		{
			    			if (group.resourceKey) scope.menuText = xaTranslation.instant(group.resourceKey);
			    			scope.menuIcon = group.icon;
			    		}
			            _.each(group.items, function (item) {
			            	if (item == scope.selectedItem) {
			            		{
			            			group.isOpen = true;
			            			if (item.resourceKey) scope.menuText = xaTranslation.instant(item.resourceKey);
			            			scope.menuIcon = item.icon;
			            		}

			            	}
			            });
			        });
			    }

			    scope.toggle = function (evt, forceValue) {
			        if (evt && evt.target && $(evt.target).closest('#' + popupId + ' h4.panel-title').length > 0) return;

			        if (!scope.showListSelection) //should display, recalc position!
			            scope.updatePosition && scope.updatePosition(); //this is tricky. When the menu is shown, it might be in the tablet mode. When positioner is hidden, the popup will have different coordinates... so we need to force a recalc on each display. Until I find a better solution!

			        scope.showListSelection = !scope.showListSelection;
			        if (forceValue != undefined) {
			            scope.showListSelection = forceValue;
			        }

			        /* Desactivation de la gestion du clavier sur le menu */
			        if (scope.showListSelection) {
			            //	bindKeyboard();
			            bindDocumentClick();
			        } else {
			            //	unbindKeyboard();
			            unbindDocumentClick();
			            scope.activeIdx = -1;
			        }
			    };

			    scope.changeFn = function (newItem) {
			        var willChangeFn = scope.willChange ? scope.willChange() : undefined;
			        var didChangeFn = scope.didChange ? scope.didChange() : undefined;

			        if (newItem.isHeader) return;

			        if (angular.isFunction(willChangeFn))
			            willChangeFn(newItem);

			        var oldItem = scope.value;
			        scope.value = scope.selectedItem = newItem;
			        if (angular.isFunction(didChangeFn)) {
			            $timeout(function () { didChangeFn(newItem, oldItem); });
			        }
			    };

			    scope.isActive = function (index) {
			        return index === scope.activeIdx;
			    };

			    scope.activateIndex = function (index) {
			        scope.activeIdx = index;
			    };

			    /*	function bindKeyboard() {
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
			        if (!scope.$$phase && !$rootScope.$$phase) scope.$digest();
			    }

			    function moveUp() {
			        if (_.any(scope.options)) {
			            scope.activeIdx = (scope.activeIdx > 0 ? scope.activeIdx : scope.options.length) - 1;
			        } else {
			            scope.activeIdx = -1;
			        }
			        if (!scope.$$phase && !$rootScope.$$phase) scope.$digest();
			    }

			    function dismissClickHandler(evt) {
			        var parents = $(evt.target).parents('#' + menuId);
			        if (xaKeyHelper.isEsc(evt.keyCode) || (element.eq(0) !== evt.target && parents.length === 0)) {
					    scope.toggle(evt, false);
                        if(!scope.$$phase && !$rootScope.$$phase) scope.$digest();
					}
				};

				var menuContextId = 'simpleMenu_' + scope.$id;
				function bindDocumentClick() {
					setTimeout(function () {
						$document.on('click', dismissClickHandler); //need to attach it later so that clikc doesn't get triggered
					});

					xaKeyboard.setContext(menuContextId);
					xaKeyboard.bind('esc', dismissClickHandler, menuContextId);
				}

				function unbindDocumentClick() {
				    $document.off('click', dismissClickHandler);

				    xaKeyboard.unbind('esc', menuContextId);
				    xaKeyboard.resetContext(menuContextId);
				}

				scope.$on('$destroy', function () {
				//	unbindKeyboard();
					unbindDocumentClick();

					$("#" + popupId).remove();
				});

			}
		};

	});

})(window.XaNgFrameworkSimpleMenu);