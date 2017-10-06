(function () {
    'use strict';

    angular.module('XaCommon').service('ApiHelper', ApiHelper);

    function ApiHelper($q, $http, dialogs, UrlHelper, LocalService, ProfilerService, UtilsHelper) {

    	this.callApiApplicationOnUrl = callApiApplicationOnUrl;
        this.callApiApplication = callApiApplication;
        this.callApiLocal = callApiLocal;
        this.openHtmlLinkApplication = openHtmlLinkApplication;

        function callApiApplicationOnUrl(url, param, expectedType, opts) {
        	var def = $q.defer();
        	var headers = { headers: { 'SessionId': UrlHelper.sessionId } };
        	if (opts && opts.hideLoading)
        		headers.headers['x-noloading'] = true;
        	if (opts && opts.cancellable)
        		headers.headers['x-cancellable'] = true;
        	if (opts && opts.hideError)
        		headers.headers['x-noerror'] = true;
        	var resetLoading = opts ? opts.resetLoading : true;

        	$http.post(url, ((typeof param == 'string' || param instanceof String) ? null : param), headers)
                .success(function (result) {
                	var convertedResult = UtilsHelper.convertObjectOrArrayToType(result, expectedType)
                	if (resetLoading)
                		UtilsHelper.setLoadingMessage('');
                	def.resolve(convertedResult);
                })
                .error(function (result) {
                	UtilsHelper.setLoadingMessage('');
                	def.reject(result);
                });

        	return def.promise;
        };


        function callApiApplication(controller, method, param, expectedType, opts) {
            var def = $q.defer();
            ProfilerService.addApi('Application', controller, method, param)
            var headers = { headers: { 'SessionId': UrlHelper.sessionId } };
            if (opts && opts.hideLoading)
                headers.headers['x-noloading'] = true;
            if (opts && opts.cancellable)
                headers.headers['x-cancellable'] = true;
            if (opts && opts.hideError)
                headers.headers['x-noerror'] = true;
            var resetLoading = opts ? opts.resetLoading : true;

            $http.post(UrlHelper.getUrlApiApplicationWithoutSession(controller, method, param), ((typeof param == 'string' || param instanceof String) ? null : param), headers)
                .success(function (result) {
                    var convertedResult = UtilsHelper.convertObjectOrArrayToType(result, expectedType)
                    if (resetLoading)
                        UtilsHelper.setLoadingMessage('');
                    def.resolve(convertedResult);
                })
                .error(function (result) {
                    UtilsHelper.setLoadingMessage('');
                    def.reject(result);
                });

            return def.promise;
        };

        function callApiLocal(controller, method, param, expectedType, opts) {
            var def = $q.defer();
            ProfilerService.addApi('Local', controller, method, param)
            var headers = { headers: { 'SessionId': UrlHelper.sessionId } };
            if (opts && opts.hideLoading)
                headers.headers['x-noloading'] = true;
            if (opts && opts.cancellable)
                headers.headers['x-cancellable'] = true;
            if (opts && opts.hideError)
                headers.headers['x-noerror'] = true;

            var resetLoading = opts ? opts.resetLoading : true;

        	$http.post(UrlHelper.getUrlApiLocalWithoutSession("localhost", "9101", controller, method, param), ((typeof param == 'string' || param instanceof String) ? null : param), headers)
                .success(function (result) {
                    var convertedResult = UtilsHelper.convertObjectOrArrayToType(result, expectedType)
                    if (resetLoading)
                        UtilsHelper.setLoadingMessage('');
                    def.resolve(convertedResult);
                })
                .error(function (result) {
                    /* dialogs.error(UtilsHelper.getLabel('TXT_ERREUR'), UtilsHelper.getLabel('TXT_SERVICELOCAL_PERDU'));
                    LocalService.disconnect(); */
                    UtilsHelper.setLoadingMessage('');
                    def.reject(result);
                })
            ;
            return def.promise;
        };

        function openHtmlLinkApplication(controller, method, id, newPage) {
            window.open(UrlHelper.getUrlApiApplication(controller, method, id), newPage == true ? '_blank' : '_self');
        };
    };

})();