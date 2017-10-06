(function () {
    'use strict';

    angular.module('XaCommon').config(function ($stateProvider, $urlRouterProvider, ConfConst) {
        $stateProvider
            .state('Main', {
                url: '/UserLogin/',
                templateUrl: 'XaCommon/ViewInternal/UserLogin/UserLogin-View.html',
                controller: 'UserLoginController as vm'
            })
    });

    angular.module('XaCommon').factory('UserLoginFormModel', function () {

        function UserLoginFormModel() {
        };
        return UserLoginFormModel;
    });

    angular.module('XaCommon').controller('UserLoginController', UserLoginController);
    function UserLoginController(HELPER, UserLoginFormModel) {

        var vm = this;

        HELPER.Api.callApiLocal('Local', 'OpenDataBase').then(function (result){
            HELPER.Form.openMainScreen('MainPage');
        });
    }
})();
