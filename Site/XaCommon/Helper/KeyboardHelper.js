(function () {
    'use strict';

    angular.module('XaCommon').service('KeyboardHelper', KeyboardHelper);

    function KeyboardHelper(xaKeyboard) {
    	this.getContextCourant = getContextCourant;

        this.addShortcut = addShortcut;
        this.removeShortcut = removeShortcut;

        this.setContext = setContext;
        this.resetContext = resetContext;

        function getContextCourant() {
        	return xaKeyboard.getContext();
        }

        function setContext(ctxString) {
            xaKeyboard.setContext(ctxString);
        }

        function resetContext(ctxString) {
            xaKeyboard.resetContext(ctxString);
        }


        function addShortcut(keyString, ctx, func) {
            if (ctx)
            	xaKeyboard.bind(keyString, func, ctx);
            else
            	xaKeyboard.bind(keyString, func, ctx);
        }

        function removeShortcut(keyString, ctx) {
            if (ctx)
                xaKeyboard.unbind(keyString, ctx);
            else
            	xaKeyboard.unbind(keyString);
        }

    };

})();




