(function(local) {
	'use strict';

	local.service('xaTouch', function() {

		var isTouchDevice = function() {
			return ("ontouchstart" in window || navigator.msMaxTouchPoints);
		};

		return {
			isTouchDevice: isTouchDevice
		};
	});

})(window.XaNgFrameworkServices);