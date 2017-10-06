(function () {
    'use strict';

    angular.module('XaCommon').service('ToastHelper', ToastHelper)

    function ToastHelper(xaToaster, UtilsHelper) {

    	this.showToastInfo = showToastInfo;
    	this.showToastError = showToastError;
    	this.showToastWarning = showToastWarning;

    	function showToastInfo(title, body, clickFn,  timeout) {
    	    xaToaster.pop('info', title, body, timeout || 3000, null, clickFn);
    	}

    	function showToastError(title, body, clickFn, timeout) {
    		xaToaster.pop('error', title, body, timeout || 3000, null, clickFn);
    	}

    	function showToastWarning(title, body, clickFn, timeout) {
    		xaToaster.pop('warning', title, body, timeout || 3000, null, clickFn);
    	}
    
    };

})();