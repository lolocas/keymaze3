(function () {
    'use strict';

    angular.module('XaCommon')
        .factory('FormParamModel', function (UtilsHelper) {

            var FormParamModel = function (name, src) {
                UtilsHelper.extendPropFrom(this, src);
                this.name = name;
            };
            return FormParamModel;
        });
})();



