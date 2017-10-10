(function () {
    'use strict';

    angular.module('Keymaze')
        .service('PerformanceWindowOpener', PerformanceWindowOpener);

    function PerformanceWindowOpener(HELPER) {

        this.getWindowOptions = function (performance, mode) {

            var paramForm = {};
            HELPER.Form.controlParamInList(paramForm, "mode", mode, ['CREATE', 'EDIT']);

            return {
                id: 'Performance',
                templateUrl: 'View/Performance/Performance-View.html',
                controller: 'PerformanceController as vm',
                width: '800px', height: '380px', windowMode: 'modal-gray',
                resolve: {
                    performanceParam: HELPER.Form.setModalParam(performance),
                    formParam: HELPER.Form.setModalParam(paramForm)
                }
            };
        }
    }

    angular.module('Keymaze')
        .factory('PerformanceFormModel', PerformanceFormModel);

    function PerformanceFormModel(HELPER, GridConfigModel, GridColumnModel, KeymazeHelper) {
        function PerformanceFormModel(performanceParam, formParam) {

            var formModel = this;

            this.performance = performanceParam;
            this.mode = formParam.mode;

            this.formatTemps = '';
            if (formModel.performance.k_temps) {
                formModel.formatTemps = KeymazeHelper.formatTime(formModel.performance.k_temps);
                if (formModel.performance.k_distance)
                    formModel.performance.k_vitmoy = KeymazeHelper.vitesseMoyenne(formModel.performance.k_distance, formModel.performance.k_temps);
            }

            this.listeSports = null;
            this.listeLieux = null;
            this.listeSousLieux = null;
            this.listeTotalSousLieux = null;
            this.listeTypePerformances = null;

            this.gridSport = new GridConfigModel({
                height: '300px',
                datasource: function () { return formModel.listeSports },
                uniqueKey: 'p_primaire',
                sortInfo: [{ field: 'p_sport', direction: 'asc' }],
                hideDefaultHeaderButtons: true,
                columnDefs: [ new GridColumnModel({ field: 'p_sport', displayName: 'Sport' })]
            });

            this.gridLieu = new GridConfigModel({
                height: '300px',
                datasource: function () { return formModel.listeLieux },
                uniqueKey: 'l_primaire',
                sortInfo: [{ field: 'l_lieu', direction: 'asc' }],
                hideDefaultHeaderButtons: true,
                columnDefs: [new GridColumnModel({ field: 'l_lieu', displayName: 'TXT_LIEU' })]
            });
            this.gridSousLieu = new GridConfigModel({
                height: '150px',
                datasource: function () { return formModel.listeSousLieux },
                uniqueKey: 's_primaire',
                sortInfo: [{ field: 's_lieu', direction: 'asc' }],
                hideDefaultHeaderButtons: true,
                columnDefs: [new GridColumnModel({ field: 's_lieu', displayName: 'TXT_SOUSLIEU' })]
            });
            this.gridType = new GridConfigModel({
                height: '150px',
                datasource: function () { return formModel.listeTypePerformances },
                uniqueKey: 't_primaire',
                sortInfo: [{ field: 't_type', direction: 'asc' }],
                hideDefaultHeaderButtons: true,
                columnDefs: [new GridColumnModel({ field: 't_type', displayName: 'TXT_TYPE' })]
            });

        }
        return PerformanceFormModel;
    };


    angular.module('Keymaze')
        .controller('PerformanceController', PerformanceController);

    function PerformanceController(HELPER, PerformanceFormModel, performanceParam, formParam, KeymazeHelper) {
        var vm = this;

        vm.formModel = new PerformanceFormModel(performanceParam, formParam);
        vm.closeFn = closeFn;
        vm.validateFn = validateFn;

        vm.tempsChange = tempsChange;
        vm.formatTempsChange = formatTempsChange;
        vm.distanceChange = distanceChange;

        HELPER.Grid.setRowSelectedAction(vm.formModel.gridLieu, _applySelectionLieu);

        load();

        function load() {
            HELPER.Api.callApiLocal('Local', 'GetInfoPerformance')
            .then(function (result) {
                vm.formModel.listeSports = result.listeSports;
                HELPER.Grid.refreshGridDisplay(vm.formModel.gridSport);
                vm.formModel.listeLieux = result.listeLieux;
                HELPER.Grid.refreshGridDisplay(vm.formModel.gridLieu);
                vm.formModel.listeTotalSousLieux = result.listeSousLieux;
                vm.formModel.listeTypePerformances = result.listeTypePerformances;
                if (vm.formModel.mode == 'EDIT') {
                    HELPER.Grid.setSelectedItemFromKey(vm.formModel.gridSport, vm.formModel.performance.k_Key_Sport);
                    HELPER.Grid.setSelectedItemFromKey(vm.formModel.gridLieu, vm.formModel.performance.k_Key_Lieu);
                    HELPER.Grid.setSelectedItemFromKey(vm.formModel.gridSousLieu, vm.formModel.performance.k_Key_Souslieu);
                    HELPER.Grid.setSelectedItemFromKey(vm.formModel.gridType, vm.formModel.performance.k_Key_Type);
                }
            });
        }

        function closeFn() {
            HELPER.Form.closeFormWithCancel(vm);
        };

        function validateFn() {
            var selectSport = HELPER.Grid.getSelectedItem(vm.formModel.gridSport);
            if (selectSport)
                vm.formModel.performance.k_Key_Sport = selectSport.p_primaire;

            var selectLieu = HELPER.Grid.getSelectedItem(vm.formModel.gridLieu);
            if (selectLieu)
                vm.formModel.performance.k_Key_Lieu = selectLieu.l_primaire;

            var selectSousLieu = HELPER.Grid.getSelectedItem(vm.formModel.gridSousLieu);
            if (selectSousLieu)
                vm.formModel.performance.k_Key_Souslieu = selectSousLieu.s_primaire;
            else
                vm.formModel.performance.k_Key_Souslieu = 0;

            var selectType = HELPER.Grid.getSelectedItem(vm.formModel.gridType);
            if (selectType)
                vm.formModel.performance.k_Key_Type = selectType.t_primaire;
            else
                vm.formModel.performance.k_Key_Type = 0;

            if (vm.formModel.performance.k_gps) {
                var l_objGSP = vm.formModel.performance.k_gps.split(';');
                while (true) {
                    l_objGSP = reduceGPSPoint(l_objGSP);
                    if (l_objGSP.length < 1000)
                        break;
                }
                vm.formModel.performance.k_gps = l_objGSP.join(';');
            }

            if (vm.formModel.mode == 'CREATE') {
                HELPER.Api.callApiLocal('Local', 'InsertPerformance', vm.formModel.performance)
                .then(function (result) {
                    HELPER.Form.closeFormWithSuccess(vm);
                });
            }
            else if (vm.formModel.mode == 'EDIT') {
                HELPER.Api.callApiLocal('Local', 'UpdatePerformance', vm.formModel.performance)
                .then(function (result) {
                    HELPER.Form.closeFormWithSuccess(vm);
                });
            }
        };

        function _applySelectionLieu(row) {
            if (row && row.l_primaire) {
                vm.formModel.listeSousLieux = HELPER.Array.findFromProperty(vm.formModel.listeTotalSousLieux, 's_key_lieu', row.l_primaire);
                HELPER.Grid.refreshGridDisplay(vm.formModel.gridSousLieu);
            }
            else {
                vm.formModel.listeSousLieux = [];
                HELPER.Grid.refreshGridDisplay(vm.formModel.gridSousLieu);
            }
        }

        function tempsChange(newVal) {
            vm.formModel.formatTemps = KeymazeHelper.formatTime(newVal);
            vm.formModel.performance.k_vitmoy = KeymazeHelper.vitesseMoyenne(vm.formModel.performance.k_distance, vm.formModel.performance.k_temps);
        }

        function formatTempsChange(newVal) {
            vm.formModel.performance.k_temps = KeymazeHelper.timeToSeconds(newVal);
            vm.formModel.performance.k_vitmoy = KeymazeHelper.vitesseMoyenne(vm.formModel.performance.k_distance, vm.formModel.performance.k_temps);
        }

        function distanceChange(newVal) {
            vm.formModel.performance.k_vitmoy = KeymazeHelper.vitesseMoyenne(vm.formModel.performance.k_distance, vm.formModel.performance.k_temps);
        }

        function reduceGPSPoint(arrGPS) {
            if (arrGPS.length > 1000) {
                var newArrGPS = [];
                for (var l_intNumPoint = 0; l_intNumPoint < arrGPS.length; l_intNumPoint++) {
                    if (l_intNumPoint % 2 == 0)
                        newArrGPS.push(arrGPS[l_intNumPoint]);
                }
                return newArrGPS;
            }
            else
                return arrGPS;
        }
    };

})();