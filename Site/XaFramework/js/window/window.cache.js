(function (local) {
	'use strict';

	local.service('windowCache', function () {

		var windowsCache = {};

		this.cache = windowsCache;

		this.getOrAdd = function ( window, builderFn ) {

			var key = getCacheKey( window );

			if (! windowsCache[ key ]) {
				windowsCache[key] = builderFn( window );
			}

			return windowsCache[key];
		};

		function getCacheKey( window ) {
			return (window.templateUrl + '-' + window.controllerName).replace(/(\/|\s)/g, '-');
		}
	});


	local.factory('windowCacheEntry', function() {

		function windowCacheEntry(element, compileFn) {
			this.element = element;
			this.compileFn = compileFn;
		}

		windowCacheEntry.prototype = {
			setClone: function(element) {
				this.clone = element;
			},
			getClone: function() {
				return this.clone;
			}
		};

		return windowCacheEntry;

	});


})(window.XaNgFrameworkWindow);