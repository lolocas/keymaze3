(function () {
    'use strict';

    angular.module('XaCommon').service('UrlHelper', UrlHelper);

    function UrlHelper(dialogs, UtilsHelper, ParametersService) {

        this.getUrlApi = getUrlApi;
        this.getUrlApiApplication = getUrlApiApplication;
        this.getUrlApiLocal = getUrlApiLocal;
        this.getUrlApiApplicationWithoutSession = getUrlApiApplicationWithoutSession;
        this.getUrlApiLocalWithoutSession = getUrlApiLocalWithoutSession;
        this.openXploreAddonsUrl = openXploreAddonsUrl;

        this.getUrlParameter = getUrlParameter;
        this._initUrl = location.href;

        this.sessionId = null;

        var ctx = this;

        function getUrlApi(prefix, controller, classname, param, excludeSessionId) {
            if ((typeof prefix == 'string' || prefix instanceof String) && prefix != '')
                prefix += "/";

            var result = prefix + "api/" + controller + "/" + classname;

            var paramSeparator = '?';
            if (typeof param == 'string' || param instanceof String) {
                if (!UtilsHelper.startWith(param, '?'))
                    result += paramSeparator + 'id=' + encodeURIComponent(param);
                else
                    result += param;
                paramSeparator = '&';
            }

            if (!excludeSessionId && ctx.sessionId) {
                result += paramSeparator + "sessionid=" + ctx.sessionId;
            }

            return result;
        };

        function getUrlApiApplicationWithoutSession(controller, classname, param) {
            return this.getUrlApi('Application', controller, classname, param, true);
        };

        function getUrlApiLocalWithoutSession(localHostName, localPort, controller, classname, param) {
            return location.protocol + "//" + localHostName + ":" + localPort + "/" + this.getUrlApi("Local", controller, classname, param, true);
        };

        function getUrlApiApplication(controller, classname, param) {
            return this.getUrlApi('Application', controller, classname, param);
        };

        function getUrlApiLocal(localHostName, localPort, controller, classname, param) {
            return location.protocol + "//" + localHostName + ":" + localPort + "/" + this.getUrlApi("Local", controller, classname, param);
        };

        function getUrlParameter(name, defaultValue, removeAfterUse) {
            var result = null;
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(this._initUrl);


            if (results == null) {
                return defaultValue || '';
            }
            else {
                if (removeAfterUse)
                    this._initUrl = this._initUrl.replace(regex, '');

                return decodeURIComponent(results[1].replace(/\+/g, " "));
            }
        }

        function openXploreAddonsUrl(relativePath, target) {
            var pageTarget = target ? target : '_blank';
            var urlToOpen = ParametersService.getAppParameter('UrlXploreAddons');
            if (ParametersService.getAppParameter('ApplicationModuleCode') == "EDB") {
                var devMode = (ParametersService.getAppParameter('DevMode') == 'true');
                var applicationUrlPart = ParametersService.getAppParameter('ApplicationUrlPart');
                var urlToOpen = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + (devMode == true ? '' : '/' + applicationUrlPart);
            }

            if (!UtilsHelper.isEmptyOrWhitespace(urlToOpen)) {
                if (!UtilsHelper.endsWith(urlToOpen, '/') && !UtilsHelper.startWith(relativePath, '/'))
                    urlToOpen += '/';
                urlToOpen += relativePath;
                UtilsHelper.openHtmlLinkFromUrl(urlToOpen, pageTarget);
            }
            else {
                dialogs.error(getLabel('TXT_ERREUR'), getLabel('TXT_URL_XPLORE_ADDONS_ERROR'));
            }
        }
    };
})();