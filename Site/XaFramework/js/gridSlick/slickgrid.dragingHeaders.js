(function ($) {
	'use strict';
		
	// register namespace
	$.extend(true, window, {
		"Slick": {
			"Plugins": {
				"DraggingHeaders": DraggingHeaders
			}
		}
	});


	/***
	 * A plugin to drag column headers.
	 */
	function DraggingHeaders(options) {
		var _grid;
		var _self = this;
		var _handler = new Slick.EventHandler();
		var _gridContainer;
		var _mouseOffsetV = 0; // Distance from the mouse pointer to top of moving indicator.
		var _mouseOffsetH = 10; // Distance from the mouse pointer to the left of the moving indicator.

		var _defaults = {
			dropTarget: '.xa-slick-grid-group-elements' // TODO: pass with options, or generate unique jquery-ui scope / grid.
		};

		function init(grid) {

			if (!$.fn.drag) {
				throw new Error("SlickGrid's 'DraggingHeaders' plugin requires jquery.event.drag module to be loaded");
			}

			if (!$.fn.drop) {
				throw new Error("SlickGrid's 'DraggingHeaders' plugin requires jquery.event.drop module to be loaded");
			}

			options = $.extend(true, {}, _defaults, options);
			_grid = grid;
			_gridContainer = $(grid.getTopPanel()).closest('.gridContainer');
			_handler
			  .subscribe(_grid.onHeaderCellRendered, handleHeaderCellRendered)
			  .subscribe(_grid.onBeforeHeaderCellDestroy, handleBeforeHeaderCellDestroy);

			// Force the grid to re-render the header now that the events are hooked up.
			_grid.setColumns(_grid.getColumns());
		}

		function destroy() {
			cleanupDroppable();
			_handler.unsubscribeAll();
			_grid = null;
		}

		function handleHeaderCellRendered(e, args) {
			if (args.column.groupable) {
				setupHeaderDragging(args.node);
			}
		}

		function handleBeforeHeaderCellDestroy(e, args) {
			if (args.column.groupable) {
			    $(args.node).off("draginit dragstart drag dragend");
			}
		}

		function setupHeaderDragging(node) {
			var $node = $(node);

			$node.on('draginit', function (e, dd) {
			    setupHeaderDropping();
			});
			$node.on("dragstart", function(ev, dd) {

				var proxy = $("<div>")
					.addClass("slick-header-column ui-state-default dragged-header")
					.append($(this).find(".slick-column-name").clone())
					.appendTo(document.body);

				dd.limit = _gridContainer.offset();
				dd.limit.bottom = dd.limit.top + _gridContainer.outerHeight() - proxy.outerHeight();
				dd.limit.right = dd.limit.left + _gridContainer.outerWidth() - proxy.outerWidth();
				dd.column = $node.data('column');

				return proxy;
			})

			.on("drag", function (ev, dd) {
				$(dd.proxy).css({
					top: Math.min(dd.limit.bottom, Math.max(dd.limit.top, dd.startY + dd.deltaY + _mouseOffsetV)),
					left: Math.min(dd.limit.right, Math.max(dd.limit.left, dd.startX + dd.deltaX + _mouseOffsetH))
				});
			})

			.on("dragend", function (ev, dd) {
				$(dd.proxy).remove();
			});
		}

		var _wasDropInit = false;
		function setupHeaderDropping() {
		    if (_wasDropInit) return;

		    _wasDropInit = true;

			$(options.dropTarget, _gridContainer)

				.on("dropstart", function() {
					$(this).addClass("dropping");
				})
				.on("drop", function (ev, dd) {
				    if (dd.column) {
				        //raul: need to check the column is coming from the same grid as the drop
				        //var dragGrid = $(dd.drag).closest('.xa-slick-grid')[0];
				        //var dropGrid = $(dd.drop[0]).closest('.xa-slick-grid')[0];

                        //if(dragGrid == dropGrid)
						    handleColumnDrop(dd.column);
					}
				})
				.on("dropend", function() {
					$(this).removeClass("dropping");
				});
		}

		function handleColumnDrop(column) {
			_self.onGroupDropped.notify({
				"grid": _grid,
				"column": column
			});
		}

		function cleanupDroppable() {
			$(options.dropTarget, _gridContainer).off();
		    _gridContainer = null;
		}

		$.extend(this, {
			"init": init,
			"destroy": destroy,
			"onGroupDropped": new Slick.Event()
		});
	}
})(jQuery);