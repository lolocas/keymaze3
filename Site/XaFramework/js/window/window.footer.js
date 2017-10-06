(function (local) {
    'use strict';

    local.directive('xaWindowFooter', function () {
            return {
                restrict: 'EA',
                replace: true,
                template: '<div class="modal-footer clearfix ignoreFocus"><div style="position: absolute; top: -1000px"><input type="text" class="endFocus" /></div></div>',
                link: function postLink() {
                }
            };
        }
    );

})(window.XaNgFrameworkWindow);