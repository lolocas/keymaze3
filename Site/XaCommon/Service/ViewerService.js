(function () {
    'use strict';

    angular.module('XaCommon').service('ViewerService', ViewerService);
    function ViewerService($q, $location, $http, $injector, ParametersService, UtilsHelper, ApiHelper, UrlHelper, LocalHelper, DialogHelper) {

        this.getLocalViewerConfiguration = getLocalViewerConfiguration;
        this.setLocalViewerConfiguration = setLocalViewerConfiguration;
        this.hasLocalViewerConfiguration = hasLocalViewerConfiguration;

        this.loadViewer = loadViewer;
        this.openViewerForExamen = openViewerForExamen;
        this.openViewerForPatient = openViewerForPatient;
        this.closeOpenedViewer = closeOpenedViewer;
        this.unloadViewer = unloadViewer;

        this.loaded = false;

        var ctx = this;

        function _openUrl(url, target) {
            if (target.toLowerCase() == '_hidden') {
                var iframe = $('#_hidden').get(0);
                if (!iframe)
                    $('<iframe id="_hidden" name="_hidden" style="height:0px;width:0px;border:0px;"></iframe>').appendTo("body");
            }
            UtilsHelper.openHtmlLinkFromUrl(url, target);
        }

        function _openViewerUrl(controller, method, param) {
            return ApiHelper.callApiApplication(controller, method, param).then(
                function openLink(resultTo) {
                    if (resultTo.validationErrors && resultTo.validationErrors.length > 0) {
                        DialogHelper.showErrorMessage('TXT_ERREUR', resultTo.validationErrors[0].message);
                    }
                    else {
                        if (resultTo.data.isMacOnly) {
                            if (UtilsHelper.startWith(navigator.platform.toUpperCase(), 'MAC'))
                                _openUrl(resultTo.data.url, resultTo.data.target);
                            else
                                DialogHelper.showErrorMessage('TXT_ERREUR', 'TXT_URL_MAC_ONLY');
                        }
                        else {
                            _openUrl(resultTo.data.url, resultTo.data.target);
                        }
                    }
                });
        }

        function _openViewerLocal(mode, controller, method, param) {
            return ApiHelper.callApiApplication(controller, method, param).then(
                function openViewer(resultTo) {
                    if (resultTo.validationErrors && resultTo.validationErrors.length > 0) {
                        DialogHelper.showErrorMessage('TXT_ERREUR', resultTo.validationErrors[0].message);
                    }
                    else {
                        ApiHelper.callApiLocal('Viewer', (mode == 'PATIENT' ? 'LoadHistory' : 'LoadStudy'), resultTo.data);
                    }
                });
        }


        function getLocalViewerConfiguration() {
            return ApiHelper.callApiLocal('Viewer', 'GetLocalViewerConfiguration');
        }

        function setLocalViewerConfiguration(xml) {
            return ApiHelper.callApiLocal('Viewer', 'SetLocalViewerConfiguration', (xml ? xml : "")).then(function () {
                unloadViewer();
            });
        }

        function hasLocalViewerConfiguration() {
            return ApiHelper.callApiLocal('Viewer', 'HasLocalViewerConfiguration');
        }


        function loadViewer() {
            if (!ctx.loaded) {
                return ApiHelper.callApiLocal('Viewer', 'LoadViewer').then(function () {
                    ctx.loaded = true;
                });
            }
            else {
                return UtilsHelper.emptyPromise();
            }
        }

        function openViewerForExamen(numexa) {
            if (ParametersService.getAppParameter("ApplicationModuleCode") == 'XAINTRANET') {
                _openViewerUrl("AppelExterne", "GetLienViewerForIntranet", numexa);
            }
            else {
                if (LocalHelper.isLocalHostConnected()) {
                    loadViewer().then(function () {
                        getLocalViewerConfiguration().then(function (xml) {
                            if (!UtilsHelper.isEmptyOrWhitespace(xml)) {
                                _openViewerLocal("EXAMEN", "AppelExterne", "GetViewerArgsExamenForXplore", { configuration: xml, id: numexa });
                            }
                            else {
                                _openViewerUrl("AppelExterne", "GetLienViewerExamenForXplore", numexa);
                            }
                        });
                    });
                }
                else {
                    _openViewerUrl("AppelExterne", "GetLienViewerExamenForXplore", numexa);
                }
            }
        }

        function openViewerForPatient(numdos) {
            if (LocalHelper.isLocalHostConnected()) {
                loadViewer().then(function () {
                    getLocalViewerConfiguration().then(function (xml) {
                        if (!UtilsHelper.isEmptyOrWhitespace(xml)) {
                            _openViewerLocal("PATIENT", "AppelExterne", "GetViewerArgsPatientForXplore", { configuration: xml, id: numdos });
                        }
                        else {
                            _openViewerUrl("AppelExterne", "GetLienViewerPatientForXplore", numdos);
                        }
                    });
                });
            }
            else {
                _openViewerUrl("AppelExterne", "GetLienViewerPatientForXplore", numdos);
            }
        }

        function closeOpenedViewer() {
            if (ctx.loaded)
                return ApiHelper.callApiLocal('Viewer', 'CloseOpenedViewer');
            else
                return UtilsHelper.emptyPromise();
        }

        function unloadViewer() {
            if (ctx.loaded) {
                return ApiHelper.callApiLocal('Viewer', 'UnloadViewer').then(function () {
                    ctx.loaded = false;
                });
            }
            else {
                return UtilsHelper.emptyPromise();
            }
        }
    };

})();