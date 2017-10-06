(function () {
    'use strict';

    angular.module('XaCommon').service('PushHelper', PushHelper);
    function PushHelper(PushServerService, ApiHelper) {

        this.addFunctionOnServerPush = addFunctionOnServerPush;
        this.removeFunctionOnServerPush = removeFunctionOnServerPush;
        this.isConnectedServerPush = isConnectedServerPush;
        this.isClientConnected = isClientConnected;

        function addFunctionOnServerPush(pushName, fn, registeredFromServer, pushVerrouName, fnVerrou, groups) {
            if (registeredFromServer != true)
                PushServerService.addFunctionOnPush(pushName, fn, groups);
            else
                PushServerService.addFunctionOnPushWithoutSubscribe(pushName, fn, groups);

            if (pushVerrouName && fnVerrou)
                PushServerService.addFunctionOnPush(pushVerrouName, fnVerrou);
        }

        function removeFunctionOnServerPush(pushName, fn, pushVerrouName, fnVerrou) {
            PushServerService.removeFunctionOnPush(pushName);
            if (pushVerrouName)
                PushServerService.removeFunctionOnPush(pushVerrouName);
        }

        function isConnectedServerPush() {
            return PushServerService.isConnected() && PushServerService.serverIsConnected();
        }

        function isClientConnected() {
            return PushServerService.isConnected();
        }
    };
})();




