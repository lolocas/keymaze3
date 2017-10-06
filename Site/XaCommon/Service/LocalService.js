(function () {
    'use strict';

    angular.module('XaCommon')

        .factory('LocalHostParameterModel', function () {
            var LocalHostParameterModel = function (data) {
                this.localControllerPort = data ? data.localControllerPort : '';
                this.localHostPort = data ? data.localHostPort : '';
                this.localHostName = data ? data.localHostName : '';
                this.devMode = data ? data.devMode : '';
                this.applicationUrlPart = data ? data.applicationUrlPart : '';
                this.islocalHostPortCitrix = data ? data.islocalHostPortCitrix : false;
                this.initalizeParams = data ? data.initalizeParams : null;
                this.urlXploreAddons = data ? data.urlXploreAddons : null;
            };
            return LocalHostParameterModel;
        })

})();


(function () {
    'use strict';

    angular.module('XaCommon').service('LocalService', LocalService);

    function LocalService($rootScope, $http, $q, LocalHostParameterModel, UrlHelper, UtilsHelper, xaLoadingService) {

        this._pingTimeOut = 2000;
        this._controllerCallTimeOut = 240000;
        this._callTimeOut = 5000;
        this._urlController = '';
        this._urlLocalHost = '';
        this.isControllerConnected = false;
        this._isLocalHostConnected = false;
        this._urlXml = '';
        this.disconnect = disconnect;
        this.conf = {};
        
        this.isLocalHostConnected = isLocalHostConnected;
        this.tryConnectLocaHost = tryConnectLocaHost;
        this.getInstalledApplication = getInstalledApplication;
        this.getControlerVersion = getControlerVersion;
        this.activateApplication = activateApplication;
        this.activateAllApplications = activateAllApplications;
        this.desactivateApplication = desactivateApplication;
        this.desactivateAllApplications = desactivateAllApplications;
        this.updateApplication = updateApplication;
        this.updateAllApplications = updateAllApplications;
        this.uninstallApplication = uninstallApplication;
        this.uninstallAllApplications = uninstallAllApplications;

        function isLocalHostConnected() {
            return this._isLocalHostConnected;
        }

        function disconnect() {
            this.isControllerConnected = false;
            this._isLocalHostConnected = false;
            this._urlController = '';
            this._urlLocalHost = '';
            this._urlXml = '';
            this.conf = {};
            return declareHostLocalStatusToApiServer(false);
        }

        var ctx = this;

        // Ping the controler
        function getInstalledApplication() {
            var defer = $q.defer();

            $http.get(location.protocol + ctx._urlController + 'XnLocalControler/getapplicationsjson/' + UtilsHelper.getGuid() + '/' + ctx._urlXml, { timeout: ctx._controllerCallTimeOut })
                .then(function (result) {
                    defer.resolve(eval(result.data))
                }, function () {
                    defer.reject(false)
                });

            return defer.promise;
        }

        function getControlerVersion() {
            var defer = $q.defer();

            $http.get(location.protocol + ctx._urlController + 'XnLocalControler/controlerversion/' + UtilsHelper.getGuid(), { timeout: ctx._controllerCallTimeOut })
                .then(function (result) {
                    defer.resolve(result.data)
                }, function () {
                    defer.reject(false)
                });

            return defer.promise;
        }

        function activateApplication(appId) {
            var defer = $q.defer();

            $http.get(location.protocol + ctx._urlController + 'XnLocalControler/activateapplication/' + UtilsHelper.getGuid() + '/' + ctx._urlXml + '/' + appId, { timeout: ctx._controllerCallTimeOut })
                .then(function (result) {
                    defer.resolve(eval(result.data))
                }, function () {
                    defer.reject(false)
                });

            return defer.promise;
        }

        function activateAllApplications() {
            var defer = $q.defer();

            $http.get(location.protocol + ctx._urlController + 'XnLocalControler/activateapplications/' + UtilsHelper.getGuid() + '/' + ctx._urlXml, { timeout: ctx._controllerCallTimeOut })
                .then(function (result) {
                    defer.resolve(eval(result.data))
                }, function () {
                    defer.reject(false)
                });

            return defer.promise;
        }

        function desactivateApplication(appId) {
            var defer = $q.defer();

            $http.get(location.protocol + ctx._urlController + 'XnLocalControler/desactivateapplication/' + UtilsHelper.getGuid() + '/' + ctx._urlXml + '/' + appId, { timeout: ctx._controllerCallTimeOut })
                .then(function (result) {
                    defer.resolve(eval(result.data))
                }, function () {
                    defer.reject(false)
                });

            return defer.promise;
        }
        
        function desactivateAllApplications() {
            var defer = $q.defer();

            $http.get(location.protocol + ctx._urlController + 'XnLocalControler/desactivateapplications/' + UtilsHelper.getGuid() + '/' + ctx._urlXml, { timeout: ctx._controllerCallTimeOut })
                .then(function (result) {
                    defer.resolve(eval(result.data))
                }, function () {
                    defer.reject(false)
                });

            return defer.promise;
        }

        function updateApplication(appId, isInstallation) {
            var defer = $q.defer();

            $http.get(location.protocol + ctx._urlController + 'XnLocalControler/updateapplication/' + UtilsHelper.getGuid() + '/' + ctx._urlXml + '/' + appId + '/' + isInstallation, { timeout: ctx._controllerCallTimeOut })
                .then(function (result) {
                    defer.resolve(eval(result.data))
                }, function () {
                    defer.reject(false)
                });

            return defer.promise;
        }

        function updateAllApplications() {
            var defer = $q.defer();

            $http.get(location.protocol + ctx._urlController + 'XnLocalControler/updateapplications/' + UtilsHelper.getGuid() + '/' + ctx._urlXml, { timeout: ctx._controllerCallTimeOut })
                .then(function (result) {
                    defer.resolve(eval(result.data))
                }, function () {
                    defer.reject(false)
                });

            return defer.promise;
        }

        function uninstallApplication(appId) {
            var defer = $q.defer();

            $http.get(location.protocol + ctx._urlController + 'XnLocalControler/uninstallapplication/' + UtilsHelper.getGuid() + '/' + ctx._urlXml + '/' + appId, { timeout: ctx._controllerCallTimeOut })
                .then(function (result) {
                    defer.resolve(eval(result.data))
                }, function () {
                    defer.reject(false)
                });

            return defer.promise;
        }
        
        function uninstallAllApplications() {
            var defer = $q.defer();

            $http.get(location.protocol + ctx._urlController + 'XnLocalControler/uninstallapplications/' + UtilsHelper.getGuid() + '/' + ctx._urlXml, { timeout: ctx._controllerCallTimeOut })
                .then(function (result) {
                    defer.resolve(eval(result.data))
                }, function () {
                    defer.reject(false)
                });

            return defer.promise;
        }

        function startAllApplications() {
            var defer = $q.defer();

            $http.get(location.protocol + ctx._urlController + 'XnLocalControler/startapplications/' + UtilsHelper.getGuid() + '/' + ctx._urlXml, { timeout: ctx._controllerCallTimeOut })
                .then(function (result) {
                    defer.resolve(eval(result.data))
                }, function () {
                    defer.reject(false)
                });

            return defer.promise;
        }

        function tryConnectLocaHost(localConfiguration) {
        	this.conf = new LocalHostParameterModel(localConfiguration);

        	var genDef = $q.defer();
            this._urlController = '//' + this.conf.localHostName + ':' + this.conf.localControllerPort + '/';
        	this._urlLocalHost = '//' + this.conf.localHostName + ':' + this.conf.localHostPort + '/';

        	var urlXml = this.conf.urlXploreAddons;
        	if (UtilsHelper.isEmptyOrWhitespace(urlXml))
        		urlXml = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + (this.conf.devMode == true ? '' : '/' + this.conf.applicationUrlPart);

            urlXml += (!UtilsHelper.endsWith(urlXml, '/') ? '/' : '') + 'XnLocal/XnLocal.xml';
            this._urlXml = UtilsHelper.replaceAll(urlXml, '/', '|');

        	// Ping the controller the controller
        	UtilsHelper.setLoadingMessage(UtilsHelper.getLabel('TXT_LOCALHOST_ACCESS'));

        	// En mode dev et en mode citrix, on ne contacte pas la mise à jours du controller
        	if (this.conf.islocalHostPortCitrix == false && this.conf.devMode != true) {
        		pingController()
					.then(updateController)
					.then(updateAndStartApplications)
					.then(tryContactLocalHost);
        	}
        	else{
        	    tryContactLocalHost(!this.conf.devMode);
			}

            // Ping the controler
            function pingController() {
                var def = $q.defer();

                _callLocalControllerWithResult(ctx._pingTimeOut, ctx._urlController + 'XnLocalControler/ping/' + UtilsHelper.getGuid()).then(function (result) {
                    def.resolve((result == "PONG"));
                });

                return def.promise;
            }

            // Update controler service
            function updateController(result) {
                var def = $q.defer();

                if (result == false) {
                    UtilsHelper.setLoadingMessage("");
                    def.resolve(false);
                }
                else {
                    UtilsHelper.setLoadingMessage(UtilsHelper.getLabel('TXT_LOCALHOST_UPDATE'));
                    var urlToUpdate = ctx._urlController + 'XnLocalControler/updatelocalcontroler/' + UtilsHelper.getGuid() + '/' + ctx._urlXml;
                    _callLocalControllerWithResult(ctx._controllerCallTimeOut, urlToUpdate).then(function (result) {
                        if (result == 'true' || result == 'True' || result === true) {
                            //Le controler a lancer sa mise a jour -> on attend 2 sec puis on se met en attente pendant maximum 1 minute
                            xaLoadingService.show();
                            setTimeout(function () {
                                var startDate = new Date();
                                var pingTimer = setInterval(function () {
                                    pingController().then(function (pingResult) {
                                        if (pingResult == true) {
                                            clearInterval(pingTimer);
                                            xaLoadingService.hide();
                                            def.resolve(true);
                                        }
                                        else {
                                            var now = new Date();
                                            if ((now - startDate) > 60000) {
                                                clearInterval(pingTimer);
                                                xaLoadingService.hide();
                                                def.resolve(false);
                                            }
                                        }
                                    });
                                }, ctx._pingTimeOut + 500);
                            }, 2000);
                        }
                        else {
                            def.resolve(true);
                        }
                    });
                }

                return def.promise;
            }

            // Update applications
            function updateAndStartApplications(result) {
                var def = $q.defer();

                if (result == false) {
                    UtilsHelper.setLoadingMessage("");
                    def.resolve(false);
                }
                else {
                    UtilsHelper.setLoadingMessage(UtilsHelper.getLabel('TXT_LOCALHOST_UPDATE'));
                    var urlToUpdate = ctx._urlController + 'XnLocalControler/updateandstartapplications/' + UtilsHelper.getGuid() + '/' + ctx._urlXml;
                    _callLocalController(ctx._controllerCallTimeOut, urlToUpdate).then(function (result) { def.resolve(result) });
                }

                return def.promise;
            }

            // Start Applications
            function startApplications(result) {
                var def = $q.defer();

                if (result == false) {
                    UtilsHelper.setLoadingMessage("");
                    def.resolve(false);
                }
                else {
                    UtilsHelper.setLoadingMessage(UtilsHelper.getLabel('TXT_LOCALHOST_CONNECT'));
                    var urlToUpdate = ctx._urlController + 'XnLocalControler/startapplications/' + UtilsHelper.getGuid() + '/' + ctx._urlXml;
                    _callLocalController(ctx._controllerCallTimeOut, urlToUpdate).then(function (result) { def.resolve(result) });
                }

                return def.promise;
            }

            //Contact localhost
            function tryContactLocalHost(result) {
                if (result == true)
                    ctx.isControllerConnected = true;              
                if (result == true || ctx.conf.devMode) {
                    UtilsHelper.setLoadingMessage(UtilsHelper.getLabel('TXT_LOCALHOST_CONNECT'));
                    var urlToPing = ctx._urlLocalHost + 'local/api/localparameters/initialize/';
                    _callLocalWebservice(ctx._callTimeOut, urlToPing, ctx.conf.initalizeParams)
                        .then(refeshLocalHostStatus);
                }
                else
                {
                    refeshLocalHostStatus(false);
                }
            }

            function refeshLocalHostStatus(result) {
                UtilsHelper.setLoadingMessage("");
                if (result) {
                    ctx._isLocalHostConnected = true;
                    declareHostLocalStatusToApiServer(true);
                    genDef.resolve(result);
                } else {
                    genDef.resolve(result);
                }

               /// return genDef.promise;
            };

            function _callLocalWebservice(timeoutInMs, url, params) {
                var def = $q.defer();
                $http.post(url, params, { timeout: timeoutInMs })
                    .success(function (result) {
                        def.resolve(true);
                    })
                    .error(function (result) {
                        def.resolve(false);
                    });

                return def.promise;
            };

            function _callLocalController(timeoutInMs, url) {
                var def = $q.defer();
                $http.get(url, { timeout: timeoutInMs })
                    .success(function (result) {
                        def.resolve(true);
                    })
                    .error(function (result) {
                        def.resolve(false);
                    });

                return def.promise;
            };

            function _callLocalControllerWithResult(timeoutInMs, url) {
                var def = $q.defer();
                $http.get(url, { timeout: timeoutInMs })
                    .success(function (result) {
                        def.resolve(result);
                    })
                    .error(function (result) {
                        def.resolve(result);
                    });

                return def.promise;
            };

            return genDef.promise;
        };

        function declareHostLocalStatusToApiServer(connected) {
            var def = $q.defer();
            $http.post(UrlHelper.getUrlApiApplication('user', connected ? 'DeclareLocalHostConnected' : 'DeclareLocalHostDisConnected'))
                .success(function (result) {
                    def.resolve(true);
                })
                .error(function (result) {
                    def.reject(false);
                });

            return def.promise;
        };
    };

})();