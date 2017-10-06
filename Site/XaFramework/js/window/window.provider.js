(function (local, angular) {
	'use strict';

	local.provider('xaWindow', function () {

		var $windowProvider = {
			options: {
				backdrop: true, //can be also false or 'static'
				keyboard: true
			},
			$get: function ($injector, $rootScope, $q, $http, $timeout, $templateCache, $controller, $xaWindowStack, xaBenchmark, xaLoadingService) {

				var $window = {};
				function getTemplatePromise(options) {

					// Si pas de $timeout le callback du digest n'est pas emis, et la window n'est pas ouverte.
					// TODO: identifier une meilleure solution.
					//return $timeout(function () {
					return options.template ? $q.when(options.template) :
						$http.get(angular.isFunction(options.templateUrl) ? (options.templateUrl)() : options.templateUrl,
						{ cache: $templateCache }).then(function (result) {
							return result.data;
						});
					//}, 0, false);


				}

				function getResolvePromises(resolves) {
					var promisesArr = [];
					angular.forEach(resolves, function (value) {
						if (angular.isFunction(value) || angular.isArray(value)) {
							//promisesArr.push($q.when(value));
							promisesArr.push($q.when($injector.invoke(value)));
							// TODO: Any idea why was this using $injector? First load is 8000x slower.
						}
					});
					return promisesArr;
				}

				$window.open = function (windowOptions) {

					xaBenchmark.start();

					if (windowOptions.showLoadingOnInit == undefined) {
						windowOptions.showLoadingOnInit = true;
					}

					if (windowOptions.showLoadingOnInit)
						xaLoadingService.show();


					var windowResultDeferred = $q.defer();
					var windowOpenedDeferred = $q.defer();

					//prepare an instance of a window to be injected into controllers and returned to a caller
					var windowInstance = {
						result: windowResultDeferred.promise,
						opened: windowOpenedDeferred.promise,
						close: function (result) {
							$xaWindowStack.close(windowInstance, result);
						},
						dismiss: function (reason) {
							$xaWindowStack.dismiss(windowInstance, reason);
						}
					};

					//merge and clean up options
					windowOptions = angular.extend({}, $windowProvider.options, windowOptions);
					windowOptions.resolve = windowOptions.resolve || {};

					//verify options
					if (!windowOptions.template && !windowOptions.templateUrl) {
						throw new Error('One of template or templateUrl options is required.');
					}

					var templateAndResolvePromise =
						$q.all([getTemplatePromise(windowOptions)].concat(getResolvePromises(windowOptions.resolve)));


					templateAndResolvePromise = templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {

						xaBenchmark.timeStep('window resolves time');

						var windowScope = (windowOptions.scope || $rootScope).$new();
						windowScope.$close = windowInstance.close;
						windowScope.$dismiss = windowInstance.dismiss;

						var ctrlInstance, ctrlLocals = {};
						var resolveIter = 1;

						//controllers
						if (windowOptions.controller) {
							ctrlLocals.$scope = windowScope;
							ctrlLocals.$windowInstance = windowInstance;
							angular.forEach(windowOptions.resolve, function (value, key) {
								ctrlLocals[key] = tplAndVars[resolveIter++];
							});

							ctrlInstance = $controller(windowOptions.controller, ctrlLocals);
							if (windowOptions.controllerAs) {
								windowScope[windowOptions.controllerAs] = ctrlInstance;
							}
						}

						$xaWindowStack.open(windowInstance, {
							id: windowOptions.id,
							allowMultiple: windowOptions.allowMultiple,
							scope: windowScope,
							deferred: windowResultDeferred,
							content: tplAndVars[0],
							keyboard: windowOptions.keyboard,
							backdropClass: windowOptions.backdropClass,
							windowClass: windowOptions.windowClass,
							windowTemplateUrl: windowOptions.windowTemplateUrl,
							size: windowOptions.size,
							width: windowOptions.width,
							height: windowOptions.height,
							showLoadingOnInit: windowOptions.showLoadingOnInit,
							relativeElem: windowOptions.relativeElem,
							relativePosition: windowOptions.relativePosition,
							windowMode: windowOptions.windowMode,
							templateUrl: windowOptions.templateUrl,
							controllerName: windowOptions.controller,
							container: windowOptions.container,
							draggable: windowOptions.draggable,
							minWidth: windowOptions.minWidth,
							disableFocusManagement: windowOptions.disableFocusManagement
						});

					}, function resolveError(reason) {
						// Si erreur sur chargement des resolves on masque.
						if (windowOptions.showLoadingOnInit)
							xaLoadingService.hide();
						
						if (reason && reason.Message && reason.ExceptionType && reason.ExceptionType.indexOf('BusinessException') == -1)
							reason.Message = 'Erreur sur le chargement des données de la fenêtre, veuillez vérifier les arguments transmis à la fenêtre ou contacter le support, message original: ' + reason.Message;

						windowResultDeferred.reject(reason);
					});

					templateAndResolvePromise.then(function () {
					// Deplacer dans la window pour cacher	
					/*if (windowOptions.showLoadingOnInit)
							xaLoadingService.hide(); */

						windowOpenedDeferred.resolve(true);
					}, function () {
						if (windowOptions.showLoadingOnInit)
							xaLoadingService.hide();
						windowOpenedDeferred.reject(false);
					});

					return windowInstance;
				};

				$window.closeAll = function () {
					$xaWindowStack.closeAll();
				};

				$window.isWindowOpened = function () {
					return $xaWindowStack.isWindowOpened();
				};

				$window.closeWindowFromContainerId = function (name) {
					return $xaWindowStack.closeWindowFromContainerId(name);
				};
				
				return $window;
			}

		};

		return $windowProvider;
	});

})(window.XaNgFrameworkWindow, window.angular);
