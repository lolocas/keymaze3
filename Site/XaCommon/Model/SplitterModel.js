(function () {
	'use strict';
	
angular.module('XaCommon')

    .factory('SplitterConfigModel', function (HELPER) {

    	function SplitterConfigModel(key, defaultValue) {
    		var ctx = this;
    		this.saveSplitterPosition = saveSplitterPosition;
    		this.loadSplitterPosition = loadSplitterPosition;
    		this.key = key;
    		this.defaultValue = defaultValue ||'50%';

    		function loadSplitterPosition(forceDefault) {
    			if (forceDefault)
    				return defaultValue;
				else
    				return HELPER.User.getPreference("SPLITTER", ctx.key, ctx.defaultValue);
    		}

    		function saveSplitterPosition(value) {
    			HELPER.User.setPreference("SPLITTER", ctx.key, value);
    		}
    	}
    	return SplitterConfigModel;
    });

})();