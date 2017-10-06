 (function (window) {
    'use strict';

    if (!window.registerFrameworkModule) {

        window.registerFrameworkModule = function (name, dependencies) {

            if (!this.angular) {
                throw new Error('Angular not found. Did you forget to include it?');
            }

            this[name] = this[name] || this.angular.module(name, dependencies);

        }
    }
    
    window.registerFrameworkModule('XaNgFramework', ['ngSanitize',
        'XaNgFrameworkTextBox',
        'XaNgFrameworkTextArea',
        'XaNgFrameworkButtons',
        'XaNgFrameworkLoading',
        'XaNgFrameworkDatePicker',
        'XaNgFrameworkSelection',
        'XaNgFrameworkAccordion',
        'XaNgFrameworkTab',
        'XaNgFrameworkWindow',
        'XaNgFrameworkMultiButton',
        'XaNgFrameworkUtilities',
        'XaNgFrameworkComboBox',
        'XaNgTemplates',
        'XaNgFrameworkUtilities',
        'XaNgFrameworkServices',
        'XaNgFrameworkUpload',
        'XaNgFrameworkSearchBox', 
        'XaNgFrameworkButtonFilter',
        'XaNgFrameworkImageButton',
        'XaNgFrameworkCheckbox',
        'XaNgFrameworkDragAndDrop',
        'XaNgFrameworkSlickGrid',
        'XaNgFrameworkSplitter',
        'XaNgFrameworkImageCheckbox',
		'XaNgFrameworkImageServer',
        'XaNgFrameworkLabel',
        'XaNgFrameworkSimpleMenu',
        'XaNgFrameworkRadio',
        'XaNgFrameworkTimePicker',
        'XaNgFrameworkPhoneNumber',
        'XaNgFrameworkNumericTextBox',
        'XaNgFrameworkViewers',
        'XaNgFrameworkXmlData',
        'XaNgFrameworkInactivity',
        'XaNgFrameworkSlider',
        'XaNgFrameworkRadio',
        'XaNgFrameworkWidgetContainer',
        'XaNgFrameworkAutofocus',
        'XaNgFrameworkColorPicker',
        'XaNgFrameworkAutoheight'
    ]);

 	// The purpose of this decorator is to force template requests to lower-case so that
 	// incorrect casing will not end up throwing exceptions for production.
 	// On dev templates are loaded by http and thus casing errors can be missed.
	// html2js build tasks have been adjusted to build all in lower case.

	 angular.module('XaNgFramework').config(function($provide) {
	 	$provide.decorator("$templateCache", function ($delegate) {
	 		var origGetMethod = $delegate.get;
	 		$delegate.get = function (url) {
				if (!url) {
					throw new Error('Invalid template name: ' + url);
				}

				var target = url.toLowerCase();

				 return origGetMethod(target);
	 		};
	 		//return $delegate;

	 		var origPutMethod = $delegate.put;
	 		$delegate.put = function (url, promise) {
	 			if (!url) {
	 				throw new Error('Invalid template name: ' + url);
	 			}

	 			return origPutMethod(url.toLowerCase(), promise);
	 		};
	 		return $delegate;
	 	});
	 });

 })(window);