(function () {
    'use strict';

    angular.module('XaCommon').service('UserService', UserService);

    function UserService($q, $state, $rootScope, $locale, $location, $http, xaFrameworkSetting, localStorageService, ConfConst, DialogHelper, ApiHelper, UtilsHelper, PushHelper, UrlHelper, CacheHelper, ParametersService, LocalService, PushServerService) {

        this.authentificated = false;
        this.user = null;
        this.login = login;
        this.logout = logout;
        this.tryAutoLogin = tryAutoLogin;

        this.localHostPortCitrix = undefined;

        var ctx = this;

        function getOsUserName() {
            var def = $q.defer(); //Vu avec VTO : Le $q.defer est necessaire pour avoir le resultat brut en retour et non le resultat encapsulé dans un objet type httpResponse
            var isSecured = ($location.protocol() == 'https');
            var url = $location.protocol() + '://' + ParametersService.getAppParameter('LocalHostName') + ':' + ParametersService.getAppParameter((isSecured ? 'LocalControllerSecurePort' : 'LocalControllerPort')) + '/XnLocalControler/getosusername/' + UtilsHelper.getGuid();
            if (ctx.localHostPortCitrix) //Cas du citrix -> pas de controller mais uniquement Host local
                url = $location.protocol() + '://' + ParametersService.getAppParameter('LocalHostName') + ':' + ctx.localHostPortCitrix + '/Local/api/tools/getosusername/';

            $http.get(url, { timeout: 1000 })
                .success(function (result) {
                    def.resolve(result);
                })
                .error(function (result) {
                    def.resolve(undefined);
                });

            return def.promise;
        }

        function tryAutoLogin() {
            var disablePush = UrlHelper.getUrlParameter('disablepush', 'false') == 'false' ? false : true;
            var disableLocal = UrlHelper.getUrlParameter('disablelocal', 'false') == 'false' ? false : true;
            var disableAutologin = UrlHelper.getUrlParameter('disableautologin', 'false') == 'true' ? true : false;

            if (!disableAutologin) {
                // mot de passe dans url
                if (UrlHelper.getUrlParameter('login') && UrlHelper.getUrlParameter('pwd')) {
                    return login(UrlHelper.getUrlParameter('login'), UrlHelper.getUrlParameter('pwd'), disablePush, disableLocal);
                }
                else if (UrlHelper.getUrlParameter('login') === "ANONYMOUS" // cas de l'appel externe anonyme 
					|| ConfConst.ANONYMOUS_APPLICATION === true) // Cas de l'application anonyme
                {
                    return login('ANONYMOUS', '', disablePush, disableLocal);
                }
                    // authentification windows
                else if (ParametersService.getAppParameter('AuthenticationMode', 'Standard') == 'UserWindows') {
                    return getOsUserName().then(function (username) {
                        if (!UtilsHelper.isEmptyOrWhitespace(username)) {
                            return login('USER_WINDOWS', username, false, false);
                        }
                        return false;
                    });
                }
                    // authentification SSO
                else if (ParametersService.getAppParameter('AuthenticationMode', 'Standard') == 'SSO') {
                    var casaction = UrlHelper.getUrlParameter('casaction');
                    var ticket = UrlHelper.getUrlParameter('ticket');
                    if (casaction == 'check' && !UtilsHelper.isEmptyOrWhitespace(ticket)) {
                        return login('XPLORE_SSO', ticket, false, false).then(function () {
                            if (ctx.user == null) {
                                var loginUrl = ParametersService.getAppParameter('SSOLoginUrl');
                                if (!UtilsHelper.isEmptyOrWhitespace(loginUrl))
                                    window.location.replace(loginUrl);
                                else
                                    DialogHelper.showErrorMessage('TXT_ERROR', 'TXT_ERROR_SSO');
                            }
                        });
                    }
                    else {
                        return false;
                    }
                }
            }

            // pas de success du logoin
            return UtilsHelper.emptyPromise(false, true);
        }



        function login(username, password, disablePush, disableLocal) {

            var machineId = UtilsHelper.getGuid();
            if (localStorageService.isSupported) {
                var storageId = localStorageService.get('machineId');
                if (storageId)
                    machineId = storageId;
                localStorageService.set('machineId', machineId);
            }
            var appParameters = ParametersService.getAppParameters();

            return ApiHelper.callApiApplication('user', 'connect', { "UserName": username, "Password": password, "MachineId": machineId })
                 .then(function (result) {
                     if (result != null) {
                         ctx.authentificated = true;
                         ctx.user = result;
                         UrlHelper.sessionId = ctx.user.sessionId;

                         /*  Change page title */
                         if (ctx.user && ctx.user.identification)
                             document.title = ctx.user.identification.codeUtilisateur + '-' + document.title;

                         /* Gestion des clés de paramétrage utilisateur */
                         xaFrameworkSetting.initParameters({
                             AttachedFileMaxSize: appParameters.AttachedFileMaxSizeInMeg,
                             TelephonyCountryCode: appParameters.CodePaysTelephone,
                             LanguageCountryCode: appParameters.Language.substring(0, 2).toLowerCase(),
                             DateFormat: appParameters.FormatDate,
                             SeparateurDecimal: appParameters.SeparateurDecimal,
                             SessionId: ctx.user.sessionId,
                             UserRights: ctx.user.userRights,
                             UploadUrl: UrlHelper.getUrlApiApplication('Upload', 'UploadFile'),
                             TestMode: UrlHelper.getUrlParameter('TestMode') == "1",
                             CustomPeriods: ctx.user.customPeriods
                         });

                         /*Initialisation inactivité */
                         if (appParameters.SessionLifetime && appParameters.SessionLifetime > 0) {
                             $rootScope.inactivityOptions.timeout = appParameters.SessionLifetime;
                             $rootScope.inactivityOptions.start();
                         }

                         if (disableLocal == true || appParameters.LocalHostActif === 'false')
                             return ctx.user;
                         else {
                             var localConfig = {
                                 localControllerPort: appParameters.LocalControllerPort,
                                 localHostName: appParameters.LocalHostName,
                                 localHostPort: ctx.localHostPortCitrix ? ctx.localHostPortCitrix : appParameters.LocalHostPort,
                                 islocalHostPortCitrix: ctx.localHostPortCitrix ? true : false,
                                 devMode: appParameters.DevMode && appParameters.DevMode.toLowerCase() == 'true' ? true : false,
                                 applicationUrlPart: appParameters.ApplicationUrlPart,
                                 urlXploreAddons: appParameters.UrlXploreAddons,
                                 initalizeParams: { VersionSSV: appParameters.VersionSSV }
                             };

                             if ($location.protocol() == 'https') {
                                 localConfig.localControllerPort = appParameters.LocalControllerSecurePort;
                                 localConfig.localHostPort = ctx.localHostPortCitrix ? ctx.localHostPortCitrix : appParameters.LocalHostSecurePort;
                             }

                             return LocalService.tryConnectLocaHost(localConfig);
                         }
                     }
                 })
                 .then(function (result) {
                     if (ctx.authentificated === true && LocalService.isLocalHostConnected()) {
                         PrintService.initialise();
                     }
                 })
                 .then(function (result) {
                     if (ctx.authentificated === true && appParameters.PushActif == 'true' && !(disablePush == true)) {
                         return PushServerService.connect(appParameters.UrlPushServerForClient, username, ctx.user.sessionId);
                     }
                 })
			    .then(function (result) {
			        //Affichage message de warning si licence temporaire 
			        //Cet affichage de message a été déplacer pour eviter que l'affichage du message d'info perturbe le chargement de l'appli
			        if (ctx.authentificated === true && ctx.user.identification && !UtilsHelper.isEmptyOrWhitespace(ctx.user.identification.warningMessage))
			            return DialogHelper.showInfoMessage("TXT_INFORMATION", ctx.user.identification.warningMessage);
			        else
			            return null;
			    });
        };


        function logout(redirectoTogin, showTimeOutMessage) {
            redirectoTogin = redirectoTogin == undefined ? true : redirectoTogin;
            var def = $q.defer();

            if (this.authentificated != true) {
                if (redirectoTogin)
                    $state.go(ConfConst.LOGIN_STATE, showTimeOutMessage == true ? { disconnected: true } : undefined, { notify: false, reload: false }).then(function () {
                        window.location.reload();
                    });
                def.resolve(true);
                return def.promise;
            }

            $rootScope.inactivityOptions.stop();

            PrintService.disconnect();
            ViewerService.unloadViewer();

            PushServerService.disconnect()

            .finally(function () { return LocalService.disconnect() })
            .finally(function () { return ApiHelper.callApiApplication('user', 'disconnect', { preferences: ctx.user ? ctx.user.userPreferences : {} }) })
            .finally(clearClientThenRedirectToLogin)

            function clearClientThenRedirectToLogin() {
                ctx.authentificated = false;
                ctx.user = null;
                UrlHelper.sessionId = null;
                if (redirectoTogin) {
                	var stateParams = {}
                	stateParams.disableautologin = true;
                	if (showTimeOutMessage == true)
                		stateParams.disconnected = true;
                	$state.go(ConfConst.LOGIN_STATE, stateParams, { notify: false, reload: false }).then(function () {
                		window.location.reload();
                
                	});
                }
                
                def.resolve(ctx.user);
            }

            return def.promise;
        };

    };

})();