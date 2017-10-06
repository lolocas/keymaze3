(function (local) {
	'use strict';

	var sliderProps = {

		realtime: '=', // Boolean, when set to true the updates are digested on mouse drag, whenever the step is reached.
		step: '=', // Size of snapping interval. To get a smoother effect, make this number small. Normally should be 1.
		min: "=", // The lower bound of the range.
		max: "=", // The upper bound of the range.
		canedit: '=', // boolean used to determine if the input is editable or not. - optional, default is true
		sliderValue: '=', // The current value.
		willChange: '&', // Callback function called before the sliderValue had changed. Returning false will prevent the value from updating.
		didChange: '&' // Callback function called after the sliderValue has changed.

	};

	local.directive("xaSlider", function() {
		return {
			restrict: "EA",
			replace: true,
			templateUrl: "../js/slider/slider.tpl.html",
			controllerAs: "slider",
			bindToController: true,
			scope: sliderProps,
			controller: function ($scope) {

				var slider = this,
					willChangeCallback = this.willChange() || angular.noop,
					didChangeCallback = this.didChange() || angular.noop;

				$scope.$watch("slider.min + slider.max + slider.sliderValue + slider.step", function () {

					if (!angular.isNumber(slider.min)) {
						throw new Error("xaSliderRange minimum value must be a number.");
					}

					if (!angular.isNumber(slider.max)) {
						throw new Error("xaSliderRange maximum value must be a number.");
					}

					//if (slider.min >= slider.max) {
					//	throw new Error("xaSliderRange minimum value must be less than maximum.");
					//}

					setPercentage();

				});

				slider.onUpdate = function (newPercentage) {

				    if(isNaN(newPercentage)) return; //when only 1 option in slider, newPercentage is NaN

					var oldValue = slider.sliderValue;

					var absoluteValue = slider.min + (slider.max - slider.min) * newPercentage / 100;
					var newValue = Math.round(absoluteValue / slider.step) * slider.step;

					if (willChangeCallback(newValue, oldValue) === false) {
						return false;
					} else {
						slider.sliderValue = newValue;
						didChangeCallback(newValue, oldValue);
						return true;
					}

				};

				function setPercentage() {
				    slider.percentageStep = slider.step / (slider.max - slider.min) * 100;

					var calculatedPercentage = ((slider.sliderValue - slider.min) / (slider.max - slider.min)) * 100;
					slider.sliderPercent = Math.min(100, Math.max(0, calculatedPercentage));
				}

			}
		};
	});

	local.directive('xaSliderBase', function () {

		return {
			restrict: 'EA',
			replace: true,
			templateUrl: '../js/slider/slider.base.tpl.html',
			require: "^xaSlider",
			scope: sliderProps,
			link: function (sliderScope, sliderElement, sliderAttrs, sliderController) {

				var handle = sliderElement.find(".xa-slider-handle"),
					handleWidth = handle.outerWidth(),
					sliderWidth,
					maxWidth,
					animationFrameId,
					position = { left: 0 },
					resizeElements = _.debounce(syncHandle, 300);

				sliderScope.sliderValue = sliderScope.sliderValue || 0;

				registerElementClicks();

				handle.on("dragstart", function (ev, dd) {

					if (sliderScope.canedit) {
						unregisterElementClick();
						dd.startPosition = position.left;
						dd.limit = handle.parent().outerWidth() - handleWidth;
						sliderElement
							.removeClass("xa-slider-animated")
							.addClass("xa-slider-dragging");
					}

				});

				handle.on("drag", function( ev, dd ) {

					if (sliderScope.canedit) {
						var newPosition = dd.startPosition + dd.deltaX;
						if (newPosition >= 0 && newPosition <= dd.limit) {
							position.left = newPosition;
							reflow();
						}
					}

				});

				handle.on("dragend", function () {

					if (sliderScope.canedit) {
						sliderElement.removeClass("xa-slider-dragging");
						setTimeout(registerElementClicks);
						reflow(true);
					}

				});

				handle.on("click", function (e) {

					e.preventDefault();
					e.stopPropagation();

				});

				$(window).on("resize", resizeElements);

				sliderScope.$watch("sliderValue", function() {
					syncHandle();
				});

				sliderScope.$on("$destroy", function () {

					handle.off();
					sliderElement.off();
					$(window).off("resize", resizeElements);
					cancelAnimationFrame(animationFrameId);

				});

				function reflow(finish) {

					animationFrameId = requestAnimationFrame(function () {

						var movePercentage = position.left / maxWidth * 100;

						if (angular.isNumber(sliderScope.step)) {
						    movePercentage = Math.round(movePercentage / sliderScope.step) * sliderScope.step;
						    position.left = movePercentage / 100 * maxWidth;
						}

						// Ensure the new value is between 0 and 100.
						movePercentage = Math.min(100, Math.max(0, movePercentage));

						handle.css({ left: position.left });

						if ((sliderScope.sliderValue !== movePercentage) && (sliderScope.realtime || finish)) {
							sliderScope.sliderValue = movePercentage;
							var accepted = sliderController.onUpdate(sliderScope.sliderValue);
							if (accepted !== false) {
								applyUserChanges();
							}
						}

					});
				}

				function applyUserChanges() {
					sliderScope.$apply();
				}

				function registerElementClicks() {
					sliderElement.on("click", positionHandle);
				}

				function unregisterElementClick() {
					sliderElement.off("click", positionHandle);
				}

				function syncHandle() {
					sliderWidth = handle.parent().outerWidth();
					maxWidth = sliderWidth - handleWidth;
					position.left = (sliderScope.sliderValue / 100) * maxWidth;
					reflow();
				}

				function positionHandle(e) {

					/* NOTE: There are some issues click offset in Firefox. See http://stackoverflow.com/questions/11334452/event-offsetx-in-firefox */

					if (sliderScope.canedit) {
						var clickOffset = e.offsetX || e.originalEvent.layerX;
						position.left = Math.min(sliderWidth - handleWidth, Math.max(0, clickOffset - (handleWidth / 2)));
						sliderElement.addClass("xa-slider-animated");
						reflow(true);
					}

				}

			}
		};
	});

})(window.XaNgFrameworkSlider);
