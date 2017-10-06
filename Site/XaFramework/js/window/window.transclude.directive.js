(function (local) {
    'use strict';

    local.directive('xaWindowTransclude', function (xaBenchmark) {
        return {
            link: function ($scope, $element, $attrs, controller, $transclude) {
                $transclude($scope.$parent, function(clone) {
                    $element.empty();
                    $element.append(clone);
                    xaBenchmark.timeStep('window transclusion complete');
                });

                $scope.$on('$destroy', function () {
                    $element.empty();
                    $element = null;
                });
            }
        };
    });

})(window.XaNgFrameworkWindow);
