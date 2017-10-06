(function(local) {
	'use strict';

	/*
	 * 
	 * Use this directive to allow any element to be draggable.
	 * Parameters:
	 *		dragContext (string) - used for determining valid drop targets.
	 *		dragData (string|object) - must be serializable.
	 * 
	 * Usage:
	 *		<any xa-draggable drag-context="delete" drag-data="vm.patient.Id"></any>
	 * 
	 */
	local.directive('xaDraggable', function() {

		var _mouseOffsetV = 0; // Distance from the mouse pointer to top of moving indicator.
		var _mouseOffsetH = 0; // Distance from the mouse pointer to the left of the moving indicator.

		return {
			restrict: 'A',
			link: function(scope, element, attrs) {

				var dragData;

				function setupDraggable() {
					cleanupDraggable();
					element.on("dragstart", dragstart);
					element.drag(drag, { distance: 10 }); //20 px drag before start to apply the drag... to prevent click to drag
					element.on("dragend", dragend);
				}

				function cleanupDraggable() {
					element.off("dragstart", dragstart);
					element.off("drag", drag);
					element.off("dragend", dragend);
				}

				var unwatchDragData = scope.$watch(attrs.dragData, function(value) {
					dragData = value;
					setupDraggable();
				});

				scope.$on('$destroy', function() {
				    cleanupDraggable();
				    unwatchDragData();
				});

				function dragstart(ev, dd) {

				    $('body').addClass('elementDragged');

					var proxy = $('<div>')
						.addClass("xa-drag-proxy")
						.append($(this).clone().addClass('xa-drag-clone'))
						.append($('<div></div>').addClass('drag-drop-indicator'))
						.appendTo(document.body);

					var windowHeight = $(window).height();
					var windowWidth = $(window).width();

					dd.limit = { top: 0, left: 0 };
					dd.limit.bottom = dd.limit.top + windowHeight - proxy.outerHeight();
					dd.limit.right = dd.limit.left + windowWidth - proxy.outerWidth();

					dd.dragContext = attrs.dragContext;
					dd.dragData = dragData;

					return proxy;
				}

				function drag(ev, dd) {
					$(dd.proxy).css({
						top: Math.min(dd.limit.bottom, Math.max(dd.limit.top, dd.originalY + dd.deltaY + _mouseOffsetV)),
						left: Math.min(dd.limit.right, Math.max(dd.limit.left, dd.originalX + dd.deltaX + _mouseOffsetH))
					});
				}

				function dragend(ev, dd) {
					$(dd.proxy).remove();
					$('body').removeClass('elementDragged');
				}
			}
		}
	});
})(window.XaNgFrameworkDragAndDrop);