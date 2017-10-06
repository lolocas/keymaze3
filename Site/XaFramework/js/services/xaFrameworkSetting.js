(function (local) {
    'use strict';

    local.service('xaFrameworkSetting', xaFrameworkSetting)
       
    function xaFrameworkSetting($locale) {
    	/*Initialisation inactivité */
/*    	if (ctx.user.appParameters.SessionLifetime && ctx.user.appParameters.SessionLifetime > 0) {
    		$rootScope.inactivityOptions.timeout = ctx.user.appParameters.SessionLifetime;
    		$rootScope.inactivityOptions.start();
    	}*/


    	this.initParameters = initParameters;
    	this.UserRights = [];

    	function initParameters(data) {
    		this.AttachedFileMaxSize = data.AttachedFileMaxSize ||  '30';
    		this.TelephonyCountryCode = data.TelephonyCountryCode || 'FR';
    		this.LanguageCountryCode = data.LanguageCountryCode || 'fr';
    		this.DateFormat = data.DateFormat || 'dd/MM/yyyy';
    		this.SessionId = data.SessionId;
    		this.SeparateurDecimal = data.SeparateurDecimal || '.';
    		$locale.NUMBER_FORMATS.DECIMAL_SEP = this.SeparateurDecimal;
    		this.UserRights = (data && data.UserRights) ? data.UserRights : [];
    		this.UploadUrl = (data && data.UploadUrl) ? data.UploadUrl : null;
    		this.TestMode = (data && data.TestMode) ? data.TestMode : null;
    		this.CustomPeriods = (data && data.CustomPeriods) ? data.CustomPeriods : null;
    	}

    	this.getDateRegionalOptions = function (){
    		return $.datepick.regionalOptions[this.LanguageCountryCode];
    	}
    }

})(window.XaNgFrameworkServices);