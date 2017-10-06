(function () {
    'use strict';

    angular.module('XaCommon')

        .factory('ExportGridColumnTo', function () {
            var ExportGridColumnTo = function (data) {
                // Si nom de colonne est vide, l'entete possède la valeur &nbsp,
				if (data.exportDisplayName)
					this.displayName = (data.exportDisplayName || '').replace('&nbsp;', ' ');
				else
					this.displayName = (data.name || '').replace('&nbsp;', ' ');
                this.field = data.field;
                this.type = data.type;
                this.typeArg = data.typeArg;
                this.width = data.width;
                this.summaryGroupRowType = data.summaryGroupRowType;
                
            };
            return ExportGridColumnTo;
        })

        .factory('ExportGridSortInfoTo', function () {
            var ExportGridSortInfoTo = function (data) {
                this.name = data.name;
                this.order = data.order;
            };
            return ExportGridSortInfoTo;
        })

        .factory('ExportGridInfoTo', function () {
            var ExportGridInfoTo = function (data) {
                this.columnDefs = [];
                this.sortInfos = [];
                this.groupInfos = [];
                this.datas = [];
                this.format = '';
            };
            return ExportGridInfoTo;
        });

})();