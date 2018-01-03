(function () {
    'use strict';

    angular.module('Keymaze')
        .config(MainPageScreenOpener);

    function MainPageScreenOpener($stateProvider) {
        $stateProvider.state('MainPage', {
            url: '/MainPage',
            templateUrl: 'View/MainPage/MainPage-View.html',
            controller: 'MainPageController as vm'
        })
    };

    angular.module('Keymaze')
        .factory('MainPageFormModel', function (HELPER, GridConfigModel, GridColumnModel, SplitterConfigModel, xaTranslation) {

            function MainPageFormModel() {
                var formModel = this;
                this.listePerformances = null;
                this.listeImport = null;
                this.currentPerformance = null;

                this.gridPerformances = new GridConfigModel({
                    height: '400px',
                    datasource: function () { return formModel.listePerformances },
                    uniqueKey: 'k_primaire',
                    selectFirstRowOnStart: true,
                    sortInfo: [{ field: 'k_date_perf', direction: 'desc' }],
                    showGroupPanel: true,
                    hideDefaultHeaderButtons: true,
                    quickSearchFields: ['l_lieu'],
                    columnDefs: [
                    new GridColumnModel({ field: 'p_sport', displayName: 'Sport' }),
                    new GridColumnModel({ field: 'l_lieu', displayName: 'Lieu' }),
                    new GridColumnModel({ field: 's_lieu', displayName: 'Sous-lieu', width: '100px' }),
                    new GridColumnModel({ field: 'k_date_perf', displayName: 'Date', type: 'datetime' }),
                    new GridColumnModel({ field: 'k_temps', displayName: 'Temps', type: 'time' }),
                    new GridColumnModel({ field: 'k_distance', displayName: 'Distance', type: 'distance' }),
                    new GridColumnModel({ field: 'k_vitmoy', displayName: 'Vit.Moy', width: '80px' }),
                    new GridColumnModel({ field: 'k_vitmax', displayName: 'Vit.Max', width: '80px' }),
                    new GridColumnModel({ field: 'k_url', displayName: 'URL', width: '80px' }),
                    new GridColumnModel({ field: 'action', displayName: 'Action' })
                    ]
                });

                this.gridImport = new GridConfigModel({
                    height: '200px',
                    datasource: function () { return formModel.listeImport },
                    uniqueKey: 'k_date_perf',
                    selectFirstRowOnStart: true,
                    sortInfo: [{ field: 'k_date_perf', direction: 'desc' }],
                    hideDefaultHeaderButtons: true,
                    columnDefs: [
                    new GridColumnModel({ field: 'k_date_perf', displayName: 'Date', type: 'datetime' }),
                    new GridColumnModel({ field: 'k_temps', displayName: 'Temps', type: 'time' }),
                    new GridColumnModel({ field: 'k_distance', displayName: 'Distance', type: 'distance' }),
                    new GridColumnModel({ field: 'action', displayName: '', width: '28px' })
                    ]
                });

            }
            return MainPageFormModel;
        });


    var app = angular.module('Keymaze')
        .controller('MainPageController', MainPageController);


    function MainPageController(HELPER, MainPageFormModel, KeymazeHelper) {
        var vm = this;

        vm.formModel = new MainPageFormModel();

        vm.openGPX = openGPX;

        var navigationBarMode = Microsoft.Maps.NavigationBarMode;
        var map = new Microsoft.Maps.Map('#myMap', {
            credentials: 'AmY1JqgPGmyC4gTUs6CadDWIKHhDVNI3H8R6MbfagjI89kemNaDwRpn4kTC_T2Kv',
            navigationBarMode: navigationBarMode.compact
        });

        getPerformances();

        HELPER.Grid.setRowSelectedAction(vm.formModel.gridPerformances, performanceChange);
        HELPER.Grid.addButtonActionInColumn(vm.formModel.gridPerformances, 'action', 'XaCommon/Img/edit.png', 'TXT_EDITER', _editPerformance);
        HELPER.Grid.addButtonDeleteInHeader(vm.formModel.gridPerformances, _deletePerformance);
        HELPER.Grid.addFixedTextClickActionInColumn(vm.formModel.gridPerformances, 'k_url', 'TXT_URL', _openURL, _canOpenURL);

        HELPER.Grid.addButtonActionInColumn(vm.formModel.gridImport, 'action', 'XaCommon/Img/add_20px.png', 'TXT_AJOUTER', _ajouterPerformance);


        //var loc1 = new Microsoft.Maps.Location(33.719753, -117.98925);
        //var loc2 = new Microsoft.Maps.Location(33.993065, -117.918015);
        //var loc3 = new Microsoft.Maps.Location(34.13095, -118.25497);

        //// Add a pin to the map
        //var pin1 = new Microsoft.Maps.Pushpin(loc1);
        //var pin2 = new Microsoft.Maps.Pushpin(loc2);
        //var pin3 = new Microsoft.Maps.Pushpin(loc3);

        //// Create a polyline
        //var lineVertices = new Array(loc1, loc2, loc3);
        //var line = new Microsoft.Maps.Polyline(lineVertices);

        //map.setView({ center: loc2, zoom: 9 });

        //map.entities.push(line);
        //map.entities.push(pin1);
        //map.entities.push(pin2);
        //map.entities.push(pin3);

        var eTabGPS =
        {
            eLAT: 0,
            eLONG: 1,
            eALT: 2,
            eDIST: 3,
            eNOM: 4,
            eNEWNOM: 5,
            eVITESSE: 6,
            eINTERVAL: 7,
            eHEARTRATE: 8
        }

        function getPerformances() {
            HELPER.Api.callApiLocal('Local', 'GetPerformances')
            .then(function (result) {
                vm.formModel.listePerformances = result;
                HELPER.Grid.refreshGridDisplay(vm.formModel.gridPerformances);
            });
        }

        function performanceChange(performance) {
            if (performance)
                performance.colMap = [];
            var l_lstPoint = performance.k_gps.split(';');
            var polyline = [];
            var previousLocation = null;
            var colDistance = [];
            var totalDistance = [];

            vm.formModel.currentPerformance = performance;

            colDistance.push(0);
            totalDistance.push(0);

            map.entities.removeAt(0);

            for (var l_intNumPoint = 0; l_intNumPoint < l_lstPoint.length; l_intNumPoint++) {
                if (HELPER.Utils.isEmpty(l_lstPoint[l_intNumPoint]))
                    continue;

                var l_strGPS = l_lstPoint[l_intNumPoint].split(',');

                performance.colMap.push(new Microsoft.Maps.Location(
                    (l_strGPS[eTabGPS.eLAT] / 100000),
                    (l_strGPS[eTabGPS.eLONG] / 100000),
                    (l_strGPS.count < 3) ? 0 : l_strGPS[eTabGPS.eALT]));
                if (previousLocation != null) {
                    colDistance.push(KeymazeHelper.distanceInKmBetweenEarthCoordinates(previousLocation.latitude, previousLocation.longitude, performance.colMap[l_intNumPoint].latitude, performance.colMap[l_intNumPoint].longitude));
                    totalDistance.push(totalDistance[l_intNumPoint - 1] + colDistance[l_intNumPoint]);
                }
                previousLocation = performance.colMap[l_intNumPoint];
            }

            map.entities.push(new Microsoft.Maps.Polyline(performance.colMap, { strokeColor: 'red', strokeThickness: 5}));
            map.setView({ bounds: Microsoft.Maps.LocationRect.fromLocations(performance.colMap) });

            var ctx = document.getElementById("myChart").getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: totalDistance,
                    datasets: [{
                        label: 'Altitude',
                        data: HELPER.Array.mapProperty(performance.colMap, 'altitude'),
                        backgroundColor:'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }

        function openGPX() {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.gpx';
            input.onchange = function (event) {
                var reader = new FileReader();
                reader.onload = function (e)
                {
                    var l_xml = e.target.result;
                    var colMap = [];
                    var datePerf = null;
                    var tempsPerf = null;
                    var k_gps = '';

                    var colDistance = [];
                    var totalDistance = [];
                    var distance = 0;
                    var previousLocation = null;
                    var l_intNumPoint = 0;

                    colDistance.push(0);
                    totalDistance.push(0);

                    $(l_xml).find("trkpt").each(function () {
                        var location = new Microsoft.Maps.Location($(this).attr("lat"), $(this).attr("lon"), $(this).find("ele").text());
                        colMap.push(location);
                        if (datePerf == null)
                            datePerf = $(this).find("time").text();

                        if (previousLocation != null) {
                            colDistance.push(KeymazeHelper.distanceInKmBetweenEarthCoordinates(previousLocation.latitude, previousLocation.longitude, location.latitude, location.longitude));
                            totalDistance.push(totalDistance[l_intNumPoint - 1] + colDistance[l_intNumPoint]);
                            distance += totalDistance[l_intNumPoint];
                        }
                        previousLocation = location;

                        k_gps += (location.latitude * 100000).toFixed(1) + ',' +
                                 (location.longitude * 100000).toFixed(1) + ',' +
                                 Math.round(location.altitude) + ';';

                        l_intNumPoint++;

                    });
                    map.entities.push(new Microsoft.Maps.Polyline(colMap, { strokeColor: 'red', strokeThickness: 5 }));
                    map.setView({ bounds: Microsoft.Maps.LocationRect.fromLocations(colMap) });

                    vm.formModel.listeImport = [];
                    vm.formModel.listeImport.push({
                        k_date_perf: new Date(datePerf),
                        k_temps: l_intNumPoint * 10,
                        k_distance: Math.round(totalDistance[colMap.length - 1] * 1000),
                        k_gps : k_gps
                    })
                    HELPER.Grid.refreshGridDisplay(vm.formModel.gridImport);

                };                
                reader.readAsText(event.target.files[0], 'UTF-8');
            };
            input.click();
        }

        function _editPerformance(row) {
            HELPER.Form.openWindow('Performance', row, 'EDIT').then(function (result) {
                if (result.success) {
                    getPerformances();
                }
            });
        }

        function _ajouterPerformance(row) {
            HELPER.Form.openWindow('Performance', row, 'CREATE').then(function (result){
                if (result.success) {
                    getPerformances();
                }
            });
        }

        function _deletePerformance(performance) {
            HELPER.Api.callApiLocal('Local', 'DeletePerformance', performance[0]).then(function (result){
                getPerformances();
            });
        }

        function _openURL(row) {
            HELPER.Utils.openHtmlLinkFromUrl(row.k_url, '_blank');
        }

        function _canOpenURL(row) {
            return !HELPER.Utils.isEmpty(row.k_url);
        }
    }
 
})();