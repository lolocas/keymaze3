(function(local) {
    'use strict';

	local.provider('xaTranslation', function($translateProvider) {

		// settings should be in the format { prefix: url-to-json, suffix: '' }
		this.configureTranslationPath = function(settings) {
			$translateProvider.useStaticFilesLoader(settings);
		};

		this.configureTranslationDataSource = function(languageKey, source) {
			$translateProvider.translations(languageKey, source);
		};

		// Wrapps the default $translate service with instant translations support.
		// Instant should always be used since the culture would normally be resolved
		// before the application starts.
		// xaTranslation.instant can be used with optional parameters for formatting:
		//
		// example: xaTranslation.instant('my_key', 'foo', 'bar')
		//			where my_key maps to 'Hello {0} {1}'
		//			return 'Hello foo bar'
		this.$get = function($translate) {
			return {
				instant: function () {

					if (!arguments) {
						throw new Error('xaTranslation: instant requires at least one parameter.');
					}

					var key = _.first(arguments),
						result = $translate.instant(key);

					if (arguments.length && arguments.length > 1) {

						var parameters = _.last(arguments, arguments.length - 1),
							replacements = _.filter(parameters, isString);
						result = result.format.apply(result, replacements);

					}

					return result;
				},
				use: function(lang) {
					return $translate.use(lang);
				},
				getResource: function (resKey, isHtml) {
				    var value = resKey || '';
				    if (resKey)
				        value = this.instant(resKey);

				    if (isHtml) {
				        value = value.replace(/\n/g, "<br/>");
				    }

				    return value;
				}
			};
		};

	});

	local.run(function($rootScope, xaTranslation) {
		$rootScope.translate = xaTranslation.instant;
	});

	local.filter('tr', function($rootScope) {
		return function(resKey) {
			return $rootScope.translate(resKey);
		};
	});

	function isString(s) {
		return typeof s === 'string';
	}

})(window.XaNgFrameworkServices);