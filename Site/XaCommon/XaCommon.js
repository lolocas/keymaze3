(function () {
    'use strict';

    angular.module('XaCommon.Template', []);
    angular.module('XaApplication.Template', []);

    var appCommon = angular.module('XaCommon', ['ui.router', 'LocalStorageModule', 'XaNgFramework', 'XaCommon.Template', 'XaApplication.Template']);

    appCommon.config(function ($stateProvider, $urlRouterProvider, $translateProvider, ConfConst) {

        $urlRouterProvider.otherwise('/UserLogin/');

        $translateProvider.translations('FR-fr', {
            TXT_AJOUTER: 'Ajouter',
            TXT_SUPPRESSION_CONFIRMATION_ADVANCED: 'Confirmez-vous la suppression de(s) élément(s) suivant(s): {0}',
            TXT_DISTANCE: 'Distance',
            TXT_GRID_GROUP_INDICATOR: 'Glisser ici pour regrouper',
            TXT_LIEU: 'Lieu',
            TXT_SOUSLIEU: 'Sous-lieu',
            TXT_LIGNES: 'Lignes',
            TXT_LIGNE: 'Ligne',
            TXT_MAX: 'Max',
            TXT_RECHERCHE: 'Recherche',
            TXT_TEMPS: 'Temps',
            TXT_TYPE: 'Type',
            TXT_URL: 'URL',
            TXT_VITESSEMOY: 'Vit.moy'
        });

        $translateProvider.use('FR-fr');
    });

    appCommon.config(function (xaErrorDisplayProvider) {
        xaErrorDisplayProvider.ignoreUrl(/api\/tools\/test/);
        xaErrorDisplayProvider.ignoreUrl(/api\/localparameters\/initialize/);
        xaErrorDisplayProvider.ignoreUrl(/api\/tools\/getosusername/);
        xaErrorDisplayProvider.ignoreUrl(/api\/Biometrie\/HaveDevice/);
        xaErrorDisplayProvider.ignoreUrl(/XnLocalControler/);
    });

    appCommon.config(function (xaLoggingProvider) {
        xaLoggingProvider.configureLogger({
            level: xaLoggingProvider.levels.debug,
            serverLevel: xaLoggingProvider.levels.warn,
            url: 'Application/api/logging/log'
        });
    });

    /*appCommon.config(function ($httpProvider) {
    	$httpProvider.useApplyAsync(true);
    });*/

    appCommon.run(function ($rootScope, $state, $location, HELPER, UserService, ProfilerService, LocalService) {
    	$rootScope.HELPER = HELPER;
		// Variable pour limiter l'utilisation de sizzle le cache de JQUERY.
    	// $.expr.cacheLength = 1;

    	// Reduction du ratio sur les petites resolutions. Notamment sur IPAD ET TABLETTE GALAXY.
    	if (screen.width < 1024)
    		alert('Attention l\'application n\'est pas optimisé pour des écrans avec une résolution inférieur à 1024.');
    	else if (screen.width < 1250) 
    		document.querySelector("meta[name=viewport]").setAttribute('content', 'initial-scale=0.8, minimum-scale=0.8, maximum-scale=0.8, user-scalable=no');
		

        // Initialisation du systeme d'inactivty
        $rootScope.inactivityOptions = {
            timeout: undefined, // Will be set from the user service
            offset: 10,
            trigger: function (arg) { HELPER.Form.openWindow('Inactivity') }
        };

        // Initialisation du toaster
        $rootScope.toasterOptions = { 'time-out': 3000, 'close-button': true }

        // Disconnect Function 
        $rootScope.cancelServerCall = function cancelServerCall() {
            HELPER.Api.callApiApplication('DatabaseSession', 'KillLastUserSession', null, null);
        };

        if (!HELPER.Utils.isEmptyOrWhitespace(HELPER.Url.getUrlParameter('port_localhost'))) {
            var portLocalhost = Number(HELPER.Url.getUrlParameter('port_localhost')) + 100;
            if ($location.protocol() == 'https')
                portLocalhost = Number(HELPER.Url.getUrlParameter('port_localhost')) + 200;
            UserService.localHostPortCitrix = portLocalhost;
            BiometrieService.localHostPortCitrix = portLocalhost;
        }

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            console.log('Switching to state ' + toState.name + ", url: " + toState.templateUrl + ', controller: ' + toState.controller);

            if (HELPER.Utils.isEmpty(HELPER.ConfConst.LOGIN_STATE) == true)
                return;

            if (toState.name == fromState.name && toState.name == HELPER.ConfConst.LOGIN_STATE)
                event.preventDefault();
            else {
                if (toState.name != HELPER.ConfConst.LOGIN_STATE && !HELPER.User.isAuthenticated() && toState.name != 'app.ExternalOpener') {
                    event.preventDefault();
                    $state.go(HELPER.ConfConst.LOGIN_STATE);
                }
                else {
                    // Blocage de connexion à des vues anonymes non authorisé.
                    if (HELPER.User.isAuthenticated() && HELPER.User.getUser() && HELPER.User.getUser().identification && HELPER.User.getUser().identification.isAnonymousUser && HELPER.ConfConst.ANONYMOUS_APPLICATION != true && toState.allowAnonymous != true) {
                        HELPER.Dialog.showInfoMessage('TXT_INFORMATION', 'TXT_DROIT_ANONYME');
                        event.preventDefault();
                        return false;
                    }

                    // Empecher un changement de form si une fenêtre est ouverte
                    if (HELPER.Form.isWindowOnScreen()) {
                        HELPER.Dialog.showInfoMessage('TXT_INFORMATION', 'TXT_FENETRE_PRESENT');
                        event.preventDefault();
                        return false;
                    }

                    // Empecher une redirection si un loading est en cours
                    if (HELPER.Form.isLoadingVisible() && toState.name.toLowerCase().indexOf('tdb') == 0 && fromState.name.toLowerCase().indexOf('tdb') == 0) {
                        HELPER.Dialog.showInfoMessage('TXT_INFORMATION', 'TXT_LOADING_PRESENT');
                        event.preventDefault();
                        return false;
                    }

                    // Si press back vers page de login on se deconnecte
                    if (HELPER.User.isAuthenticated() && toState.name == HELPER.ConfConst.LOGIN_STATE) {
                        HELPER.User.logout(true);
                        event.preventDefault();
                        return;
                    }

                    // Si tous va bien, mis en place pour la gestion de suppression des raccourcis clavier
                    if (event.currentScope && event.currentScope.$$childTail && event.currentScope.$$childTail.vm) {
                        var vm = event.currentScope.$$childTail.vm;

                        if (vm.onUnload)
                            vm.onUnload();
                    }

                }
            }
        });

        HELPER.Keyboard.addShortcut('backspace', null, function (evt) {
            if (["INPUT", "SELECT", "TEXTAREA"].indexOf(evt.target.tagName) == -1) {
                console.log('Backspace caught to not have return on browser - This avoid go back to previous page');
                evt.preventDefault();
            }
        });

        HELPER.Keyboard.addShortcut('ctrl+m', null,
            function (e) { e.preventDefault(); e.stopPropagation(); HELPER.Form.openWindow('MonitorConsultation'); }
            );

        HELPER.Keyboard.addShortcut('ctrl+shift+u', null,
			function (e) { e.preventDefault(); e.stopPropagation(); HELPER.Form.openWindow('ListeUtilisateursConnectes'); }
		);

        HELPER.Keyboard.addShortcut('ctrl+shift+1', null,
		  function (e) { e.preventDefault(); e.stopPropagation(); HELPER.Form.openWindow('ViewerText', TestService.getTestCompleteScript(), 'JSON'); }
		);

		
        HELPER.Keyboard.addShortcut('ctrl+l', null,
         function (e) {
             e.preventDefault();
             e.stopPropagation();

             var url = HELPER.Form.getExternalCallUrl(null, null, $rootScope.lastFormType, $rootScope.lastFormName, $rootScope.lastFormArgument, $rootScope.lastFormStateInformations);
             if (url)
                 HELPER.Dialog.showInfoMessage('GENERATEUR DE LIEN', url)
         }
         );


        $(window).on("unload", function (evt) {
            
            if (HELPER.User.isAuthenticated()) {
                var request = new XMLHttpRequest();
                request.open('POST', HELPER.Url.getUrlApiApplication('User', 'Disconnect'), false);  // `false` makes the request synchronous
                request.setRequestHeader('Content-Type', 'application/json');

                // Si on ne vient pas d'un appel externe nous devons sauvegarder les préférences.
                var pref = { preferences: null };
                if ($state.current.name != 'app.ExternalOpener')
                    pref = { preferences: HELPER.User.getUser().userPreferences };

                var res = request.send(HELPER.Utils.objectToJson(pref));

                if (ViewerService.loaded) {
                    request = new XMLHttpRequest();
                    request.open('POST', HELPER.Url.getUrlApiLocal(LocalService.conf.localHostName, LocalService.conf.localHostPort, 'Viewer', 'UnloadViewer'), false);  // `false` makes the request synchronous
                    request.setRequestHeader('Content-Type', 'application/json');
                    var res = request.send();
                }
            }
        });

    });

    //show loading while doing ajax
    appCommon
      .config(function ($httpProvider) {
          $httpProvider.interceptors.push('ajaxInterceptor');
      })
      .factory('ajaxInterceptor', function ($q, $rootScope, $injector, $templateCache, xaTranslation, ConfConst) {
          return {
          	'response': function (response) {

          		// on ne trace pas d'activité en cas de non chargement visible, sinon inactivité ne marche pas en prise de rdv et exploit à cause des setInterval.
          		if (response.config.headers && response.config.headers['x-noloading'] == true) {
          		}
          		else {
          			$rootScope.lastServerCall = new Date();
          		}

              	// Preprocessing des fichiers HTML pour remplacement des directives <xa-label>
                  if (response.config.url.indexOf('View') >= 0
                      && response.config.url.indexOf('html', response.config.url.length - 4) !== -1
                  ) {
                  	response.data = replaceInTemplace(response.data);
                  }

                  function replaceInTemplace(input) {
                  	var regex = /\<xa-label resource-key="(\w+)\"\>\<\/xa-label\>/g;

                  	return input.replace(regex, function upperToHyphenLower(str, match) {
                  		return '<div class="xaLabel">' + xaTranslation.instant(match) + '</div>';
                  	});
                  }

                  return response;
              },

              'responseError': function (rejection) {
                  if (rejection.status == 401) {
                      if (!$rootScope.HELPER.Utils.isEmpty(ConfConst.LOGIN_STATE))
                          $rootScope.HELPER.User.logout(true, true);
                      else
                          throw new Error("Un controller serveur possede l'attribut [authorize], hors cette application ne possede pas de page de login pour s'identifier.");
                  }
                  return $q.reject(rejection);
              }
          }
      });

    // toISOString is used for converting an object Date type to string,
    // before sending the value to the server.
    // This method prevents adding the current time zone information
    // in order for the date to correspond with the Unspecified zone on the server.
    Date.prototype.toISOString = function () {
        return moment(this).format('YYYY-MM-DDTHH:mm:ss');
    };

    // Disabling debug information prevents angular from attaching scope info do DOM element.
    // Use angular.reloadWithDebugInfo() if you need to use tools like Batarang.
    // See https://docs.angularjs.org/guide/production for details.
    appCommon.config(function ($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
    });

})();
