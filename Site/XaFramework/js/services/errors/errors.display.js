(function (local) {
	'use strict';

	local.provider('xaErrorDisplay', function () {

		var ignoreFilters = [];

		this.ignoreUrl = function (regex) {

			if (regex instanceof RegExp) {
				ignoreFilters.push(regex);
			} else {
				throw new Error('Expected RegEx for setting an ignore url.');
			}

			return this;
		};

		this.$get = function (xaWindow, xaLogging, dialogs, xaTranslation) {

			var defaultWindowOptions = {
				windowClass: 'dialogs dialogs-error',
				backdrop: true,
				hideValidate: true,
				hideClose: false,
				width: '80%',
				controller: 'xaErrorServerController as error'
			};

			function isServerBusinessException(rejection) {
				return rejection
					&& rejection.data
					&& rejection.data.ExceptionType
					&& /BusinessException/i.test(rejection.data.ExceptionType);
			}

			function isClientBusinessException(rejection) {
				return rejection && rejection.exception && rejection.exception.type == 'ClientBusinessException';
			}


			function showNoServerError(error) {

				if (ignoreServerError(error)) {
					return;
				}

				xaWindow.open(angular.extend({}, defaultWindowOptions, {
					templateUrl: '../js/services/errors/errors.noserver.tpl.html',
					width: '500px',
					windowMode: 'modal-gray',
					showLoadingOnInit: false,
					resolve: {
						error: function () {
							return error;
						}
					}
				}));
			};

			function showServerError(error) {

				if (ignoreServerError(error)) {
					return;
				}

				if (isServerBusinessException(error)) {
					dialogs.error(xaTranslation.instant('TXT_ERREUR'), error.data.ExceptionMessage);
				}
				else {
					xaWindow.open(angular.extend({}, defaultWindowOptions, {
						height: '80%',
						templateUrl: '../js/services/errors/errors.server.tpl.html',
						resolve: {
							error: function () {
								return error;
							}
						}
					}));
				}
			};

			var ctx = this;
			this.errorClientCount = 0;
			function showClientError(error) {
				if (isClientBusinessException(error)) {
					dialogs.error(xaTranslation.instant('TXT_ERREUR'), error.exception.message);
				}
				else {
					ctx.errorClientCount++;
			
					if ( ctx.errorClientCount < 5) {
						xaWindow.open(angular.extend({}, defaultWindowOptions, {
							height: '80%',
							templateUrl: '../js/services/errors/errors.client.tpl.html',
							resolve: {
								error: function () {
									return error;
								}
							}
						})).result.then(function () { ctx.errorClientCount--; }, function () { ctx.errorClientCount--; });
						xaLogging.error(error);
					}
					else {
						console.log('Critique: Erreur en cascade coté client; contacter le développement.')
					}
				}

			};

			return {
				showServerError: showServerError,
				showClientError: showClientError,
				showNoServerError: showNoServerError
			};

		};

		function ignoreServerError(error) {

			if (ignoreFilters.length === 0) {
				return false;
			}

			if (!error || !error.config) {
				return true;
			}

			return _.some(ignoreFilters, function (r) {
				return r.test(error.config.url);
			});

		}

	});


})(window.XaNgFrameworkServices);