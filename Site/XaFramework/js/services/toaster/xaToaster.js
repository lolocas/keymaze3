(function(local) {
	'use strict';

	local.service('xaToaster', function($rootScope) {
				this.pop = function(type, title, body, timeout, bodyOutputType, clickHandler) {
					this.toast = {
						type: type,
						title: title,
						body: body,
						timeout: timeout,
						bodyOutputType: bodyOutputType,
						clickHandler: clickHandler
					};
					$rootScope.$broadcast('toaster-newToast');
				};

				this.clear = function() {
					$rootScope.$broadcast('toaster-clearToasts');
				};
			}
		)
		.constant('xaToasterConfig', {
			'limit': 0, // limits max number of toasts 
			'tap-to-dismiss': true,
			'close-button': false,
			'newest-on-top': true,
			'time-out': 5000, // Set timeOut and extendedTimeout to 0 to make it sticky
			'icon-classes': {
				error: 'toast-error',
				info: 'toast-info',
				wait: 'toast-wait',
				success: 'toast-success',
				warning: 'toast-warning'
			},
			'body-output-type': '', // Options: '', 'trustedHtml', 'template'
			'body-template': 'toasterBodyTmpl.html',
			'icon-class': 'toast-info',
			'position-class': 'toast-bottom-right',
			'title-class': 'toast-title',
			'message-class': 'toast-message'
		})
		.directive('xaToasterContainer', function($compile, $timeout, $sce, xaToasterConfig, xaToaster) {
				return {
					replace: true,
					restrict: 'EA',
					scope: true, // creates an internal scope for this directive
					link: function(scope, elm, attrs) {

						var id = 0,
							mergedConfig;

						mergedConfig = angular.extend({}, xaToasterConfig, scope.$eval(attrs.toasterOptions));

						scope.config = {
							position: mergedConfig['position-class'],
							title: mergedConfig['title-class'],
							message: mergedConfig['message-class'],
							tap: mergedConfig['tap-to-dismiss'],
							closeButton: mergedConfig['close-button']
						};

						scope.configureTimer = function configureTimer(toast) {
							var timeout = typeof (toast.timeout) == "number" ? toast.timeout : mergedConfig['time-out'];
							if (timeout > 0)
								setTimeout(toast, timeout);
						};

						function addToast(toast) {
							toast.type = mergedConfig['icon-classes'][toast.type];
							if (!toast.type)
								toast.type = mergedConfig['icon-class'];

							id++;
							angular.extend(toast, { id: id });

							// Set the toast.bodyOutputType to the default if it isn't set
							toast.bodyOutputType = toast.bodyOutputType || mergedConfig['body-output-type'];
							switch (toast.bodyOutputType) {
							case 'trustedHtml':
								toast.html = $sce.trustAsHtml(toast.body);
								break;
							case 'template':
								toast.bodyTemplate = toast.body || mergedConfig['body-template'];
								break;
							}

							scope.configureTimer(toast);

							if (mergedConfig['newest-on-top'] === true) {
								scope.toasters.unshift(toast);
								if (mergedConfig['limit'] > 0 && scope.toasters.length > mergedConfig['limit']) {
									scope.toasters.pop();
								}
							} else {
								scope.toasters.push(toast);
								if (mergedConfig['limit'] > 0 && scope.toasters.length > mergedConfig['limit']) {
									scope.toasters.shift();
								}
							}
						}

						function setTimeout(toast, time) {
							toast.timeout = $timeout(function() {
								scope.removeToast(toast.id);
							}, time);
						}

						scope.toasters = [];
						scope.$on('toaster-newToast', function() {
							addToast(xaToaster.toast);
						});

						scope.$on('toaster-clearToasts', function() {
							scope.toasters.splice(0, scope.toasters.length);
						});
					},

					controller: function($scope) {

						$scope.stopTimer = function(toast) {
							if (toast.timeout) {
								$timeout.cancel(toast.timeout);
								toast.timeout = null;
							}
						};

						$scope.restartTimer = function(toast) {
							if (!toast.timeout)
								$scope.configureTimer(toast);
						};

						$scope.removeToast = function(id) {
							var i = 0;
							for (i; i < $scope.toasters.length; i++) {
								if ($scope.toasters[i].id === id)
									break;
							}
							$scope.toasters.splice(i, 1);
						};

						$scope.click = function(toaster) {
							if ($scope.config.tap === true) {
								if (toaster.clickHandler && angular.isFunction($scope.$parent.$eval(toaster.clickHandler))) {
									var result = $scope.$parent.$eval(toaster.clickHandler)(toaster);
									if (result === true)
										$scope.removeToast(toaster.id);
								} else {
									$scope.removeToast(toaster.id);
								}
							}
						};
					},
					templateUrl: '../js/services/toaster/xaToaster.tpl.html'

				};
			}
		);

})(window.XaNgFrameworkServices);