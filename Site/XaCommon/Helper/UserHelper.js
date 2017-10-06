(function () {
    'use strict';

    angular.module('XaCommon').service('UserHelper', UserHelper);

    function UserHelper($http, $q, $state, UtilsHelper, ArrayHelper, ParametersService, UserService, ConfConst) {
        var ctx = this;

        this.isAuthenticated = isAuthenticated;
        this.setPreference = setPreference;
        this.logout = logout;
        this.getUser = getUser;
        this.getCurrentSite = getCurrentSite;
        this.getSitesAutorises = getSitesAutorises;
        this.getPreference = getPreference;
        this.getAppParameter = getAppParameter;
        this.hasRight = hasRight;
        this.getNomPrenomUser = getNomPrenomUser;

        this.getAllowMenuOptions = getAllowMenuOptions;
        this.getDefaultMenuOption = getDefaultMenuOption;
        this.getInitialState = getInitialState;
        this.setInitialState = setInitialState;

        function getAllowMenuOptions(menuOptions) {
            return ArrayHelper.findFromFunction(menuOptions, function (item) {
                return (item.rightKey == undefined || hasRight(item.rightKey)) && (item.visibilityFn == undefined || item.visibilityFn(item, ctx));
            });
        }

        function getDefaultMenuOption(defaultOptionCode, menuOptions) {

            var defOption = ArrayHelper.findFirstFromFunction(menuOptions, function (item) {
                return item.code == defaultOptionCode && (item.rightKey == undefined || hasRight(item.rightKey)) && item.mode != 'WINDOW';
            });

            if (defOption != null)
                return defOption.code;

            var availableOptions = getAllowMenuOptions(menuOptions);
            if (availableOptions && availableOptions.length > 0) {
                var firstNonWindowOption = ArrayHelper.findFirstFromFunction(availableOptions, function (item) {
                    return item.mode != 'WINDOW' && item.mode != 'GROUP'
                });
                if (firstNonWindowOption != null)
                    return firstNonWindowOption.code;
            }
            return null;
        }

        function getInitialState() {
            var initialView = getPreference("INITIAL_STATE", '', ConfConst.DEFAULT_VIEW);

            if (!ConfConst.APPLICATION_MENU_OPTIONS)
                return initialView;

            return getDefaultMenuOption(initialView, ConfConst.APPLICATION_MENU_OPTIONS);
        }

        function setInitialState(stateName) {
            setPreference("INITIAL_STATE", "", stateName);
        }


        function hasRight(rightCode) {
            if (!UserService.authentificated) return false;

            if (UserService.user.userRights) {
                return (UserService.user.userRights.indexOf(rightCode) == -1);
            }
            else {
                return true;
            }
        }

        function getUser() {
            return UserService.user;
        };

        function getCurrentSite() {
            return UserService.user.identification.codeSiteCourant;
        };

        function getSitesAutorises() {
            return UserService.user.identification.codesSitesAutorises;
        };

        function isAuthenticated() {
            return UserService.authentificated;
        };

        function setPreference(rubrique, cle, valeur) {
            if (valeur != null && typeof valeur != "string")
                valeur = UtilsHelper.objectToJson(valeur);

            // Suppression valeur precedente
            var item = _.find(UserService.user.userPreferences.preferences, function (item)
            { return item.typeUtilisateur == 'U' && rubrique == item.codeRubrique && cle == item.codeCle; });

            if (item != null) {
                // Si vide on supprime la valeur
                if (UtilsHelper.isEmptyOrWhitespace(valeur))
                    ArrayHelper.removeItem(UserService.user.userPreferences.preferences, item);
                else
                    item.valeur = valeur;
            }
                // Si valeur non vide on ajouter
            else if (!UtilsHelper.isEmptyOrWhitespace(valeur)) {
                UserService.user.userPreferences.preferences.push({
                    codeModule: UserService.user.userPreferences.applicationModuleCode,
                    codeRubrique: rubrique,
                    codesSites: 'ALL',
                    typeUtilisateur: 'U',
                    codeUtilisateur: UserService.user.userPreferences.codeUtilisateur,
                    codeCle: cle,
                    valeur: valeur
                });


            }
        }

        function getPreference(rubrique, cle, defaultValue, optIsProfilPreference) {
            var typePreference = optIsProfilPreference ? 'P' : 'U';
            var pref = _.find(UserService.user.userPreferences.preferences, function (item)
            { return item.typeUtilisateur == typePreference && rubrique == item.codeRubrique && cle == item.codeCle; });

            if (pref) {
                if (!UtilsHelper.isEmptyOrWhitespace(pref.valeur) && (UtilsHelper.startWith(pref.valeur, '[') || UtilsHelper.startWith(pref.valeur, '{'))) {
                    var valeur = UtilsHelper.jsonToObject(pref.valeur);
                    return valeur;
                }
                else {
                    return pref.valeur;
                }
            }
            else
                return defaultValue;
        }

        function getAppParameter(key, defaultValue) {
            return ParametersService.getAppParameter(key, defaultValue);
        }

        function logout(redirectToLogin, showTimeOutMessage) {
            return UserService.logout(redirectToLogin, showTimeOutMessage);
        }

        function getNomPrenomUser() {
            return;
            if (UserService.user.identification && UserService.user.identification.utilisateur) {
                if (!UtilsHelper.isEmptyOrWhitespace(UserService.user.identification.utilisateur.nom)) {
                    return UserService.user.identification.utilisateur.nom;
                }
                else {
                    return UserService.user.identification.utilisateur.nomPersonne + ' ' + UserService.user.identification.utilisateur.prenomPersonne
                        + ' (' + UserService.user.identification.utilisateur.profilUtilisateur + ',' + UserService.user.identification.utilisateur.qualificationAgent + ')';
                }
            }
            else if (UserService.user.utilisateur) {
                return UserService.user.utilisateur.nomPersonne + ' ' + UserService.user.utilisateur.prenomPersonne
            }
            else {
                return '';
            }
        }
    };


})();