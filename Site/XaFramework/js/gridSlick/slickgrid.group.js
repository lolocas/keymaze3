(function(local) {
	'use strict';

	var ascendingParam = "asc",
		descendingParam = "desc",
		sortClassMap = {
			asc: "slick-sort-indicator-asc",
			desc: "slick-sort-indicator-desc"
		};

	// This function is called by slick.dataview when comparing group. 
	// The context is set to the grid's groupingInfo's, not to a xaSlickGridGroup instance so it is defined in a static context.
	function groupComparer(a, b) {
		if (a.value === b.value) {
			return 0;
		}

		return this.groupSortDirection === ascendingParam ?
			(a.value < b.value ? -1 : 1) :
			(a.value < b.value ? 1 : -1);
	}

	local.factory('xaSlickGridGroup', function(xaSlickGroupItem, $filter) {

		function xaSlickGridGroup(column, aggregators) {
			function _getValueFromStringProperty(value, key) {
				if (key == undefined) return undefined;

				var indice = key.indexOf('.');
				if (value == null)
					return null;
				else if (indice > 0)
					return _getValueFromStringProperty(value[key.substring(0, indice)], key.substring(indice + 1));
				else {
					if (key.substring(key.length - 2) == "()")
						return value[key.substring(0, key.indexOf("("))]();
					else
						return value[key];
				}

			};

			function customDataExtractor(item, columnDef) {
				if (columnDef.fieldFn)
					return columnDef.fieldFn(item, columnDef);
				else
					return _getValueFromStringProperty(item, columnDef.field);
			}

			if (!column) {
				throw new Error('A valid slick column is required for creating groups.');
			}

			if (column.groupSortDirection && column.groupSortDirection !== ascendingParam && column.groupSortDirection !== descendingParam) {
				throw new Error("xaSlickGridGroup: Possible values for groupSortDirection are {0} or {1}.".format(ascendingParam, descendingParam));
			}

			this._column = column;
			this.name = column.name;
			this.field = column.field;
			this.groupSortDirection = column.groupSortDirection || ascendingParam;
		//	this.getter = column.field;

		//	if (column.complexType)
		//	{
			
			//	}
			this.getter = function (rowData) {
				return customDataExtractor(rowData, column);
			};

			if (column.groupAggregatorFn) {
				this.getter = function (rowData) {
					return column.groupAggregatorFn(customDataExtractor(rowData, column), column.typearg, rowData, column);
				}
			}


			if (aggregators && aggregators.length > 0) {
				this.aggregators = aggregators;
				this.aggregateCollapsed = false,
                this.lazyTotalsCalculation = true
			}

			//default slick grid comparer is shit!
			this.comparer = groupComparer;
		}

		xaSlickGridGroup.prototype.formatter = function(g) {

			var val = g.value;
			var col = this._column;
			var grOpt = this._column.groupOptions;
            
			var groupHtml = "";

			if (grOpt) { //custom group!!
				//buttons
				var btnList = grOpt.groupButtons;
				if (grOpt.groupButtons && grOpt.groupButtons.length > 0) {
					_.each(grOpt.groupButtons, function (op, idx) {
						if (op.isVisibleFn && !op.isVisibleFn(col, val, g.rows)) return;

						groupHtml += '<a href="javascript:void(0);" class="groupButton groupButton_' + idx + '" data-idx="' + idx + '">';
						if (op.imgUrl) groupHtml += '<img src="' + op.imgUrl + '" />';
						else if (op.text) groupHtml += op.text;
						groupHtml += '</a>';
					});
				}

				if(grOpt.formatter)
					groupHtml += grOpt.formatter(col, val, g.rows);
			}

			if(!grOpt || !grOpt.formatter) {
				var formattedVal = val;
				if (this._column.formatter) { //get custom column value, if any
					formattedVal = this._column.formatter(0, 0, g.value, this._column, null, true);
				}
			    
			    
				groupHtml += this._column.name + ': ' + (formattedVal ? formattedVal : '') + " <span style='color:red'>(" + g.count + " lignes)</span>";
			}

			return groupHtml;
		};

		xaSlickGridGroup.prototype.meta = function () {
			return new xaSlickGroupItem(this);
		};

		xaSlickGridGroup.prototype.toggleSorting = function() {
			this.groupSortDirection = this.groupSortDirection === ascendingParam ? descendingParam : ascendingParam;
		};

		return xaSlickGridGroup;
	});

	/*
	 * This model is used in the directive for ng-repeating the items.
	 * Binding the original model which is also used by the DataView causes a memory leak
	 * due to references to group functions.
	 */
	local.factory('xaSlickGroupItem', function() {

		function xaSlickGroupItem(group) {
			this.name = group.name;
			this.field = group.field;
			this.sortClassName = sortClassMap[group.groupSortDirection];
		}

		return xaSlickGroupItem;

	});

})(window.XaNgFrameworkSlickGrid);