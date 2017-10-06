(function () {
	'use strict';
	
angular.module('XaCommon')

    .factory('UploadConfigModel', function (HELPER) {

    	function UploadConfigModel(src) {
    		this.hidden = src ? src.hidden  : true;
    		this.dropZoneHeight = src ? src.dropZoneHeight  : undefined;
    		this.allowExtensions = src ? src.allowExtensions : undefined;
    		this.isMultiple = src ? src.isMultiple  : false;
    		this.maxSize = src ? src.maxSize : undefined;
    		this.handlers = {};
    	}
    	return UploadConfigModel;
    });

})();