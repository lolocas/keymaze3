(function (local) {
	'use strict';

	local.directive('xaSwiper', function () {
		return {
			replace: true,
			restrict: 'A',
			scope: {
				swipeUp: '&',
				swipeDown: '&',
				swipeLeft: '&',
				swipeRight: '&'
			},
			link: function (scope, elm, attrs) {

				attachEvent();
				var nm = false;
				var sp = null, ep = null;
				function _onTouchStart(e) {
					sp = {
						x: e.originalEvent.touches[0].pageX, y: e.originalEvent.touches[0].pageY
					}
				};
				function _onTouchMove( e) {
					nm = false;
					ep = { x: e.originalEvent.touches[0].pageX, y: e.originalEvent.touches[0].pageY }
				};
				function _onTouchEnd(e) {
					if (nm) { /* Fast click fn ici */  } else {
						var x = ep.x - sp.x, xr = Math.abs(x), y = ep.y - sp.y, yr = Math.abs(y);
						if (Math.max(xr, yr) > 20) {  (xr > yr ? (x < 0 ? scope.swipeLeft() : scope.swipeRight()) : (y < 0 ? scope.swipeUp() : scope.swipeDown())) }
					}; nm = true
				};
				function _onTouchCancel(obj, e) { nm = false };


				function attachEvent() {
					elm.on('touchstart', _onTouchStart);
					elm.on('touchmove', _onTouchMove);
					elm.on('touchend', _onTouchEnd);
					elm.on('touchcancel', _onTouchCancel);
				}

				function detachEvent() {
					elm.off('touchstart', _onTouchStart);
					elm.off('touchmove', _onTouchMove);
					elm.off('touchend', _onTouchEnd);
					elm.off('touchcancel', _onTouchCancel);
				}


				function swipeLeft() {
					scope.swipeLeft();
				}

				function swipeRight() {
					scope.swipeRight();
				}

				function swipeUp() {
					scope.swipeUp();
				}

				function swipeDown() {
					scope.swipeDown();
				}

				scope.$on('$destroy', function () {
					detachEvent();
				});

			}
		}
	})
})(window.XaNgFrameworkServices);