(function ($) {
	'use strict';
	
	// register namespace
	$.extend(true, window, {
		"Slick": {
			"Plugins": {
			    "DraggingRows": DraggingRows
			}
		}
	});


	/***
	 * A plugin to drag column headers.
	 */
	function DraggingRows(options) {
		var _grid;
		var _self = this;
		var _defaults = {
		};
		var cleanerDrag;
		var cleanerDrop;
		function init(grid) {

			if (!$.fn.drag) {
				throw new Error("SlickGrid's 'DraggingRows' plugin requires jquery.event.drag module to be loaded");
			}

			if (!$.fn.drop) {
				throw new Error("SlickGrid's 'DraggingRows' plugin requires jquery.event.drop module to be loaded");
			}

			options = $.extend(true, {}, _defaults, options);
			_grid = grid;
			//setTimeout(setupRowDropping,10);

			_grid.onDragInit.subscribe(OnDragInit);
			function OnDragInit(e, dd) {
				// Activation du drag and drop uniquement sur les lignes actives
				if (_grid.getOptions().isTouchDevice) {
					var item = $(e.target).closest('.slick-row');
					if (!item.hasClass('active'))
						return;
				}


				setupRowDropping();
				handleDragInit();
				e.stopImmediatePropagation();
			};

			_grid.onDragStart.subscribe(onDragStart);
			function onDragStart(e, dd) {
				// Désactivation du drag and drop sur les images pour eviter de faire une action et déclencher un drag and drop
				if (e.target.tagName == 'IMG') {
					return;
				}
			
				// Condition de sortie pour déplacer ligne à l'intérieur du tableauss
				var cell = _grid.getCellFromEvent(e);
				if (!cell) {
					return;
				}

				if (Slick.GlobalEditorLock.isActive() || /move|selectAndMove/.test(_grid.getColumns()[cell.cell].behavior)) {
					return;
				}
			
				// Change row before dragging
				var selectedRows = _grid.getSelectedRows();
				if (!selectedRows.length || $.inArray(cell.row, selectedRows) == -1) {
					selectedRows = [cell.row];
					_grid.setSelectedRows(selectedRows);
				}


				// Trigger click on cell
				_grid.onClick.notify({ row: cell.row, cell: cell.cell }, e, _grid);

				// Check if click event has stopped the propagation, if click has stop, we stop the processing
				if (e.isPropagationStopped())
					return;

				e.stopImmediatePropagation();

				dd.rows = selectedRows;
				dd.sourceGrid = options.sourceGrid;

				dd.rowInstances = [];
				var text = '';

				_.map(selectedRows, function (idRow) {
					var rowInst = _grid.getDataItem(idRow);
					if (rowInst.__group !== true)
						dd.rowInstances.push(rowInst);
				});


				if (dd.rowInstances.length == 0) {
					dd.rows = null;
					dd.sourceGrid = null;
					dd.rowInstances = null;

					return;
				}

			    // Empecher le drag and drop d'une ligne désactivé.
				if (dd.rowInstances.length > 0) {
				    var findObj = {};
				    findObj['_disabledRow'] = true;
				    if (_.findWhere(dd.rowInstances, findObj) != null) {
				        dd.rows = null;
				        dd.sourceGrid = null;
				        dd.rowInstances = null;
				        return;
				    }

				}


				text = _self.onRowDragHtml.notify({ rows: dd.rowInstances });

				var proxy = $('<div>')
					.css({
						visibility:'hidden',
						background: "#e0e0e0",
						padding: "4px 10px",
						border: "1px solid gray",
						"z-index": 99999,
						"-moz-border-radius": "8px",
						"-moz-box-shadow": "2px 2px 6px silver"
					})
					.addClass("xa-drag-proxy slick-dragged-row")
					.width('360px')
					.append($('<div></div>').addClass('drag-drop-indicator'))
					proxy.appendTo("body");
			
				
				/*
					* The proxy indicator can be populated with simple text or markup.
					* When markup is needed, return an object from onRowDragHtml with a 'indicatorMarkup' property.
				*/
				if (text && typeof text === "object") {
					proxy.append(text.indicatorMarkup);
				} else {
					proxy.text(text);
					proxy.html(proxy.text().replace('\n', '<br />'));
				}

				var proxyWidth = proxy.outerWidth();
				var proxyHeight = proxy.outerHeight();

				dd.limit = { top: 0, left: 0 };
				dd.limit.bottom = dd.limit.top + $(window).height() - proxyHeight;
				dd.limit.right = dd.limit.left + $(window).width() - proxyWidth;

				dd.proxyWidthOffset = -5;
				dd.proxyHeightOffset = -5;
			

				dd.helper = proxy;

				//remove not allowed targets
				var available = dd.available;
			    var av = _.filter(dd.available, function (elem) {
			        var $elem = $(elem);
			        var withClass = _.any(options.dropTargets, function (cl) {
			            return $elem.hasClass(cl.replace('.', ''));
			        });

			        return !!withClass;
			    });
			    dd.available = av;

				$(dd.available).addClass("highlightedDrop");
				return proxy;
			};

			_grid.onDrag.subscribe(onDrag);
			function onDrag(e, dd) {
				// Condition de sortie pour déplacer ligne à l'intérieur du tableauss
				handleDragStart();
				if (dd.sourceGrid != options.sourceGrid) {
					return;
				}
		
				$(dd.helper).css({
						visibility: 'visible',
						top: Math.min(dd.limit.bottom, Math.max(dd.limit.top, e.pageY - (dd.proxyHeightOffset) )) ,
						left: Math.min(dd.limit.right, Math.max(dd.limit.left, e.pageX - (dd.proxyWidthOffset) ))
					});
			};

			_grid.onDragEnd.subscribe(onDragEnd);
			function onDragEnd(e, dd) {
				handleDragEnd();
			    if (dd.sourceGrid != options.sourceGrid) {
				    return;
			    }
			
				dd.helper.remove();
				 $(dd.available).removeClass("highlightedDrop");
				
				/* 
				dd.drag = null;
				dd.target = null;
				dd.proxy = null;
				dd.grid = null; 
				*/


			};

			cleanerDrag = function () {
				_grid.onDragInit.unsubscribe(OnDragInit);
				_grid.onDragStart.unsubscribe(onDragStart);
				_grid.onDrag.unsubscribe(onDrag);
				_grid.onDragEnd.unsubscribe(onDragEnd);
			}
		}

		function canDrop(dd, $target) {
		    var startFromGrid = dd.sourceGrid == options.sourceGrid;
		    var isTarget = _.any(options.dropTargets, function (cl) { return $target.hasClass(cl.replace('.', '')); });
			return startFromGrid && isTarget;
		}

		var _isDropAttached = false;
		var _dropTargets = null;
		function setupRowDropping() {
		    if (_isDropAttached) return;
		    _isDropAttached = true;
		    
		    $.drop({ mode: "mouse", multi: true });
		    _dropTargets = $(options.dropTargets.join(', '));
		    _dropTargets.bind("dropstart", dropstart )
		    function dropstart(e, dd) {
                    if (!canDrop(dd, $(this))) {
	                    return;
                    }
                    $(this).addClass("dropAvailable");
                };
              
		    _dropTargets.bind("dropend",dropend);
		    function dropend(e, dd) {
		    	if (!canDrop(dd, $(this))) {
		    		return;
		    	}
		    	$(this).removeClass("dropAvailable");
		    };

		    _dropTargets.bind("drop", drop);
		    function drop(e, dd) {
                	if (!canDrop(dd, $(this))) {
	                    return;
                    }
                    handleRowDrop(e, dd);
                /*    _grid.invalidate();
                   _grid.setSelectedRows([]);  */
		    };

		    cleanerDrop = function () {
		    	_dropTargets.unbind("dropstart", dropstart);
		    	_dropTargets.unbind("dropend", dropend);
		    	_dropTargets.unbind("drop", drop);
		    }
		}

		function handleRowDrop(e, dd) {
		
		    var rowInstances = dd.rowInstances;

			// Attention dans les cas des onglets, les onglets non visible peuvent être identifié en tant que drop zone ... 
			// Si plus de un seul item on sort.
		    var $dropElems = $(dd.drop).filter(":visible");
		  
		  //  var $dropElem =  $($dropElems[0]);

		    var dropClass = '';
		    _.each($dropElems, function (elem) {
		    	_.each(options.dropTargets, function (cls) {
		    		var classStripped = cls.replace('.', '');
		    		if ($(elem).hasClass(classStripped))
		    			dropClass = cls;
		    	});
		    });

		    if (dropClass == '')
				throw new Error("Unable to identify the right drop zone, drop event has been target but it's not part of the drop zone.");

			
		    var args = {
		        "grid": _grid,
		        "rowInstances": dd.rowInstances,
		        "dropClass": dropClass
		    };


		    _self.onRowDragged.notify(args);
		  
		}

		function destroy() {
			cleanerDrag();
			if (_isDropAttached) {
				cleanerDrop();
				_dropTargets.length = 0;
				_dropTargets = null;
			}
			_grid = null;
		}

		function handleDragInit() {
			_self.onDragInit.notify();
		}

		function handleDragEnd() {
			_self.onDragEnd.notify();
		}

		function handleDragStart() {
			_self.onDragStart.notify();
		}
        
		$.extend(this, {
			"init": init,
			"destroy": destroy,
			"onDragInit": new Slick.Event(),
			"onDragStart": new Slick.Event(),
			"onDragEnd": new Slick.Event(),
			"onRowDragged": new Slick.Event(),
			"onRowDragHtml": new Slick.Event(),
		
		});
	}
})(jQuery);