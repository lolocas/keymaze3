(function () {
    'use strict';

    angular.module('XaCommon').service('ExportGridService', ExportGridService);

    function ExportGridService(ApiHelper, ExportGridInfoTo, ExportGridColumnTo, FormHelper,UtilsHelper, ArrayHelper, ExportGridSortInfoTo, xaWindow) {

        this.exportGridXlsx = exportGridXlsx;
        this.exportGridPdf = exportGridPdf;

        function exportGridXlsx(gridInfo) {
            this.exportGrid(gridInfo, 'xlsx');
        };

        function exportGridPdf(gridInfo) {
            this.exportGrid(gridInfo, 'pdf');
        };

        function _getValueFromDatagrid(grid, format) {
        	
			// On ne récupère que les colonnes qui sont pasliés à un field ou les colonnes qui sont liés plusieurs fois ou les colonnes actions
        	var columns = ArrayHelper.findFromFunction(grid.getCurrentVisibleColumns(), function (item) { return !UtilsHelper.isEmptyOrWhitespace(item.field) && item.type != 'action' && item.type != 'couleur' })
        	columns = ArrayHelper.removeDuplicateFromProperty(columns, 'field');

        	var printGridInfoTo = new ExportGridInfoTo();

            // Grid.title can be string of function
            if (UtilsHelper.isFunction(grid.title))
                printGridInfoTo.title = grid.title();
            else 
            	printGridInfoTo.title = UtilsHelper.isEmpty(grid.title) ? UtilsHelper.getLabel('TXT_EXPORTGRID_DEFAULT') : grid.title;

            // Grid.description can be string of function
            if (UtilsHelper.isFunction(grid.description))
                printGridInfoTo.description = grid.description();
            else
                printGridInfoTo.description = UtilsHelper.isEmpty(grid.description) ? null : grid.description;

        	// Grid.title can be string of function
            if (UtilsHelper.isFunction(grid.footer))
            	printGridInfoTo.footer = grid.footer();
            else
            	printGridInfoTo.footer = UtilsHelper.isEmpty(grid.footer) ? null : grid.footer;

            printGridInfoTo.format = format;
            printGridInfoTo.columnDefs = _.map(columns, function (item) { return new ExportGridColumnTo(item) });
            printGridInfoTo.groupInfos = _.map(grid.groups, function (item) { return item });
            for (var f in grid.sortInfo) {
                printGridInfoTo.sortInfos.push(new ExportGridSortInfoTo({ name: grid.sortInfo[f].field, order: grid.sortInfo[f].direction }));
            }
            printGridInfoTo.isDynamicRowHeight = grid.exportIsDynamicRowHeight ? true : false;
            printGridInfoTo.fontSize = grid.exportFontSize ? grid.exportFontSize : 0;
			
            printGridInfoTo.datas = [];
            var gridData = grid.getData();
            for (var gridRow in gridData) {
                var row = [];
                ArrayHelper.forEach(columns, function (column) {
                	if (column.exportFieldFn)
                		row.push(column.exportFieldFn(grid.getCellData(gridData[gridRow], column), gridData[gridRow], column));
					else
                		row.push(grid.getCellData(gridData[gridRow], column));
                });
                printGridInfoTo.datas.push(row);
            }

            return printGridInfoTo;
        }
    };

})();