(function(local) {
	'use strict';

	local.directive('xaAutofocus', function ($timeout) {

		return {
		    restrict: 'A',
		    link: function ($scope, $element) {
		        $timeout(function () {
		            var inputEl = $element;
		            if ($element.prop('tagName') != 'INPUT')
		                inputEl = $element.find('input');

		            inputEl.focus();
		        }, 0, false);
		    }
		};

	});

})(window.XaNgFrameworkAutofocus);