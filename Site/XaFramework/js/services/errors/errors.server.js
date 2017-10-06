(function (local) {
	'use strict';

	local.config(function ($httpProvider) {
		$httpProvider.interceptors.push('xaInternalServerErrorsInterceptor');
	})

    .factory('xaInternalServerErrorsInterceptor', function ($q, $injector) {


    	function displayService() {
    		return $injector.get('xaErrorDisplay');
    	}

    	return {

    		// This interceptor catches unhandled exceptions on ajax calls to the server.

    		'responseError': function (rejection) {
				// Ne pas afficher de message d'erreur si parametre hideError passé a callApiApplication ou callApiLocal
    			if (rejection.config && rejection.config.headers && rejection.config.headers['x-noerror'] == true) {

    			}
    			else if (rejection.status != 401) { //raul: skip 401 - not authenticated errors
    				if (rejection.status == 404 || rejection.status == -1) {
    					displayService().showNoServerError(rejection);
    				}
    				else {
    					displayService().showServerError(rejection);
    				}

    			}

    			return $q.reject(rejection);
    		}
    	}

    });

})(window.XaNgFrameworkServices);