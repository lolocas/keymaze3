(function (local) {
    'use strict';

    /*
     * xaLogging is a service for logging client side errors / messages.
     * At startup, you can set preffered settings using 
     * xaLoggingProvider.configureLogger(settings) to customize the following setting:
     * 
     * 1. level: defines the minimum level at which messages are logged on the client console.
     *  
     *           Possible values: 
     *                  xaLoggingProvider.levels.debug
     *                  xaLoggingProvider.levels.info
     *                  xaLoggingProvider.levels.warn
     *                  xaLoggingProvider.levels.error
     *           Default value: debug
     * 
     * 2. serverLevel: defines the minimum level at which messages are logged to server. See (1) for possible values.
     * 
     *           Default value: warn
     * 
     * 3. url: string representing the url at which the messages are sent by POST request.
     */

    local.provider('xaLogging', function () {

        var levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };

        var internalSettings = {
            level: levels.debug,
            serverLevel: levels.warn,
            url: '/api/logging/log'
        };

        this.configureLogger = function (settings) {
            internalSettings = angular.extend(internalSettings, settings);
        };

        this.levels = angular.copy(levels);

        this.$get = function ($http, xaFrameworkSetting) {

            var logFn = function (logType, message) {

                if (logType < internalSettings.level) {
                    return;
                }

                switch (logType) {
                    case levels.debug:
                        console.debug(message);
                        break;
                    case levels.info:
                        console.info(message);
                        break;
                    case levels.warn:
                        console.warn(message);
                        break;
                    case levels.error:
                        console.error(message);
                        break;
                    default:
                        console.log(message);
                        break;
                }
                
                if (logType < internalSettings.serverLevel) {
                    return;
                }
            };

            return {
                error: function (message) {
                    logFn(levels.error, message);
                },
                info: function (message) {
                    logFn(levels.info, message);
                },
                warning: function (message) {
                    logFn(levels.warn, message);
                },
                debug: function (message) {
                    logFn(levels.debug, message);
                }
            }
        };
    });

})(window.XaNgFrameworkServices);