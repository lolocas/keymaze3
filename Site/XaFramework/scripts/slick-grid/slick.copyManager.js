//got from http://stackoverflow.com/questions/12133899/slickgrid-how-to-copy-paste-cells-to-excel

(function ($) {
    // register namespace 
    $.extend(true, window, {
        "Slick": {
            "CellExternalCopyManager": CellExternalCopyManager
        }
    });


    function CellExternalCopyManager(options) {
        /*
          This manager enables users to copy/paste data from/to an external Spreadsheet application
          such as MS-Excel® or OpenOffice-Spreadsheet.
    
          Since it is not possible to access directly the clipboard in javascript, the plugin uses
          a trick to do it's job. After detecting the keystroke, we dynamically create a textarea
          where the browser copies/pastes the serialized data. 
    
          options:
            copiedCellStyle : sets the css className used for copied cells. default : "copy-manager"
            dataItemColumnValueExtractor : option to specify a custom column value extractor function
    
        */
        var _grid;
        var _self = this;
        var _copiedRanges;
        var _options = options || {};
        var _copiedCellStyle = _options.copiedCellStyle || "copy-manager";


        var keyCodes = {
            'C': 67,
            'V': 86
        }

        function init(grid) {
            _grid = grid;
            _grid.onKeyDown.subscribe(handleKeyDown);
        }

        function destroy() {
            _grid.onKeyDown.unsubscribe(handleKeyDown);
        }

        function getDataItemValueForColumn(item, columnDef) {
            if (_options.dataItemColumnValueExtractor) {
                return _options.dataItemColumnValueExtractor(item, columnDef);
            }
            return item[columnDef.field];
        }

        function setDataItemValueForColumn(item, columnDef, value) {
            if (_options.dataItemColumnValueSetter) {
                return _options.dataItemColumnValueSetter(item, columnDef, value);
            }
            return item[columnDef.field] = value;
        }


        function _createTextBox(innerText) {
            $('#slickCopyCell').remove(); //make sure we don't have leftovers
            var ta = document.createElement('textarea');

            ta.style.position = 'absolute';
            ta.style.left = '-1000px';
            ta.style.top = '-1000px';
            ta.id = 'slickCopyCell';
            ta.value = innerText;
            document.body.appendChild(ta);
            document.designMode = 'off';

            //IE10 throw an error the first time you try to copy. next copy will work fine.
            // the reason for this error is that the textbox is NOT ready to be focused; the issue can be fixed with a ctrl + c, but we can't use that..
            try {
                ta.focus();
            }
            catch (err) {
                return null;
            }

            return ta;
        }
        function _decodeTabularData(_grid, ta) {
            var columns = _grid.getColumns();
            var clipText = ta.value;
            var clipRows = clipText.split("\r\n");
            var clippeds = [];

            document.body.removeChild(ta);

            for (var i = 0; i < clipRows.length; i++) {
                if (clipRows[i] != "") // get rid of the last ""
                    clippeds[i] = clipRows[i].split(String.fromCharCode(9)); //  "\t" 
            }

            var selectedCell = _grid.getActiveCell();
            var activeRow = selectedCell.row + pageSize * pageNum;// getActiveCell.row starts from 0  for each page.
            var activeCell = selectedCell.cell;
            var desty = activeRow;
            var destx = activeCell;

            var data = _grid.getData().getItems();

            for (var y = 0; y < clippeds.length; y++) {
                for (var x = 0; x < clippeds[y].length; x++) {
                    var desty = activeRow + y;
                    var destx = activeCell + x;
                    if (desty < data.length && destx < grid.getColumns().length) {
                        data[desty][columns[destx].field] = clippeds[y][x];
                        if (data[desty].hasOwnProperty('id'))
                            changedIds.push(data[desty].id);// record changed id used by saving function
                    }
                }
            }

            _grid.invalidate();
        }


        function handleKeyDown(e, args) {
            var ranges;
            if (!_grid.getEditorLock().isActive()) {

                //ESC
                if (e.which == 27) {
                    if (_copiedRanges) {
                        e.preventDefault();
                        clearCopySelection();
                        _self.onCopyCancelled.notify({ ranges: _copiedRanges });
                        _copiedRanges = null;
                    }
                }

                if (e.which == keyCodes.C && (e.ctrlKey || e.metaKey)) {    // CTRL + C
                    if (window.navigator.userAgent.indexOf('MSIE 10') > 0) { //ie 10: disable copy (XPLOREWEB-972)
                        console.log('IE10 no copy!');
                        return true; //allow copy cell contents
                    }

                    //ranges = _grid.getSelectionModel().getSelectedRanges();
                    var activeCell = _grid.getActiveCell();

                    if (activeCell) {
                        var dt = _grid.getDataItem(activeCell.row);
                        var columns = _grid.getColumns();

                        var clipText = dt[columns[activeCell.cell].field];

                        var ta = _createTextBox(clipText);

                        if (ta) { //IE10 shits, can't copy...
                            $(ta).select();

                            setTimeout(function () {
                                document.body.removeChild(ta);
                            }, 100);
                        }
                        return false;
                    }
                }
            }
        }

        function markCopySelection(ranges) {
            var columns = _grid.getColumns();
            var hash = {};
            for (var i = 0; i < ranges.length; i++) {
                for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
                    hash[j] = {};
                    for (var k = ranges[i].fromCell; k <= ranges[i].toCell; k++) {
                        hash[j][columns[k].id] = true;
                    }
                }
            }
            _grid.setCellCssStyles(_copiedCellStyle, hash);
        }

        function clearCopySelection() {
            _grid.removeCellCssStyles(_copiedCellStyle);
        }

        $.extend(this, {
            "init": init,
            "destroy": destroy,
            "clearCopySelection": clearCopySelection,

            "onCopyCells": new Slick.Event(),
            "onCopyCancelled": new Slick.Event(),
            "onPasteCells": new Slick.Event()
        });
    }
})(jQuery);