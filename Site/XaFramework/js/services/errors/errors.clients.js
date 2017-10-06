(function (local) {
    'use strict';

    local.config(function ($provide) {

        $provide.decorator("$exceptionHandler", function ($delegate, $injector) {
        	return function (exception, cause) {
        		cause = typeof exception === 'string' ? "erreur emise par le code utilisateur EDL" : cause;
        		exception = typeof exception === 'string' ? { message: exception } : exception;
        		$injector.get('xaErrorDisplay').showClientError({
                    exception: exception,
                    cause: cause
                });
                $delegate(exception, cause);
            };
        });
        
    });

    local.run(function ($window, xaErrorDisplay) {

        angular.element($window).on('error', function (event) {
            xaErrorDisplay.showClientError({
                exception: {
                    message: event.originalEvent.message,
                    stack:  event.originalEvent.error ? event.originalEvent.error.stack : ""
                },
                cause: event.originalEvent.filename
            });
        });

    });

})(window.XaNgFrameworkServices);