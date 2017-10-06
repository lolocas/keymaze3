(function (local) {
    'use strict';

    local.directive('xaImageButton', function (xaTranslation, xaDirectiveHelper, xaFrameworkSetting) {
        
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/imageButton/imageButton.tpl.html',
            scope: {
            	imgUrl: '@imgurl',
            	dynImgUrl: '=?dynimgurl',
                click: '&?',
                resourceKey: '@',
                rightKey: '@',
                xaHref: '@',
                target: '@',
                rotate: '@?'
            },
            
            link: function (scope, element, attrs) {
           
                var imgElement = element.find('img');
                var unwatchdynimgurl = angular.noop;

                if (scope.xaHref) {
                    $(element).attr('href', scope.xaHref);
                }

                if (scope.resourceKey) {
                	element.attr('title', xaTranslation.instant(scope.resourceKey));
                	xaDirectiveHelper.setTestIdOnElement(element, 'btn', scope.resourceKey);
                }

                if (scope.rotate === 'false') {
                	imgElement.removeClass('rotate');
                }

                if (scope.imgUrl) {
                	imgElement.attr('src', scope.imgUrl);
                }

                if (attrs.dynimgurl) {
                	unwatchdynimgurl = scope.$watch('dynImgUrl', function (newValue) {
                		imgElement.attr('src', newValue)
                	});
                }

                if (scope.rightKey) {
                	if (xaFrameworkSetting.UserRights.indexOf(scope.rightKey) >= 0)
	                	element.hide();
                }

                scope.clickFn = function () {
                    if(!scope.xaHref)
                        scope.$parent.$eval(attrs.click);
                };

                scope.$on('$destroy', function () {
                	unwatchdynimgurl();
                });
            }
        };

    });

})(window.XaNgFrameworkImageButton);
