(function(local) {
	'use strict';
	local.directive('xaLabelData', function (xaTranslation) {

	    return {
	        restrict: 'EA',
	        replace: true,

	        scope: {
	            inputValue: '=',
	        },

	        template: function (elem, attr) {
	        	var cssClass = "xaLabelData";
	        	var title = "";

	            if (attr.isLabel == "true")
	                cssClass = "xaLabel";

	            if (attr.titleKey)
	            	title = ' title="' + xaTranslation.instant(attr.titleKey) + '"';

	            if (attr.position == 'right' || (attr.position == undefined && ['Montant', 'Nombre', 'NombreEntier'].indexOf(attr.type) > -1))
	                cssClass += " edl-right";

	            if (attr.keepSpaces) {
	                return '<pre class="' + cssClass + '">{{ inputValue }}</pre>';
	            }
	            else if (!attr.type)
	                return '<div class="' + cssClass + '" ' + title + '>{{ inputValue }}</div>';
	            else if (attr.type == "BooleanToImage" || attr.type == "Html")
	            	return '<div class="' + cssClass + '" ng-bind-html="inputValue | XaFilter' + attr.type + ':' + attr.typearg + '" ' + title + '></div>';
	            else {
	            	var typearg = (attr.type == 'ValeurToLibelle') ? "\'" + attr.typearg + "\'" : attr.typearg;
	            	return '<div class="' + cssClass + '" ' + title + '>{{ inputValue | XaFilter' + attr.type + ':' + typearg + ' }}</div>';
	            }
	        }
	    };
	});







})(window.XaNgFrameworkLabel);