(function(local) {
	'use strict';

	/*
	 * 
	 * Use this directive to allow any element to accept dropping dragged items.
	 * Parameters:
	 *		dragContext (string) - match this with any draggable items which should drop here. Can also be comma separated values for multiple targets.
	 *		onDrop (function) - function called when an item gets dropped here.
	 * 
	 * Usage:
	 *		<any xa-drop-target drag-context="delete" on-drop="vm.delete(data)"></any>
	 * 
	 */
	local.directive('xaDropTarget', function ($rootScope, $parse, $timeout) {

		var dragOverClassName = 'xa-drag-over';

		return {
			restrict: 'A',
			link: function(scope, element, attrs) {

				var dragContexts = getDropContexts(),
					onDropCallback = $parse(attrs.onDrop);

				function setupDroppable() {
					cleanupDroppable();
					element.on("dropstart", dropstart);
					element.on("drop", drop);
					element.on("dropend", dropend);
				}

				function cleanupDroppable() {
					element.off("dropstart", dropstart);
					element.off("drop", drop);
					element.off("dropend", dropend);
				}

				function dropstart(ev, dd) {
				    if (accepts(dd)) {
				        $timeout(function () {
                            //raul: delay adding of valid class until dropend finishes...
				            $(dd.proxy).find(".drag-drop-indicator").addClass("valid");
				            element.addClass(dragOverClassName);
				        }, 0, false);
					}
				}

				function drop(ev, dd) {
					dd.accepted = accepts(dd);
					if (dd.accepted) {
						dd.matchedContext = _.intersection(dd.dragContext, dragContexts);
						var dragData = dd.dragData;
						onDropCallback(scope, { data: dragData, dragContext: dd });
					}

				    //raul: proxy is not always removed!!! let't remove it if not in the source
					    $(dd.proxy).remove();
					    $('body').removeClass('elementDragged');
				}

				function dropend(ev, dd) {
					if (accepts(dd)) {
						$(dd.proxy).find(".drag-drop-indicator").removeClass("valid");
						element.removeClass(dragOverClassName);
					}
				}

				function accepts(dd) {
					if (angular.isArray(dd.dragContext)) {
						return _.intersection(dd.dragContext, dragContexts).length > 0;
					}
					return dragContexts.indexOf(dd.dragContext) > -1;
				}

				function getDropContexts() {
					return angular.isString(attrs.dragContext) ? attrs.dragContext.split(',') : [];
				}

				var unwatchDragContext = attrs.$observe("dragContext", function () {
					dragContexts = getDropContexts();
					setupDroppable();
				});

				scope.$on("$destroy", function() {
					cleanupDroppable();
					unwatchDragContext();
				});

				$.drop({ mode: "intersect" });
			}
		}
	});

})(window.XaNgFrameworkDragAndDrop);