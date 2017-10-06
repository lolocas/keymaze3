(function (local) {
    'use strict';

    local.service('xaDirectiveHelper', function ($rootScope, xaFrameworkSetting) {
    	var entityMap = {
    		"&": "&amp;",
    		"<": "&lt;",
    		">": "&gt;",
    		'"': '&quot;',
    		"'": '&#39;',
    		"/": '&#x2F;'
    	};

    	function escapeHtml(string) {
    		return String(string).replace(/[&<>"'\/]/g, function (s) {
    			return entityMap[s];
    		});
    	}

    	function textToHtml(text) {
    		if (text)
    			return String(escapeHtml(text)).replace(/\n/g, "<br/>");
    		else
    			return '';
    	}

    	function setTestIdOnElement (control, prefixe, modelName) {
    		if (xaFrameworkSetting.TestMode === true && modelName && !control.attr('test-id')) {
    			control.attr('test-id',getTestId(prefixe, modelName) )
    			}
    		};

    	function getTestId(prefixe, modelName) {
    		if (!xaFrameworkSetting.TestMode)
    			return '';

    		var tmp = modelName.split('.');
    		var id = '';
    		if (tmp.length > 3)
    			id = tmp[tmp.length - 2] + '_'+ tmp[tmp.length - 1];
    		else
    			id = tmp[tmp.length - 1].replace('TXT_', '');

    		return prefixe + id.toUpperCase();
    	}

    	function getTestIdWithAttribute(id) {
    		if (!xaFrameworkSetting.TestMode || !id)
    			return ''

    		return ' test-id="' + id + '"';
    	
    	}

    	function removeErrorTooltip(element) {
    		$('.has-err-tooltip, .has-error', element).andSelf().each(function () {
    			$(this).removeClass('has-err-tooltip').removeClass('has-error').tooltip("destroy");
    		});
    	}



    	return {
    		setTestIdOnElement: setTestIdOnElement,
    		getTestId: getTestId,
    		getTestIdWithAttribute: getTestIdWithAttribute,
    		removeErrorTooltip: removeErrorTooltip,
    		textToHtml: textToHtml
	    };
    });

})(window.XaNgFrameworkServices);