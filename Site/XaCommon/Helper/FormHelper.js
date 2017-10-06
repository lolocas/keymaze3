(function () {
    'use strict';

    angular.module('XaCommon').service('FormHelper', FormHelper)

    function FormHelper($injector, $rootScope, $timeout, $location, $q, xaWindow, DialogHelper, UserHelper, UtilsHelper, FormParamModel, ArrayHelper, ConfConst, ApiHelper, ResultTo, $state, SearchboxTo, xaLoadingService, UserService, ProfilerService, LocalService) {

        this.setModalParam = setModalParam;
        this.closeAllWindows = closeAllWindows;
        this.showErrorDialogFromResultTo = showErrorDialogFromResultTo;
        this.getCurrentMainScreenName = getCurrentMainScreenName;

        this.openMainScreenWithOpts = openMainScreenWithOpts;
        this.openMainScreen = openMainScreen;
        this.openWindow = openWindow;
        this.openTooltip = openTooltip;
        this.openTooltipWithOpts = openTooltipWithOpts;
        this.openWindowWithOpts = openWindowWithOpts;
        this.openWindowFromTdb = openWindowFromTdb;


        this.closeFormWithSuccess = closeFormWithSuccess;
        this.closeFormWithCancel = closeFormWithCancel;
        this.closeFormWithResult = closeFormWithResult;
        this.closeTooltip = closeTooltip;
        this.closeWindowFromContainerId = closeWindowFromContainerId;
        this.addCustomActionOnVignette = addCustomActionOnVignette;

        this.resetValueIfNotInDataSource = resetValueIfNotInDataSource;
        this.getCopySearchboxValue = getCopySearchboxValue;
        this.getExternalCallUrl = getExternalCallUrl;

        this.controlParam = controlParam;
        this.controlParamInList = controlParamInList;
        this.controlParamMandatory = controlParamMandatory;

        this.initializeWindowOptions = initializeWindowOptions;
        this.getCurrentWindowOptions = getCurrentWindowOptions;

        this.addButtonInWindowHeader = addButtonInWindowHeader;

        this.doTdbPrint = doTdbPrint;
        this.doTdbActionWithSimpleConfirmation = doTdbActionWithSimpleConfirmation;
        this.doTdbActionWithAdvancedConfirmation = doTdbActionWithAdvancedConfirmation;
        this.doTdbAction = doTdbAction;

        this.doWinPrint = doWinPrint;
        this.doWinActionWithSimpleConfirmation = doWinActionWithSimpleConfirmation;
        this.doWinActionWithAdvancedConfirmation = doWinActionWithAdvancedConfirmation;
        this.doWinAction = doWinAction;

        this.isLoadingVisible = isLoadingVisible;
        this.isWindowOnScreen = isWindowOnScreen;

        this.addClientValidationError = addClientValidationError;
        this.addClientValidationErrors = addClientValidationErrors;

        function isLoadingVisible() {
            return xaLoadingService.isVisible();
        }

        function isWindowOnScreen() {
            return xaWindow.isWindowOpened();
        }

        function getCurrentMainScreenName() {
            return $state.current.name;
        }

        function initializeWindowOptions(vm, dataSourceOptions, rubriquePreference, visibilityFn) {
            vm.validateOptions = dataSourceOptions;
            vm.validateOptionsSelected = UserHelper.getPreference(rubriquePreference, 'VALIDATEOPTIONS', '');
            vm.validateOptionsRubriquePreference = rubriquePreference;
            vm.validateVisibilityFn = (visibilityFn == undefined ? function () { return true; } : visibilityFn);
        }

        function getCurrentWindowOptions(vm) {
            // Si pas visible on retourne false
            if (vm.validateVisibilityFn && vm.validateVisibilityFn() === false)
                return [];

            UserHelper.setPreference(vm.validateOptionsRubriquePreference, 'VALIDATEOPTIONS', vm.validateOptionsSelected);
            if (UtilsHelper.isEmpty(vm.validateOptionsSelected))
                return [];
            else
                return vm.validateOptionsSelected.split(',');
        }

        function addButtonInWindowHeader(vm, img, title, applyFn, visibilityFn, rightKey) {
            if (vm.extraActions == null) vm.extraActions = [];
            vm.extraActions.push({ img: img, visibilityFn: visibilityFn, applyFn: applyFn, title: title, rightKey: rightKey });
        }


        this.onViewLoaded = onViewLoaded;
        function onViewLoaded(func) {
            $timeout(
                func
                , 0, false);
        }


        function closeAllWindows() {
            xaWindow.closeAll();
        }

        function closeWindowFromContainerId(name) {
        	xaWindow.closeWindowFromContainerId(name);
        }

        

        function controlParamInList(formParameter, parameterName, value, possibleValues) {
            if (!value || !ArrayHelper.contains(possibleValues, value))
                throw new Error("Le paramètre " + parameterName + " possède une valeur inattendu (" + value + "), les valeurs possibles sont " + possibleValues.toString());

            formParameter[parameterName] = value;
        }

        function controlParamMandatory(formParameter, parameterName, value) {
            if (UtilsHelper.isUndefined(value)) {
                throw new Error("Le paramètre " + parameterName + " est obligatoire mais n'est pas transmis à la fenêtre");
            }
            formParameter[parameterName] = value;
        }

        function controlParam(formParameter, parameterName, value) {
            formParameter[parameterName] = value;
        }


        function getCopySearchboxValue(value) {
            return new SearchboxTo(value);
        }

        function setModalParam(value) {
            return function () { return value; };
        };

        function resetValueIfNotInDataSource(parentValue, model, propertyName, datatSource, dataSourceCode) {

            var hasModified = false;
            // Desactivation ancienne valeur si ancienne version absente
            if (!UtilsHelper.isEmpty(model[propertyName]) && ArrayHelper.findFirstFromProperty(datatSource, dataSourceCode, model[propertyName]) == null) {
                model[propertyName] = '';
                hasModified = true;
            }

            // Saisi automatique de valeur si un seul choix
            if (datatSource.length == 1
                && UtilsHelper.isEmpty(model[propertyName])
                && !UtilsHelper.isEmpty(parentValue)) {
                model[propertyName] = datatSource[0][dataSourceCode];
                hasModified = true;
            }

            return hasModified;
        }



        function addCustomActionOnVignette(vigParam, id, clickFn, visibilityFn, img, resourceKey) {
            if (UtilsHelper.isUndefined(vigParam))
                throw new Error("Merci de passer une instance d'objet à la méthode addCustomActionOnVignette")

            if (UtilsHelper.isUndefined(vigParam.customActions))
                vigParam.customActions = [];

            vigParam.customActions.push({ id: id, clickFn: clickFn, visibilityFn: visibilityFn, img: img, resourceKey: resourceKey });
        }





        function getExternalCallUrl(login, pwd, formType, formName, formArgument, formExtraInformation) {
            if (!formType)
                return;

            var username = '';
            var password = '';
            if (login && pwd) {
                username = login;
                password = pwd;
            }
            else if (UserService.user && UserService.user.identification) {

                username = UserService.user.identification.nativeUsername;
                password = UserService.user.identification.nativePassword;
            }

            var param1 = '';
            var param2 = '';
            var param3 = '';
            var param4 = '';
            var param5 = '';
            if (formArgument) {
                param1 = formArgument.length > 0 ? UtilsHelper.paramToString(formArgument[0]) : '';
                param2 = formArgument.length > 1 ? UtilsHelper.paramToString(formArgument[1]) : '';
                param3 = formArgument.length > 2 ? UtilsHelper.paramToString(formArgument[2]) : '';
                param4 = formArgument.length > 3 ? UtilsHelper.paramToString(formArgument[3]) : '';
                param5 = formArgument.length > 4 ? UtilsHelper.paramToString(formArgument[4]) : '';
            }

            var parameterPart = '?login=' + username + '&pwd=' + password + '&name=' + formName + '&target=' + formType +
				'&param1=' + param1 +
				(UtilsHelper.isEmptyOrWhitespace(param2) ? '' : '&param2=' + param2) +
				(UtilsHelper.isEmptyOrWhitespace(param3) ? '' : '&param3=' + param3) +
				(UtilsHelper.isEmptyOrWhitespace(param4) ? '' : '&param4=' + param4) +
				(UtilsHelper.isEmptyOrWhitespace(param5) ? '' : '&param5=' + param5);

            ArrayHelper.forEach(UtilsHelper.objGetKeys(formExtraInformation), function (key) {
                if (!UtilsHelper.isEmpty(formExtraInformation[key]))
                    parameterPart += "&" + key + "=" + formExtraInformation[key];
            });

            var viewPart = '#/ExternalOpener';
            var url
            url = UserHelper.getAppParameter('ApplicationUrlPart') + '/' + viewPart + parameterPart;
            //else
            //    url = parameterPart + viewPart;

            return 'http://' + $location.$$host + ":" + $location.$$port + '/' + url;

        }


        function openMainScreen(stateName, param1, param2) {
            ProfilerService.addScreen('openMainScreen', 'MainScreen', stateName, { param1: param1, param2: param2 });
            $state.go(stateName, { param1: param1, param2: param2 }); // pour passer en mode url unique { location: false }
        }


        function openMainScreenWithOpts(stateName, opts, param1, param2) {
            ProfilerService.addScreen('openMainScreenWithOpts', 'MainScreen', stateName, { param1: param1, param2: param2 });
            $state.go(stateName, { param1: param1, param2: param2 }, opts);
        }



        function _RunValiderVerrou(verrouInfo) {
            var defVerrou = $q.defer();

            ApiHelper.callApiApplication('Verrou', verrouInfo.onlyRead == true ? 'ConsultVerrou' : 'GetVerrou', verrouInfo, ResultTo).then(
                function DoConfirmer(resultTo) {
                    // Si nous sommes dans une window
                    var validationOK = false;
                    validationOK = showErrorDialogFromResultTo(resultTo);

                    if (!validationOK)
                        defVerrou.reject(resultTo);
                    else {

                        // Gestion du message de confirmation
                        if (resultTo.hasConfirmationMessages()) {
                            DialogHelper.showConfirmMessagePromise(UtilsHelper.getLabel('TXT_CONFIRMATION'), resultTo.getConfirmationMessages()).then(function (result) {
                                if (result === true) {
                                    ApiHelper.callApiApplication('Verrou', 'ForceVerrou', verrouInfo, ResultTo).then(
                                        function () { defVerrou.resolve(resultTo) },
                                        function () { defVerrou.reject(resultTo) }
                                    );
                                }
                                else {
                                    defVerrou.reject(resultTo);
                                }
                            });
                        }
                        else {
                            defVerrou.resolve(resultTo);
                        }
                    }

                });
            return defVerrou.promise;
        }


        function _OuvertureWindow(windowOpenerObj, windowParam, overloadParam) {
            var windowConf = windowOpenerObj.getWindowOptions.apply(windowOpenerObj, windowParam);

            if (!UtilsHelper.isUndefined(overloadParam)) {
                var properties = UtilsHelper.objGetKeys(overloadParam);
                ArrayHelper.forEach(properties, function (key) { windowConf[key] = overloadParam[key] });
            }

            var window = xaWindow.open(windowConf);
            return window.result;
        }

        function _ReleaseVerrou(verrouConf, resultToFromCaller) {
            var defReleaseVerrou = $q.defer();

            if (verrouConf.releaseFromServerIfSuccess == true && resultToFromCaller && resultToFromCaller.success == true) {
                defReleaseVerrou.resolve(resultToFromCaller);
            }
            else {
                ApiHelper.callApiApplication('Verrou', 'ReleaseVerrou', verrouConf, ResultTo)
                    .then(function (resultTo) {
                        defReleaseVerrou.resolve(resultToFromCaller || resultTo)
                    },
                    function () {
                        DialogHelper.showErrorMessage('TXT_ERREUR', 'TXT_ERREUR_LIBERATION_VERROU');
                        defReleaseVerrou.resolve(resultToFromCaller || resultTo)
                    }
                 );
            }

            return defReleaseVerrou.promise;
        }

        function _openWindowAdvanced(formName, windowParam, overloadParam) {
            var def = $q.defer();
            def.resolve(true);

            var promise = def.promise;
            var windowOpener = $injector.get(formName + 'WindowOpener');

            // Contrôle d'authorisation des formes anonymes
            if (UserHelper.getUser() && UserHelper.getUser().identification && UserHelper.getUser().identification.isAnonymousUser === true)
                promise = promise.then(function () { return _RunControlAnonyme(windowOpener.allowAnonymous) });


            // Application vérification host local nécessaire
            if (UtilsHelper.isFunction(windowOpener.getHostLocalRequired)) {
                promise = promise.then(function () { return _RunInitialControlHostLocal(windowOpener.getHostLocalRequired.apply(windowOpener, windowParam)) });
            }


            // Application message confirmation simple
            if (UtilsHelper.isFunction(windowOpener.getSimpleConfirmation)) {
                promise = promise.then(function () { return _RunInitialConfirmer(windowOpener.getSimpleConfirmation.apply(windowOpener, windowParam)) });
            }

            // Application message confirmation avancée
            if (UtilsHelper.isFunction(windowOpener.getAdvancedConfirmation)) {
                var infoValidation = windowOpener.getAdvancedConfirmation.apply(windowOpener, windowParam);
                if (infoValidation != null && !UtilsHelper.isEmpty(infoValidation.serviceName))
                    promise = promise.then(function () { return _RunValider(infoValidation.serviceName, infoValidation.methodName, infoValidation.data) });
            }

            // Application message confirmation avancée
            var verrouInformation = null;
            if (UtilsHelper.isFunction(windowOpener.getVerrouInformation)) {
                var verrouInformation = windowOpener.getVerrouInformation.apply(windowOpener, windowParam);
                if (verrouInformation != null && !UtilsHelper.isEmpty(verrouInformation.nomVerrou))
                    promise = promise.then(function () { return _RunValiderVerrou(verrouInformation) });
            }

            // Ouverture fenêtre
            promise = promise.then(function () { return _OuvertureWindow(windowOpener, windowParam, overloadParam) });


            // Libération du verrou
            if (verrouInformation != null && verrouInformation.onlyRead != true) {
                promise = promise.then(function (resultTo) { return _ReleaseVerrou(verrouInformation, resultTo) });
            }

            return promise;

        }


        function openWindow(formName) {
            ProfilerService.addScreen('openWindow', 'WindowDefault', formName, Array.prototype.slice.call(arguments, 1));
            return _openWindowAdvanced(formName, Array.prototype.slice.call(arguments, 1));
        }

        function openWindowWithOpts(formName, overloadParam) {
            ProfilerService.addScreen('openWindowWithOpts', 'WindowExternal', formName, Array.prototype.slice.call(arguments, 2));
            return _openWindowAdvanced(formName, Array.prototype.slice.call(arguments, 2), overloadParam);
        }

        function openTooltip(formName, cssPosName) {
            return _openWindowAdvanced(formName, Array.prototype.slice.call(arguments, 2), { windowMode: 'tooltip', relativeElem: cssPosName, showLoadingOnInit: false });
        }

        function openTooltipWithOpts(formName, cssPosName, tooltipOpts) {
            return _openWindowAdvanced(formName, Array.prototype.slice.call(arguments, 3), _.extend(tooltipOpts, { windowMode: 'tooltip', relativeElem: cssPosName, showLoadingOnInit: false }));
        }

        function openWindowFromTdb(tdbManager, formName) {
           // var def = $q.defer();

            ProfilerService.addScreen('openWindowFromTdb', 'WindowDefault', formName, Array.prototype.slice.call(arguments, 2));

            return _openWindowAdvanced(formName, Array.prototype.slice.call(arguments, 2), null).then(
                function (resultTo) {
                	return _RunReloadTdb(resultTo, tdbManager, formName);
                	/* if (resultTo.success == true) {
                    	
						 def.resolve(resultTo);
                    }
                    else {
                        def.resolve(resultTo);
                    }*/
                });

           // return def.promise;
        }

        function closeFormWithResult(vm, result) {
            vm.closeForm(result, new ResultTo(result));
        }

        function closeFormWithCancel(vm) {
            vm.closeForm(new ResultTo({ success: false }));
        }

        function closeFormWithSuccess(vm, data) {
            vm.closeForm(new ResultTo({ success: true, data: data }));
        }

        function closeTooltip(vm) {
            //vm.close();
            closeFormWithCancel(vm);
        }

        function addClientValidationError(vm, message, controlID) {
            if (vm && vm.refreshValidation)
                vm.refreshValidation([{ controlID: controlID, message: UtilsHelper.getLabel(message) }]);
        }

        function addClientValidationErrors(vm, messages) {
            if (vm && vm.refreshValidation)
                vm.refreshValidation(messages);
        }


        function _RunControlAnonyme(allowAnonymousFlag) {

            var defControlAnonyme = $q.defer();

            if (UserHelper.getUser() && UserHelper.getUser().identification && UserHelper.getUser().identification.isAnonymousUser && ConfConst.ANONYMOUS_APPLICATION != true && allowAnonymousFlag != true) {
                DialogHelper.showInfoMessage('TXT_INFORMATION', 'TXT_DROIT_ANONYME');
                defControlAnonyme.reject(false);
            }
            else {
                defControlAnonyme.resolve(true);
            }

            return defControlAnonyme.promise;
        }

        function _RunInitialControlHostLocal(value) {


            var defInitialControlHostLocal = $q.defer();

            if (value === true && LocalService.isLocalHostConnected() != true) {
                DialogHelper.showErrorMessage('TXT_ERREUR', 'TXT_HOSTLOCAL_NECESSAIRE');
                defInitialControlHostLocal.reject(false);
            }
            else {
                defInitialControlHostLocal.resolve(true);
            }

            return defInitialControlHostLocal.promise;
        }



        function _RunInitialConfirmer(message) {


            var defInitialConfirmer = $q.defer();

            if (!UtilsHelper.isEmpty(message)) {
                DialogHelper.showConfirmMessagePromise(UtilsHelper.getLabel('TXT_CONFIRMATION'), message).then(function (result) {
                    if (result === true)
                        defInitialConfirmer.resolve(true);
                    else
                        defInitialConfirmer.reject(false);
                });
            }
            else {
                defInitialConfirmer.resolve(true);
            }

            return defInitialConfirmer.promise;
        }


        function _RunValider(serviceName, methodValidateName, data, context) {
            var defValider = $q.defer();

            ApiHelper.callApiApplication(serviceName, methodValidateName, data, ResultTo).then(
                function DoConfirmer(resultTo) {
                    // Si nous sommes dans une window
                    var validationOK = false;
                    if (context && context.refreshValidation)
                        validationOK = context.refreshValidation(resultTo.validationErrors);
                    else
                        validationOK = showErrorDialogFromResultTo(resultTo);

                    if (!validationOK)
                        defValider.reject(resultTo);
                    else {

                        // Gestion du message de confirmation
                        if (resultTo.hasConfirmationMessages()) {
                            DialogHelper.showConfirmMessagePromise(UtilsHelper.getLabel('TXT_CONFIRMATION'), resultTo.getConfirmationMessages()).then(function (result) {
                                if (result === true) {
                                    defValider.resolve(resultTo);
                                }
                                else {
                                    resultTo.success = false;
                                    defValider.reject(resultTo);
                                }
                            });
                        }
                        else {
                            defValider.resolve(resultTo);
                        }
                    }

                });
            return defValider.promise;
        }

        function _RunSauvegarder(serviceName, methodSaveName, data, context) {
            var defSauvegarder = $q.defer();
            ApiHelper.callApiApplication(serviceName, methodSaveName, data, ResultTo).then(
                function DoSauvegarder(resultTo) {
                    // Si nous sommes dans une window
                    var validationOK = false;
                    if (context.refreshValidation)
                        validationOK = context.refreshValidation(resultTo.validationErrors);
                    else
                        validationOK = showErrorDialogFromResultTo(resultTo);

                    if (validationOK)
                        defSauvegarder.resolve(resultTo);
                    else
                        defSauvegarder.reject(resultTo);

                },
				function CancelSave() {
				    var resultTo = new ResultTo({ success: false, processErrors: { id: 'GENERAL', message: resultTo ? resultTo.ExceptionMessage : 'Erreur revenu dans le FormHelper depuis le serveur.' } });
				    defSauvegarder.reject(resultTo);
				});

            return defSauvegarder.promise;
        }

        function _RunReloadTdb(resultTo, tdbManager, formName) {
            var defTdbReload = $q.defer();

            if (resultTo != null) {
            	var critAndKey = tdbManager.tdbModel.getCriteriaAndFieldKeyFromScreen ? tdbManager.tdbModel.getCriteriaAndFieldKeyFromScreen(formName) : undefined;
				tdbManager.applyTdbItemReloadAndFocus(resultTo, critAndKey ? critAndKey.criteria : undefined, critAndKey ? critAndKey.field : undefined);
				defTdbReload.resolve(resultTo);
            	// tdbManager.applyTdbItemReloadAndFocus(resultTo);
            }
            else
            	defTdbReload.reject(resultTo);

            //if (resultTo != null /*&& resultTo.success == true*/)
                
            return defTdbReload.promise;

        }

        function _CloseWindow(context, resultTo, closeForm) {
            var defCloseWindow = $q.defer();
            if (context.closeForm && (UtilsHelper.isUndefined(closeForm) || closeForm == true))
                closeFormWithResult(context, resultTo);

            defCloseWindow.resolve(resultTo);

            return defCloseWindow.promise;

        }

        function showErrorDialogFromResultTo(resultTo) {
            if (resultTo.hasErrorMessages()) {
                DialogHelper.showErrorMessage(UtilsHelper.getLabel('TXT_ERREUR'), resultTo.getErrorMessages());
                return false;
            }
            else {
                return true;
            }
        }





        function doWinPrint(vm, controllerName, methodName, data, printAfterMethodName, printAfterParameter, closeForm, extraOpts) {
            if (UtilsHelper.isUndefined(extraOpts))
                extraOpts = {};

            extraOpts.printAfterMethodName = printAfterMethodName;
            extraOpts.printAfterParameter = printAfterParameter;

            return doWinAction(vm, controllerName, methodName, data, closeForm, extraOpts);
        }


        function doWinActionWithSimpleConfirmation(vm, controllerName, methodName, data, initialConfirmMessage, closeForm, extraOpts) {
            if (UtilsHelper.isUndefined(extraOpts))
                extraOpts = {};

            extraOpts.initialConfirmMessage = initialConfirmMessage;

            return doWinAction(vm, controllerName, methodName, data, closeForm, extraOpts);
        }


        function doWinActionWithAdvancedConfirmation(vm, controllerName, methodValidateName, methodSaveName, data, closeForm, extraOpts) {
            if (UtilsHelper.isUndefined(extraOpts))
                extraOpts = {};

            extraOpts.methodValidateName = methodValidateName;

            return doWinAction(vm, controllerName, methodSaveName, data, closeForm, extraOpts);
        }


        function doWinAction(vm, controllerName, methodName, data, closeForm, extraOpts) {
            if (UtilsHelper.isUndefined(extraOpts))
                extraOpts = {};
            extraOpts.closeForm = closeForm;

            return doAction(vm, controllerName, methodName, data, extraOpts);
        }




        function doTdbPrint(tdbManager, controllerName, methodName, data, printAfterMethodName, printAfterParameter, extraOpts) {
            if (UtilsHelper.isUndefined(extraOpts))
                extraOpts = {};

            extraOpts.printAfterMethodName = printAfterMethodName;
            extraOpts.printAfterParameter = printAfterParameter;

            return doTdbAction(tdbManager, controllerName, methodName, data, extraOpts);
        }


        function doTdbActionWithSimpleConfirmation(tdbManager, controllerName, methodName, data, initialConfirmMessage, extraOpts) {
            if (UtilsHelper.isUndefined(extraOpts))
                extraOpts = {};

            extraOpts.initialConfirmMessage = initialConfirmMessage;

            return doTdbAction(tdbManager, controllerName, methodName, data, extraOpts);
        }


        function doTdbActionWithAdvancedConfirmation(tdbManager, controllerName, methodValidateName, methodSaveName, data, extraOpts) {
            if (UtilsHelper.isUndefined(extraOpts))
                extraOpts = {};

            extraOpts.methodValidateName = methodValidateName;

            return doTdbAction(tdbManager, controllerName, methodSaveName, data, extraOpts);
        }

        function doTdbAction(tdbManager, controllerName, methodName, data, extraOpts) {
            return doAction(tdbManager, controllerName, methodName, data, extraOpts);
        }



        function doAction(context, controllerName, methodSaveName, data, opts) {
            var initialConfirmMessage = opts ? opts.initialConfirmMessage : undefined;
            var methodValidateName = opts ? opts.methodValidateName : undefined;
            var printAfterControllerName = opts ? opts.printAfterControllerName : undefined;
            var printAfterMethodName = opts ? opts.printAfterMethodName : undefined;
            var printAfterParameter = opts ? opts.printAfterParameter : undefined;
            var closeForm = opts ? opts.closeForm : undefined;
     

            var defGeneral = $q.defer();

            var promiss = _RunInitialConfirmer(initialConfirmMessage);

            // Déclenchement de la méthode de validation
            if (!UtilsHelper.isEmpty(methodValidateName))
                promiss = promiss.then(function () { return _RunValider(controllerName, methodValidateName, data, context) });

            // Déclenchement de la méthode de sauvegarde
            promiss = promiss.then(function (resultTo) { return _RunSauvegarder(controllerName, methodSaveName, data, context); });

            // Fermer fenêtre
            if (context.closeForm) {
                var functionFermetureFenetre = function (resultTo) {
                    if (resultTo.afterValidate == true)
                        return _CloseWindow(context, resultTo, closeForm);
                    else {
                        var defClose = $q.defer();
                        defClose.reject(resultTo);
                        return defClose.promise;

                    }
                };

                promiss = promiss.then(functionFermetureFenetre, functionFermetureFenetre);
            }

            // Maj tableau de bord que sur tdb
            if (context.tdbModel)
            	promiss = promiss.then(function (resultTo) { return _RunReloadTdb(resultTo, context, methodSaveName) }, function (resultTo) { return _RunReloadTdb(resultTo, context, methodSaveName) });

            promiss = promiss.then(function (resultTo) {
                defGeneral.resolve(resultTo)
            }, function (resultTo) {
                defGeneral.reject(resultTo)
            });

            return defGeneral.promise;
        };





    }

})();
