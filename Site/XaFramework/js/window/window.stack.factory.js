(function (local, angular) {
	'use strict';

	local.factory('$xaWindowStack', function (xaKeyboard, $timeout, $document, $compile, $rootScope, $xaStackedMap, xaBenchmark, xaLoadingService) {

		var openedWindowClass = 'modal-open';

		var backdropDomEl, backdropScope;
		var openedWindows = $xaStackedMap.createNew();
		var $windowStack = {};

		function backdropIndex() {
			var topBackdropIndex = -1;
			var opened = openedWindows.keys();
			for (var i = 0; i < opened.length; i++) {
				var win = openedWindows.get(opened[i]);
				if (win.value.windowMode == 'modal-gray' || win.value.windowMode == 'modal-transparent') {
					topBackdropIndex = i;
				}
			}
			return topBackdropIndex;
		}

		$rootScope.$watch(backdropIndex, function (newBackdropIndex) {
			if (backdropScope) {
				backdropScope.index = newBackdropIndex;
			}
		});

		function removeWindow(windowInstance) {
			//todo: remove from container!
			var body = $document.find('body').eq(0);
			var window = openedWindows.get(windowInstance).value;

			xaKeyboard.unbind('esc', window.contextKeyboardId);
			xaKeyboard.unbind('ctrl+enter', window.contextKeyboardId);
			xaKeyboard.resetContext(window.contextKeyboardId);

			//clean up the stack
			openedWindows.remove(windowInstance);

			//remove window DOM element

			window.windowDomEl.remove();
			window.windowScope.$destroy();
			body.toggleClass(openedWindowClass, openedWindows.length() > 0);
			checkRemoveBackdrop();
		}

		function checkRemoveBackdrop() {
			//remove backdrop if no longer needed
			//todo: not display if in container
			if (backdropDomEl && backdropIndex() == -1) {
				var backdropScopeRef = backdropScope;
				backdropDomEl.remove();
				backdropScopeRef.$destroy();
				backdropScopeRef = null;
				backdropDomEl = undefined;
				backdropScope = undefined;
			}
			else {
				var topWin = openedWindows.top();
				if (backdropDomEl && topWin.value.windowMode == 'modal-gray') {
					backdropDomEl.css('opacity', '.5');
				}
				else if (backdropDomEl && topWin.value.windowMode == 'modal-transparent')
					backdropDomEl.css('opacity', '0');
			}
		}

		function validateOnKeyboard(evt, windowInstance) {
			if (!xaLoadingService.isVisible()
				&& windowInstance
				&& windowInstance.value.keyboard
				&& xaKeyboard.getContext() === windowInstance.value.contextKeyboardId
				&& !windowInstance.value.windowScope.hideValidate
				&& windowInstance.value.windowScope._winLoaded // Ne pas declencher le ctrl+enter si la fenetre n'est pas encore chargé.
				&& !windowInstance.value.windowScope._winValidateRequested // Ne pas declencher l'evenement si un ctrl+enter est déjà en cours/
				&& angular.isFunction(windowInstance.value.windowScope.onValidate)) {

				// Note: This doesn't work when validating grid personalisation window, for example. Also preventDefault on event after 10ms won't do what's expected.
				evt.preventDefault();
				windowInstance.value.windowScope._winValidateRequested = true;  // informer la methode de validation d'un declenchement prochain pour eviter les declenchements multiples.

				var valBtn = windowInstance.value.windowDomEl.find("ul.defaultButtons a.save");
				valBtn.focus();
				$timeout(function () { //wait for textbox value to be updated. IE needs this!
					$timeout(function () { //wait for did change to happened
						windowInstance.value.windowScope._winValidateRequested = false; // remise à false pour permettre à la validation de se declencher.
						windowInstance.value.windowScope.onValidate(); //valBtn.trigger('click');
					}, 0, false);
				}, 0, false);
			}
		}

		function closeOnKeyboard(evt, windowInstance) {
			if (!xaLoadingService.isVisible()
				&& windowInstance
				&& windowInstance.value.keyboard
				&& xaKeyboard.getContext() === windowInstance.value.contextKeyboardId
				&& !windowInstance.value.windowScope.hideClose
				&& angular.isFunction(windowInstance.value.windowScope.onClose)) {
				evt.preventDefault();
				windowInstance.value.windowScope.onClose();
			}
		}


		$windowStack.open = function (windowInstance, window) {

			//raul: prevent opening more than 1 window with the same ID!
			//update: openedWindows is not an array. It's not even navigable. Will only check for the last opened window id
			var lastOpenedWin = openedWindows.top();
			if (lastOpenedWin) {
				var isOpened = window.id && openedWindows.top().value.windowDomEl.attr('id') == window.id;

				if (isOpened) {
					if (window.allowMultiple != true) {
						console.log("A window with ID " + window.id + "is already opened! Will not open a new one!");
						return;
					}
				}
			}

			if (window.container) {
				//check if another window is already opened in this container, and close it.
				var opWins = openedWindows.all();
				_.each(opWins, function (win) {
					if (win && win.key && win.value.container == window.container && win.key != windowInstance) {
						openedWindows.get(win.key).value.windowScope.onClose();
					}
				});
			}

			// this gets triggered for dashboards as well. 
			//need to exclude inputs from it...
			var contextKeyboardId = 'WINDOW_' + window.scope.$id + window.id;
			xaKeyboard.setContext(contextKeyboardId);
			xaKeyboard.bind('esc', function (e) {
				closeOnKeyboard(e, openedWindows.get(windowInstance));
			}, contextKeyboardId);

			xaKeyboard.bind('ctrl+enter', function (e) {
				validateOnKeyboard(e, openedWindows.get(windowInstance));
			}, contextKeyboardId);



			openedWindows.add(windowInstance, {
				deferred: window.deferred,
				windowScope: window.scope,
				windowMode: window.windowMode,
				container: window.container,
				keyboard: window.keyboard,
				contextKeyboardId: contextKeyboardId
			});

			var body = $document.find('body').eq(0),
				currBackdropIndex = backdropIndex();

			var willAddBackdrop = currBackdropIndex >= 0 && !backdropDomEl && window.windowMode != 'inline';

			//if opening window needs gray bg, and we have backdrop, make it gray!
			if (backdropDomEl && window.windowMode == 'modal-gray') {
				backdropDomEl.css('opacity', .5);
			}
			else if (backdropDomEl && window.windowMode == 'modal-transparent')
				backdropDomEl.css('opacity', 0);
			else if (willAddBackdrop && window.windowMode == 'modal-transparent') {
				window.backdropClass = window.backdropClass || "" + " backdrop-transparent";
			}

			if (willAddBackdrop) {
				backdropScope = $rootScope.$new(true);
				backdropScope.index = currBackdropIndex;
				var angularBackgroundDomEl = angular.element('<xa-window-backdrop>');
				angularBackgroundDomEl.attr('backdrop-class', window.backdropClass);
				backdropDomEl = $compile(angularBackgroundDomEl)(backdropScope);
				body.append(backdropDomEl);
			}



			var angularDomEl = angular.element('<xa-window>');
			angularDomEl.attr({
				'id': window.id,
				'window-class': window.windowClass,
				'size': window.size,
				'width': window.width,
				'height': window.height,
				'index': openedWindows.length() - 1,
				'animate': 'animate',
				'backdrop': window.backdrop,
				'relativeElem': window.relativeElem,
				'relativePosition': window.relativePosition,
				'window-mode': window.windowMode,
				'show-loading-on-init': window.showLoadingOnInit,
				'view-url': window.templateUrl,
				'controller-name': window.controllerName,
				'container': window.container,
				'draggable': window.draggable,
				'min-width': window.minWidth,
				'disable-focus-management': window.disableFocusManagement
			}).html(window.content);

			var windowDomEl = $compile(angularDomEl)(window.scope, function (clone, newScope) {
				openedWindows.top().value.windowDomEl = clone;

				if (window.container) {
					$(window.container).append(clone);
				}
				else {
					body.append(clone);
					body.addClass(openedWindowClass);
				}

				xaBenchmark.timeStep('window added to dom');
			});
		};

		$windowStack.close = function (windowInstance, result) {
			var window = openedWindows.get(windowInstance);
			if (window) {
				window.value.deferred.resolve(result);
				removeWindow(windowInstance);
			}
		};

		$windowStack.dismiss = function (windowInstance, reason) {
			var window = openedWindows.get(windowInstance);
			if (window) {
				window.value.deferred.reject(reason);
				removeWindow(windowInstance);
			}
		};

		/* $windowStack.dismissAll = function(reason) {
			 var topWindow = this.getTop();
			 while (topWindow) {
				 this.dismiss(topWindow.key, reason);
				 topWindow = this.getTop();
			 }
		 };*/


		$windowStack.closeAll = function (reason) {
			var topWindow = this.getTop();
			while (topWindow) {
				topWindow.value.windowScope.onClose();
				topWindow = this.getTop();
			}
		};

		$windowStack.getTop = function () {
			return openedWindows.top();
		};

		$windowStack.getWindowFromScope = function (scope) {
			return _.find(openedWindows.all(), function (window) { return window.value.windowScope === scope });
		};


		$windowStack.closeWindowFromContainerId = function (name) {
			var value = _.find(openedWindows.all(), function (window) { return window.value.container === name });
			if (value)
				value.value.windowScope.onClose();
		};

		$windowStack.isWindowOpened = function () {
			return openedWindows.length() != 0;
		};

		return $windowStack;
	}
    );

})(window.XaNgFrameworkWindow, window.angular);
