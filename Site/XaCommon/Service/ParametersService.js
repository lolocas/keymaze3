(function () {
    'use strict';

    angular.module('XaCommon').service('ParametersService', ParametersService);
    function ParametersService($location, UtilsHelper) {

        this.initAppParameters = initAppParameters;
        this.getAppParameter = getAppParameter;
        this.getAppParameters = getAppParameters;

        this._appParameters = null;

        var ctx = this;

        function _replaceWildcardUrlValue(parameter) {
            var newValue = parameter;
            if (UtilsHelper.startWith(newValue, 'http') || UtilsHelper.startWith(newValue, 'ws')) {
                newValue = UtilsHelper.replaceAll(newValue, '://+', '://' + $location.host());
                if ($location.protocol() == 'https') {
                    if (UtilsHelper.startWith(newValue, 'http://'))
                        newValue = UtilsHelper.replaceAll(newValue, 'http://', 'https://');
                    else if (UtilsHelper.startWith(newValue, 'ws://'))
                        newValue = UtilsHelper.replaceAll(newValue, 'ws://', 'wss://');
                }
            }
            return newValue;
        }

        function initAppParameters(parameters) {
            ctx._appParameters = parameters;
            for (var propertyName in ctx._appParameters) {
                ctx._appParameters[propertyName] = _replaceWildcardUrlValue(ctx._appParameters[propertyName]);
            }
        }

        function getAppParameter(key, defaultValue) {
            return;
            var value = undefined;
            if (ctx._appParameters)
                value = ctx._appParameters[key];

            if (value != undefined)
                return value;
            else if (value == undefined && defaultValue != undefined)
                return defaultValue;
            else
                throw new Error("Le paramètre " + key + " est indéfini");
        }

        function getAppParameters() {
            return ctx._appParameters;
        }
    };

})();