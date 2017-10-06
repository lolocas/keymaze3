(function (local) {
    'use strict';

    local.directive('xaImageViewer', function ($filter) {
        
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/viewers/imageViewer.tpl.html',
            scope: {
                content: '=content',
                imagePrint: '&?'
            },
            
            link: function (scope, element, attrs) {
                var defaultImgWidth = 'auto';

                scope.imgStyle = { width: defaultImgWidth };

                var unwatchContent = scope.$watch('content', function (newVal, oldVal) {
                    if (!newVal && !oldVal) return;
                    scope.currentImage = newVal[0];
					scope.zoom(100, true)

                });

                scope.print = function () {
                    var fn = scope.imagePrint();
                    if (angular.isFunction(fn))
                        fn(scope.currentImage); 
                };
                scope.selectImg = function (img) {
                    scope.currentImage = img;
                    scope.imgStyle = { width: defaultImgWidth };
                };
                scope.zoom = function (amt, absolute) {
                    if (amt == 'auto')
                        scope.imgStyle.width = 'auto';
                    else if (absolute)
                        scope.imgStyle.width = amt + '%';
                    else {
                        var perc = (scope.imgStyle.width || "").replace('%', '');
                        if (perc == 'auto') { //measure img, and find perc width
                            var imgW = $('.mainImgContainer img', element).prop('naturalWidth') || $('img', element).width(); //w in pixels
                            var maxW = $('.mainImgContainer', element).width(); //max  w in px

                            perc = 100 * imgW / maxW;
                        }

                        perc = (+perc) + (+amt);
                        scope.imgStyle.width = perc + '%';
                    }
                };
                scope.rotate = function (deg) {
                    var currRotate = +(scope.imgStyle.transform || "0deg").replace('deg', '').replace("rotate(", "").replace(")", "");

                    currRotate = ((currRotate + deg) % 360) + 'deg';
                    currRotate = "rotate(" + currRotate + ")";

                    scope.imgStyle.transform = currRotate;
                    scope.imgStyle["-ms-transform"] = currRotate;
                    scope.imgStyle["-webkit-transform"] = currRotate;
                };


                scope.$on('$destroy', function () {
                    unwatchContent();
                    element.empty();
                    element = null;
                });
            }
        };

    });

})(window.XaNgFrameworkViewers);
