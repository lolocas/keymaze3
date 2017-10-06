(function (local) {
    'use strict';
    local.directive('xaButtonFilter', function ($timeout) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/buttonFilter/buttonFilter.tpl.html',
            scope: {
                options: '=',
                onClick: '&',
                onDelete: '&',
                onConf: '&',
                onVisu: '&',
                selectedItem: '='
            },
            link: function (scope, element) {
            	scope.idControl = scope.$id;

            	scope.hasDelete = angular.isDefined(scope.onDelete);
                scope.hasConf = angular.isDefined(scope.onConf);

                var selectItem = function (item) {
					scope.selectedItem = item;
                };

                if (scope.selectedItem) {
                    selectItem(scope.selectedItem);
                }

	            scope.itemClick = function(item) {
	            	if (item == scope.selectedItem) {
			            selectItem(null);
			            scope.onClick({ item: null });
			            return;
		            }
		            selectItem(item);
		            scope.onClick({ item: item });
	            };


	            scope.confClick = function (item) {
	            	scope.onConf();
	            };

	            scope.visuClick = function () {
	            	scope.onVisu();
	            };

	            scope.itemDrop = function (data) {
	            	scope.onDelete({ item: data });
	            	if (!scope.$$phase) scope.$apply();

	            	measureButtons();
	            };
	           

                var unregOptions = scope.$watch(function () { return scope.options.length; }, function () {
                    $timeout(measureButtons, 0, false);
                });

                var isScrollAttached = false;

                var $leftContainer = $(".leftContainer", element);
                var $rightContainer = $(".rightContainer", element);
                var $buttonContainer = $('.buttonContainer', element);
                var $scrollMask = $('.scrollMask', element);
                var $fakeScroll = $('.fakeScroll', element);

                function measureButtons() {

                    var totalWidth = 0;
                    $(".xa-form-button", $buttonContainer).each(function () {
                        totalWidth += $(this).outerWidth(true) + .5; //outerWidth rounds down decimals. Causing the issue ONLY in IE...
                    });
                    //totalWidth += 5; //IE hides last button
                    var totalContainerWidth = element.width();
                    var containerWidth = totalContainerWidth - $rightContainer.outerWidth(true) -2;
                    $leftContainer.width(containerWidth);

                    if (totalWidth > containerWidth) {
                        var diff = totalWidth - containerWidth;
                        $buttonContainer.width(totalWidth);
                        var scrollContainerWidth = $scrollMask.width();
                        $fakeScroll.width(scrollContainerWidth + diff / 5);

                        if (!isScrollAttached) {
                            isScrollAttached = true;

                            $scrollMask.bind("scroll", function () {
                                //get current scroll
                                var elemScroll = $scrollMask.scrollLeft();

                                //apply to 
                                $leftContainer.scrollLeft(elemScroll * 5);
                            });
                        }
                    }
                    else { //hide fake scroll after delete
                        $fakeScroll.width(0);
                    }
                }
                $(window).on("resize.buttonFilter", function () { $timeout(measureButtons, 0, false); });

                scope.$on("$destroy", function () {
                    $(window).off("resize.buttonFilter");
                    if (isScrollAttached) {
                        $scrollMask.off("scroll");
                    }
                    unregOptions();

                    element.empty();
                    element = null;
                });
            }
        };
    });

})(window.XaNgFrameworkButtonFilter);
