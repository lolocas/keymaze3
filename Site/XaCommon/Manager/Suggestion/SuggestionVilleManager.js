(function () {
    'use strict';

    angular.module('XaCommon').factory('SuggestionVilleManager', function (HELPER) {

        function SuggestionVilleManager() {
            this.datasource = [];

            var ctx = this;
            this.onChangeCP = function (value) {
                if (!HELPER.Utils.isEmpty(value))
                    HELPER.Api.callApiApplication('ville', 'getVilleFromCp', value).then(function (res) { ctx.datasource = res });
                else
                    ctx.datasource = [];
            };

            this.onChangeVille = function (val) {
                //ctx.datasource = [];
            };
        }

        return SuggestionVilleManager;
    });

})();

