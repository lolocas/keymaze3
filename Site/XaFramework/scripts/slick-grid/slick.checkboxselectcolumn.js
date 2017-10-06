(function($) {
	// register namespace
	$.extend(true, window, {
		"Slick": {
			"CheckboxSelectColumn": CheckboxSelectColumn
		}
	});


	function CheckboxSelectColumn(options) {
		var _grid;
		var _self = this;
		var _handler = new Slick.EventHandler();
		var _defaults = {
			columnId: "_checkbox_selector",
			cssClass: null,
			toolTip: "Select/Deselect All",
			width: 30
		};

		var _options = $.extend(true, {}, _defaults, options);

		function init(grid) {
			_grid = grid;
			_handler
				.subscribe(_grid.onHeaderClick, handleHeaderClick);
		}

		function destroy() {
			_handler.unsubscribeAll();
			_grid = null;
		}

		function handleHeaderClick(e, args) {
			if (args.column.id == _options.columnId && $(e.target).is(":checkbox")) {

				var checked = $(e.target).is(":checked");
				_self.onSelectAll.notify({ "checked": checked });
				e.stopPropagation();
				e.stopImmediatePropagation();
			}
		}

		function getColumnDefinition() {
			return {
				id: _options.columnId,
				name: "<input type='checkbox'>",
				toolTip: _options.toolTip,
				field: "sel",
				width: _options.width,
				resizable: false,
				sortable: false,
				cssClass: _options.cssClass,
				headerCssClass: _options.cssClass,
				formatter: checkboxSelectionFormatter
			};
		}

		function checkboxSelectionFormatter(row, cell, value, columnDef, dataContext) {
			if (dataContext) {
				return dataContext.selected
					? "<input type='checkbox' checked='checked'>"
					: "<input type='checkbox'>";
			}
			return null;
		}

		function toggleAll(checked) {
			if (checked) {
				_grid.updateColumnHeader(_options.columnId, "<input type='checkbox' checked='checked'>", _options.toolTip);
			} else {
				_grid.updateColumnHeader(_options.columnId, "<input type='checkbox'>", _options.toolTip);
			}
		}

		$.extend(this, {
			"init": init,
			"destroy": destroy,
			"getColumnDefinition": getColumnDefinition,
			"toggleAll": toggleAll,
			"onSelectAll": new Slick.Event()
		});
	}
})(jQuery);