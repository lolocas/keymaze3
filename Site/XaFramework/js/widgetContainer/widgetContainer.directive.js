(function (local) {
    'use strict';
    local.directive('xaWidgetContainer', function ($timeout, $log, xaKeyHelper) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/widgetContainer/widgetContainer.tpl.html',
            scope: {
                widgetDetail: '='
            },
            link: function (scope, element, attrs) {
                
                var orderIdx = 0;
                var wasLeft = false;
                scope.innerItemList = [];

                scope.widgetDetail.maxHeight = scope.widgetDetail.maxHeight || 300;
                scope.widgetDetail.heightStep = scope.widgetDetail.heightStep || 50;
                
                scope.widgetDetail.addItem = addNewWidget;
                scope.widgetDetail.printDashboard = printDashboard;

                // initialisation des variables par defaut.
                if (!scope.widgetDetail.colums)
                    scope.widgetDetail.columns = 3;

                if (!scope.widgetDetail.state)
                    scope.widgetDetail.state = [];

                if (!scope.widgetDetail.items)
                    scope.widgetDetail.items = [];

                scope.widgetDetail.getJsonForSave = function () {
                    return angular.toJson({ items: scope.widgetDetail.items, state: scope.widgetDetail.state });
                }

                var colLen = scope.widgetDetail.columns;
                
                scope.colWidth = (100 / colLen);
                scope.colLen = colLen;

                scope.moveWidget = moveWidget;
                scope.resize = resize;
                scope.initDone = initDone;
                scope.removeWidget = removeWidget;
                scope.alignWidgets = alignWidgets;

                scope.saveWidgetsState = saveWidgetsState;
                scope.select = select;

                scope.afterAlignHandler = afterAlignHandler;
                
                prepareWidgets();
                function prepareWidgets() {
                    if (scope.widgetDetail.state) { //restore state...
                        _.each(scope.widgetDetail.state, function (st) {
                            var w = _.find(scope.widgetDetail.items, function (i) {
                                return i.name == st.name;
                            });

                            if (w) {
                                w.col = st.col;
                                w.colspan = st.colspan;
                                w.row = st.row;
                                w.offset = st.offset;
                                w.order = st.order;
                                w.selected = st.selected;
                                w.visible = st.visible;
                            }
                        });
                    }
                    else {
                        _.each(scope.widgetDetail.items, function (w, idx) {
                            if(!w.row) w.row = Math.floor(idx / scope.widgetDetail.columns);
                        });
                    }

                    var prevRow = 0;
                    eachOrderedWidget(function (w) {
                        if (!w.col)
                            w.col = orderIdx++;
                        else orderIdx = w.col;

                        if (w.visible !== false) w.visible = true;

                        w.offset = w.offset || 0;
                        w.colspan = w.colspan || 1;
                        if (!w.row) {
                            w.row = w.row || prevRow;
                            if (prevRow != w.row) {
                                orderIdx = 0;
                                prevRow = w.row;
                            }
                        }

                        if (w.visible)
                            scope.innerItemList.push(w);
                    });

                    //alignWidgets();
                }

                function addNewWidget(widget, onFirstRow) {

                    //make sure the name is unique
                    var existing = _.find(scope.widgetDetail.items, function (w) {
                        return w.name == widget.name;
                    });
                    if (existing) {
                        alert('widget with name ' + widget.name + ' already exists!');
                        return;
                    }

                    

                    widget.colspan = widget.colspan || 1;
                    widget.col = 0;

                    if (onFirstRow) {
                        var firstRow = undefined;
                        eachWidget(function (w) {
                            if (firstRow == undefined) firstRow = w.row;
                            else firstRow = Math.min(w.row, firstRow);
                        });

                        //always add widget to first row of first line
                        eachWidget(function (w) {
                            if (w.row == firstRow)
                                w.col += 1;
                        });
                        widget.row = 0;
                    }
                    else {
                        var lastRow = undefined;
                        eachWidget(function (w) {
                            if (lastRow == undefined) lastRow = w.row;
                            else lastRow = Math.max(w.row, lastRow);

                        });
                        widget.row = lastRow + 1;
                    }

                    widget.offset = 0;
                    widget.visible = true;
                    
                    scope.widgetDetail.items.push(widget);
                    scope.innerItemList.push(widget);
                    
                    $timeout(function () { //need to wait for angular to add the widget!!!
                        alignWidgets();
                    }, 0, false);
                    
                }

                function findRowRelTo(rowIdx, dir) {
                    if (dir > 0) return findNextRow(rowIdx);
                    return findPrevRow(rowIdx);
                }
                function findPrevRow(rowIdx) {
                    var maxIdx = -1;
                    eachWidget(function (w) {
                        if (w.row < rowIdx) maxIdx = Math.max(w.row, maxIdx);
                    });
                    return maxIdx;
                }
                function findNextRow(rowIdx) {
                    var minIdx = rowIdx + 1;
                    eachWidget(function (w) {
                        if (w.row > rowIdx) minIdx = Math.min(w.row, minIdx);
                    });
                    return minIdx;
                }

                function moveWidget(name, col, row, shiftRows) {
                    var winfo = getWidgetByID(name);
                    if (col != 0) {
                        var newOrder = winfo.col + col;
                        var affW = getWidgetByOrder(winfo.row, newOrder);

                        if (!affW) return; // last/first element was changed


                        affW.col = winfo.col;
                        winfo.col = newOrder;

                        var ord = affW.order;
                        affW.order = winfo.order;
                        winfo.order = ord;
                    }
                    else if (row) {

                        if (shiftRows) { //create empty row before/after current row.
                            //keep row index + reset col to 0;
                            //for each row:
                            //  if row > 0 -> shift row with 1, if row > currRow
                            //  if row < 1 -> shft row with 1, if row > prevRow
                            var refRow = winfo.row + (.1 * row); //row is +/- 1
                            if (row < 0) refRow = findPrevRow(refRow) + .1; //.1 helps differentiate new row from existing + places the new row right where it should be.

                            eachOrderedWidget(function (w) {
                                if (w.row > refRow) w.row += 1; //offset row by 1
                            });

                            winfo.row = refRow;// + row;
                            winfo.col = 0;
                        }
                        else {
                            var newRow = findRowRelTo(winfo.row, row);

                            //find next/prev row!!!
                            //var posIdx = winfo.col || .9; //works?
                            eachWidget(function (w) {
                                if (w.row == newRow && w.name != name && w.col > winfo.col)
                                    w.col = winfo.colspan;
                            });

                            winfo.row = newRow; //winfo.row + row;
                        }

                        //winfo.col = 0;
                        
                    }
                    alignWidgets();
                }

                function resize(name, factorW, factorH, elem) {
                    var winfo = getWidgetByID(name);
                    if (winfo) {
                        if (factorW) {
                            winfo.colspan += factorW;
                            winfo.colspan = winfo.colspan || 1;
                        }
                        else if (factorH) {
                            var mhVal = +elem.find('.body').css('height').replace('px','');
                            elem.find('.body').css('height', mhVal + scope.widgetDetail.heightStep * factorH);
                        }
                        alignWidgets();
                    }
                }

                var winitCount = 0;
                function initDone() {
                    winitCount++;

                    if (winitCount == scope.innerItemList.length) {
                        element.find('.widgetBackdrop').hide();
                        alignWidgets();
                    }
                }

                function getWidgetByID(wname) { 
                    return _.find(scope.widgetDetail.items, function (item) {
                        return item.name == wname;
                    });
                }

                function getWidgetByOrder(row, order) {
                    return _.find(scope.widgetDetail.items, function (w) {
                        return w.row == row && w.col == order;
                    });
                }

                function eachWidget(func) {
                    scope.widgetDetail.items.forEach(func);
                }

                function eachOrderedWidget(func) {
                    var widSortedList = _(scope.widgetDetail.items).chain()
                    .filter(function (w) {
                        return w.visible !== false;
                    }).sortBy(function (w) {
                        return w.col;
                    }).sortBy(function (w) {
                        return w.row;
                    }).value();

                    widSortedList.forEach(func);
                }

                function removeWidget(name) {
                    var toRem = getWidgetByID(name);

                    if (toRem) {
                        toRem.visible = false;
                        scope.select(null);
                        scope.innerItemList.splice(scope.innerItemList.indexOf(toRem), 1);

                        alignWidgets();
                    }
                    else {
                        console.warn('Attempt to remove item that\'s not existing in array!');
                    }
                }
                
                function alignWidgets() {

                    //todo: normalize row & column numbers!!!
                    var row = 0;
                    var col = 0;
                    var lastRow = -1;
                    eachOrderedWidget(function (winfo) {
                        if (row == 0 && lastRow == -1) { //fill first row
                            lastRow = winfo.row;
                        }
                        else if (winfo.row != lastRow) {
                            col = 0;
                            row = row + 1;
                            lastRow = winfo.row;
                        }

                        winfo.row = row;
                        winfo.col = col++;
                    });

                    var top = 0;
                    var rowHeight = 0;
                    var prevRow = 0;
                    var colspan = 0;
                    eachOrderedWidget(function (winfo) {
                        var $this = element.find('.wContainer[data-name="' + winfo.name + '"]');
                        if ($this.length == 0)
                            console.warn('could not find widget!!!! ', winfo.name, winfo);

                        var order = winfo.col;
                        var wh = $this.outerHeight();

                        if(!winfo) {
                            $log.warn('Widget named ' + winfo.name + ' not found in the list!');
                            return;
                        }

                        if (prevRow != winfo.row) { //widget belongs to new row
                            top += rowHeight;

                            rowHeight = 0;
                            colspan = 0;

                            prevRow = winfo.row;
                            $this.addClass('rowStart');
                        }
                        else {
                            $this.removeClass('rowStart');
                        }

                        var cssLeft = ((colspan + winfo.offset) * scope.colWidth) + '%';
                        var cssWidth = (winfo.colspan * scope.colWidth) + '%';
                        var posCss = {
                            'position': 'absolute',
                            'top': top,
                            'left': cssLeft,
                            'width': cssWidth
                        };

                        $this.css(posCss);
                      
                        colspan += winfo.colspan;
                        rowHeight = Math.max(wh, rowHeight);

                    });
                    
                    scope.saveWidgetsState();
                    for (var idx = 0; idx < _afterAlignHandlers.length; idx++) {
                        _afterAlignHandlers[idx]();
                    }

                    top += rowHeight;
                    element.css({'min-height': top });
                }

                function saveWidgetsState() {
                    var stateArr = [];

                    _.each(scope.widgetDetail.items, function (w) {
                        stateArr.push({ name: w.name, col: w.col, row: w.row, offset: w.offset, order: w.order, colspan: w.colspan, selected: w.selected, visible: w.visible });
                    });
                    scope.widgetDetail.state = stateArr;
//                    (scope.widgetDetail.save || angular.noop)(stateArr, scope.widgetDetail.items);
                }

                function select(selWidget) {
                    eachOrderedWidget(function (winfo) {
                        winfo.selected = false;
                    });

                    if(selWidget)
                        selWidget.selected = true;
                };

                var _afterAlignHandlers = [];
                function afterAlignHandler(handler) {
                    _afterAlignHandlers.push(handler);
                }

                //raul: disable for now arrow nav. OPening a popup when having a selecetd widget prevents any text inputted
                //I can tie to the evt.target prop, problem is that for good ase, target is popup containing widgets
                //$(document).on('keydown', function (evt) {
                //    var keyCode = evt.which;
                //    var selectedWidget = null;
                //    eachOrderedWidget(function (winfo) {
                //        if(winfo.selected) selectedWidget = winfo;
                //    });

                //    //if tab: 
                //    // no selection ? select first widget
                //    //has selection? select next widget

                //    if (!selectedWidget) return;

                //    var colOffset = 0;
                //    var rowOffset = 0;
                //    var shiftRows = evt.shiftKey;

                //    var up = xaKeyHelper.isArrowUp(keyCode);
                //    var down = xaKeyHelper.isArrowDown(keyCode);
                //    var left = xaKeyHelper.isArrowLeft(keyCode);
                //    var right = xaKeyHelper.isArrowRight(keyCode);

                //    if (shiftRows && (left || right)) { //resize
                //        var resizeFactor = left ? -1 : 1;

                //        scope.resize(selectedWidget.name, resizeFactor);
                //    }
                //    else if (up) {
                //        rowOffset = -1;
                //    }
                //    else if (down) {
                //        rowOffset = 1;
                //    }
                //    else if (left) {
                //        colOffset = -1;
                //    }
                //    else if (right) {
                //        colOffset = 1;
                //    }

                //    evt.stopPropagation();
                //    evt.preventDefault();

                //    scope.moveWidget(selectedWidget.name, colOffset, rowOffset, shiftRows);
                //});

                function printDashboard() {
                    //var w = window.open();
                    //w.document.write(element.html());
                    //w.print();
                    //w.close();

                    var html = '<div class="widget-row">';

                    eachOrderedWidget(function (winfo) {
                        if (winfo.col == 0 && html.length > 20) {
                            html += '</div><div class="widget-row">';
                        }

                        var $this = element.find('.wContainer[data-name="' + winfo.name + '"]');

                        html += $this.clone().css({
                            'float': 'left',
                            'top': '',
                            'left': '',
                            'position': ''
                        }).get(0).outerHTML;
                    });

                    scope.print(html);



                    //todo: get each widget, floated left... 
                }

                scope.print = function (html) {
                	var div = $('<div id="widgetContainer" class="widgetContainer"></div>').append(html);

                    $('body').append(div);
                    window.print();
                    div.remove();
                }
                
                scope.$on('$destroy', function () {
                    $(document).off('keydown');
                });
            }
        };
    });

})(window.XaNgFrameworkWidgetContainer);
