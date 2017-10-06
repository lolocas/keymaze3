(function(local) {
	'use strict';

	local.directive('xaAutoheight', function ($timeout) {

		return {
		    restrict: 'A',
		    link: function (scope, $element) {
		        $timeout(function () {
		            calculateHeight();
		        }, 0, false);

		        function calculateHeight() {
		            var $elem = $element;
		            var $container = $elem.parent();

		            var totalH = $container.height();
		            $container.children().each(function () {
		                if ($(this).attr('xa-autoheight') != undefined) return;
		                totalH -= $(this).outerHeight();
		            });

		            $elem.height(totalH);
		        }

		        $(window).on('resize.autoheight-' + scope.$id, function () {
		            calculateHeight();
		        });

		        scope.$on('$destroy', function () {
		            $(window).off('resize.autoheight-' + scope.$id);
		        });
		    }
		};

	});

})(window.XaNgFrameworkAutoheight);