(function () {
    'use strict';

    angular.module('XaCommon').service('PushServerService', PushServerService);

    function PushServerService($q, $http, $rootScope, $timeout, xaLoadingService, ParametersService, ArrayHelper, UtilsHelper, DialogHelper, UrlHelper) {

        var ctx = this;
        this.server = null;
        this.connectionId = null;
        this.events = [];
        this.isServerConnected = false;

        this.connect = connect;
        this.disconnect = disconnect;

        this.isConnected = isConnected;
        this.serverIsConnected = serverIsConnected;

        this.addFunctionOnPush = addFunctionOnPush;
        this.addFunctionOnPushWithoutSubscribe = addFunctionOnPushWithoutSubscribe;
        this.removeFunctionOnPush = removeFunctionOnPush;

        var requestActions = {
            subscribe: 0,
            unsubscribe: 1
        };

        var responseType = {
            identify: 0,
            publish: 1,
            ping: 2
        };

        function isConnected() {
            return ctx.server != null && ctx.connectionId != null && ctx.server.readyState == ctx.server.OPEN;
        }

        function serverIsConnected() {
            return ctx.isServerConnected;
        }

        function addFunctionOnPushWithoutSubscribe(topic, fn, groups) {
            ArrayHelper.addItemsIfNotExist(ctx.events, [{ topic: topic, fn: fn }], 'key', true);
        }

        function addFunctionOnPush(topic, fn, groups) {
            if (ctx.server != null) {
                ctx.server.send(JSON.stringify({ action: requestActions.subscribe, messageData: JSON.stringify({ connectionId: ctx.connectionId, application: ParametersService.getAppParameter('ApplicationModuleCode'), topic: topic, groups: groups }) }));
                ArrayHelper.addItemsIfNotExist(ctx.events, [{ topic: topic, fn: fn }], 'key', true);
            }
        }

        function removeFunctionOnPush(topic, groups) {
            if (ctx.server != null) {
                ctx.server.send(JSON.stringify({ action: requestActions.unsubscribe, messageData: JSON.stringify({ connectionId: ctx.connectionId, application: ParametersService.getAppParameter('ApplicationModuleCode'), topic: topic, groups: groups }) }));
                ArrayHelper.removeItemFromProperty(ctx.events, 'topic', topic);
            }
        }

        function connect(url, username, sessionId) {
            var def = $q.defer();
            var isConnecting = true;
            var isError = false;
            xaLoadingService.show();
            UtilsHelper.setLoadingMessage(UtilsHelper.getLabel('TXT_CONNEXION_PUSH_SERVER'));

            if (!UtilsHelper.isEmptyOrWhitespace(url)) {
                ctx.server = new WebSocket(url + '?username=' + username + '&application=' + ParametersService.getAppParameter('ApplicationModuleCode') + '&session=' + sessionId);
                ctx.server.onmessage = function (event) {
                    var response = JSON.parse(event.data);
                    if (response.action == responseType.identify) {
                        //Réponse a la demande d'identification
                        ctx.connectionId = response.messageData;

                        addFunctionOnPush('PushProgress', function (data) {
                            UtilsHelper.setLoadingMessage(data.message);
                            $rootScope.$apply();
                        });

                        addFunctionOnPush('PushDisconnect', function (data) {
                            DialogHelper.showErrorMessage('TXT_ERREUR', UtilsHelper.getLabel('TXT_ARRET_SERVEUR'), { hideClose: true });
                            $rootScope.$apply();
                        });

                        xaLoadingService.hide();
                        UtilsHelper.setLoadingMessage('');

                        return _declarePushStatusToServer(true, def);
                    }
                    else if (response.action == responseType.publish) {
                        var publishData = JSON.parse(response.messageData);
                        var event = ArrayHelper.findFirstFromProperty(ctx.events, 'topic', publishData.topic);
                        if (event && event.fn)
                            event.fn(publishData.data, publishData.topic);
                    }
                    else if (response.action == responseType.ping) {
                        console.log('Push / PING from server');
                    }
                    else {
                        throw new Error("Push / Action inconnue / " + response.action);
                    }
                }
                ctx.server.onopen = function (event) {
                    isConnecting = false;
                }
                ctx.server.onclose = function (event) {
                    if (isError) {
                        // See http://tools.ietf.org/html/rfc6455#section-7.4.1
                        var reason = "Unknown reason";
                        if (event.code == 1000)
                            reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
                        else if (event.code == 1001)
                            reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
                        else if (event.code == 1002)
                            reason = "An endpoint is terminating the connection due to a protocol error";
                        else if (event.code == 1003)
                            reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
                        else if (event.code == 1004)
                            reason = "Reserved. The specific meaning might be defined in the future.";
                        else if (event.code == 1005)
                            reason = "No status code was actually present.";
                        else if (event.code == 1006)
                            reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
                        else if (event.code == 1007)
                            reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
                        else if (event.code == 1008)
                            reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
                        else if (event.code == 1009)
                            reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
                        else if (event.code == 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                            reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
                        else if (event.code == 1011)
                            reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
                        else if (event.code == 1015)
                            reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";

                        console.log('Push / Error / ' + reason); //On garde le log sur les erreurs
                        isError = false;
                    }
                }
                ctx.server.onerror = function (event) {
                    isError = true;
                    if (isConnecting === true) {
                        isConnecting = false;
                        xaLoadingService.hide();
                        UtilsHelper.setLoadingMessage('');
                        ctx.server = null;
                        def.resolve(true);
                    }
                }
            }
            else {
                isConnecting = false;
                xaLoadingService.hide();
                UtilsHelper.setLoadingMessage('');
                ctx.server = null;
                def.resolve(true);
            }

            return def.promise;
        }

        function disconnect() {
            if (this.isConnected()) {
                ctx.server.close();
                ctx.server = null;
                return _declarePushStatusToServer(false);
            }
            else {
                var def = $q.defer();
                def.resolve(true);
                return def.promise;
            }
        }

        function _declarePushStatusToServer(connected, existingPromise) {
            var def = (existingPromise ? existingPromise : $q.defer());
            $http.get(UrlHelper.getUrlApiApplication('user', (connected ? 'DeclarePushConnected' : 'DeclarePushDisconnected'), ctx.connectionId ? ctx.connectionId : 'fake'))
                .success(function (result) {
                    ctx.isServerConnected = !!result;
                    def.resolve(true);
                })
                .error(function (result) {
                    ctx.isServerConnected = false;
                    def.reject(false);
                });
            return def.promise;
        };
    };

})();