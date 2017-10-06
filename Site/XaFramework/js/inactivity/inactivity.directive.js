(function (local) {
    'use strict';
  
    local.directive('xaInactivity', function ($rootScope, xaLoadingService) {

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                options: '='
            },
            link: function (scope, element) {
                
            	var timeout = null;
            	var triggerFn = null;

                var interval = 30; //sec
                var stopInterval = null;
          
                scope.options.start = function () {
                	timeout = (scope.options.timeout || 20) * 60; //mins -> sec
                	triggerFn = scope.options.trigger || angular.noop();

                	if (stopInterval) clearInterval(stopInterval);
                	stopInterval = setInterval(checkTime, interval * 1000);
                };

                scope.options.stop = function () {
                    if (stopInterval) clearInterval(stopInterval);
                };


                function checkTime() {
                	var secs = ((new Date()).getTime() - $rootScope.lastServerCall.getTime()) / 1000;
                	if (secs > timeout) {
                	    triggerFn(secs);
                	    if (!$rootScope.$$phase) $rootScope.$apply(); //force angular to digest, so it will show the dialog
                	}
                }

                scope.$on('$destroy', function () {
                    if(stopInterval)
                        clearInterval(stopInterval);
                });
            }
        };
    });

})(window.XaNgFrameworkInactivity);
