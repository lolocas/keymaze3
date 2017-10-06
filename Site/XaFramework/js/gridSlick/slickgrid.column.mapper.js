(function(local) {
	'use strict';

	local.service('xaSlickGridColumnMapper', function ($filter, xaDirectiveHelper, xaSlickGridColumnFormatter, xaSlickGridColumnEditor) {

		this.map = function(xaColumDefinitions, isPers) {

		    return _.map(_.filter(xaColumDefinitions, function (item) { return item.visible != false || isPers; }), function (c) {
				var slickCol = {
					id: c.field,
					field: c.field,
					fieldFn: c.fieldFn,
					name: c.displayName,
					complexType: /\./.test(c.field),
					sortable: c.sortable === false ? false : true, //to disable sorting, you need to explicitly set it to false
					groupable: c.groupable === false ? false : true, //same as for sorting
					width: c.width ? parseInt(c.width.replace(/px/, '')) : undefined,
					minWidth: c.minWidth ? parseInt(c.minWidth.replace(/px/, '')) : undefined,
					maxWidth: c.maxWidth ? parseInt(c.maxWidth.replace(/px/, '')) : undefined,
                    resizable: c.resizable,
				    keepInitialWidth: !!c.width,
				    buttons: c.buttons,
				    toolTip: c.tooltip,
					type: c.type,
					typeArg: c.typeArg,
					cssClass: c.cellClass,
                    editor: xaSlickGridColumnEditor.getEditor(c),
                    editorSettings: c.editorSettings,
                    headerFormatter: c.headerFormatter,
                    headerClick: c.headerClick,
                    headerCssClass: c.headerCssClass,
                    colData: c.colData,
                    alwaysShow: c.alwaysShow,
                    alwaysFirst: c.alwaysFirst,
                    cellFilter: c.cellFilter,
                    groupFilter: c.groupFilter,
                    groupAggregatorFn: c.groupAggregatorFn,
                    sortValueFn: c.sortValueFn,
                    summaryGroupRowType: c.summaryGroupRowType,
                    onCellChanging: c.onCellChanging,
                    groupTotalsFormatter: c.groupTotalsFormatter,
                    exportDisplayName: c.exportDisplayName,
                    exportFieldFn: c.exportFieldFn,
                    maxGridButtons: c.maxGridButtons,
                    focusable: c.focusable,
                    formatter: c.formatter           
				};

				if (c.field.indexOf('()') > 0 || c.fieldFn)
				    slickCol.complexType = true;

				if (c.buttons && c.buttons.length > 0) {
				    
				    slickCol.formatter = function (row, cell, value, columnDef, dataContext, isGrouping) {
				        var cellContent = '';
				        if (!isGrouping)
				            cellContent += '<div>';
				        var btnIdx = 0;
				        for (var idx = 0; idx < c.buttons.length; idx++) {
				            if (c.buttons[idx].visibilityFn) {
				                var isVis = c.buttons[idx].visibilityFn(dataContext, columnDef);
				                if (!isVis) continue;
				            }
				           
				            if (btnIdx == c.maxGridButtons && c.buttons.length > c.maxGridButtons) {
				                //render start menu
				            	cellContent += '<a ' + xaDirectiveHelper.getTestIdWithAttribute('btnEXPAND') + ' data-expand="' + row + '" data-row="' + row + '" data-cell="' + cell + '" class="btn_' + row + ' slickButton expandButton" href="javascript:void(0);"> <i class="icon-expand glyphicon glyphicon-option-horizontal"></i></a>';
				                break;
				            }
				            btnIdx++;

                            if(!isGrouping)
				                cellContent += '<a data-button="' + idx + '" data-row="' + row + '" data-cell="' + cell + '" class="btn_' + row + '_' + cell + '_' + idx + ' slickButton" href="javascript:void(0);">';
                            if (c.buttons[idx].filter)
                            	cellContent += $filter(c.buttons[idx].filter)(value, c.buttons[idx].args, dataContext, columnDef);
                            else {
                            	cellContent += '<img src="' + c.buttons[idx].img + '"';
                            	cellContent += c.buttons[idx].tooltip ? ' title="' + c.buttons[idx].tooltip + '"' : '';
                            	cellContent += xaDirectiveHelper.getTestIdWithAttribute(c.buttons[idx].testId);
                            	cellContent += ' />';
                            } 
                            if (!isGrouping) {
                                cellContent += '</a>';
                            }
				        }
				        if (!isGrouping)
				            cellContent += '</div>';
				        return cellContent;
				    }
				}
				else if (c.cellFilter)
				{
				    slickCol.formatter = function (row, cell, value, columnDef, dataContext, isGrouping) {
				    	if (isGrouping && c.groupFilter)
				    		return $filter(c.groupFilter)(value, c.typeArg, dataContext, columnDef, isGrouping);
						else
				    		return $filter(c.cellFilter)(value, c.typeArg, dataContext, columnDef, isGrouping);
				    };
				}
				else if (c.formatter)
				{
				    slickCol.formatter = c.formatter;
				}

				if (c.groupOptions) {
				    slickCol.groupOptions = c.groupOptions;
				}

				slickCol.groupSortDirection = c.groupSortDirection;

                if (c.summaryGroupRowType) {
				    switch (c.summaryGroupRowType) {
				        case 'sum': slickCol.summaryRowAggrator = new Slick.Data.Aggregators.Sum(c.field); break;
				        case 'avg': slickCol.summaryRowAggrator = new Slick.Data.Aggregators.Avg(c.field); break;
				        case 'min': slickCol.summaryRowAggrator = new Slick.Data.Aggregators.Min(c.field); break;
				        case 'max': slickCol.summaryRowAggrator = new Slick.Data.Aggregators.Max(c.field); break;
				        case 'count': slickCol.summaryRowAggrator = new CountAggregator(c.field); break;
				        default: throw new Error('column.summaryGroupRowType: valeur invalide, valeur possible sum/avg/min/max');
				    }

				    if (c.cellFilter) {
				        slickCol.groupTotalsFormatter = function (totals, columnDef) {
				            var val = totals[columnDef.summaryGroupRowType] && totals[columnDef.summaryGroupRowType][columnDef.field];
				            if (val != null) {
				                return $filter(columnDef.cellFilter)(val, columnDef.typeArg);
				            }
				            return "";
				        };
				    }
				    else {
				        slickCol.groupTotalsFormatter = function (totals, columnDef) {
				            var val = totals[columnDef.summaryGroupRowType] && totals[columnDef.summaryGroupRowType][columnDef.field];
				            if (val != null) {
				                return val.toString();
				            }
				            return "";
				        };
				    }
				}


				return slickCol;

			});

		};

	});

	function CountAggregator(field) {
	    this.field_ = field;

	    this.init = function () {
	        this.count_ = 0;
	    };

	    this.accumulate = function (item) {
	        var val = item[this.field_];
	        if (val != null && val !== "" && val !== NaN) {
	            this.count_ ++;
	        }
	    };

	    this.storeResult = function (groupTotals) {
	        if (!groupTotals.count) {
	            groupTotals.count = {};
	        }
	        groupTotals.count[this.field_] = this.count_;
	    }
	}


})(window.XaNgFrameworkSlickGrid);