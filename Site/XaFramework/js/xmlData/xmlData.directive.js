(function (local) {
    'use strict';

	local.service('xmlDataHelper', function (xaTranslation, xaFrameworkSetting) {
        var requiredErr = xaTranslation.instant('TXT_XMLFIELD_REQ'); // 'Champ {0} is required!'
        var notNumericErr = xaTranslation.instant('TXT_XMLFIELD_NOTNUM'); // 'Champ {0} should be numeric!')
        var numericRangeErr = xaTranslation.instant('TXT_XMLFIELD_NUMRANGE'); // 'Champ {0} should be between {1} and {2}!'
        var numericMaxDecErr = xaTranslation.instant('TXT_XMLFIELD_MAXDEC'); // 'Champ {0} can have at most {1} decimals!'
        var notDateErr = xaTranslation.instant('TXT_XMLFIELD_NOTDATE'); // 'Valeur {0} pour champ {1} is not a date! Expected format is {0}
        var dateRangeErr = xaTranslation.instant('TXT_XMLFIELD_DATERANGE'); // 'Champ {0} should be between {1} and {2}!'
        var summaryErr = xaTranslation.instant('TXT_XMLFIELD_ERRSUMMARY'); // Please fix the following errors
        var confirmMsg = xaTranslation.instant('TXT_XMLFIELD_CONFIRMMSG'); // voulez vous continuer sans sauvguarder?

        var dateFormat = (xaFrameworkSetting.DateFormat || "dd/MM/yyyy").toUpperCase();

        return {
        	buildQueryString: function (queryStringObj) {
        		if (!queryStringObj) return '';
        		var result = '';
        		for (var propertyName in queryStringObj) {
        			if (result == "") result += "?"; else result += "&";
        			result += propertyName + '=' +queryStringObj[propertyName];
        		}
        		return result;
            },
            validateAndMergeFields: function (fieldVals, xmlFields, askConfirm) {
                if (fieldVals === false) //validation failed!
                {
                    return false; //stop at first error!?!?!
                }
                else //save results into data
                {
                    var valErrors = [];

                    //validate fields
                    fieldVals.forEach(function (dataField) {
                        var xmlField = _.find(xmlFields, function (xf) {
                            return xf.id == dataField.id || xf.id == dataField.name;
                        });

                        if (!xmlField) {
                            console.log('field not found in xmlfields: ', dataField);
                        }
                        else {
                            var fieldName = xmlField.name || xmlField.id;

                            //isRequired, lowRange, highRange, numerOfDecimals, valuetype
                            if (dataField.val == '' && xmlField.isRequired) {
                                valErrors.push(requiredErr.format(fieldName));
                            }
                            if (dataField.val != '' && ['N', 'D'].indexOf(xmlField.valueType) > -1) { //date or number: validate ranges
                                
                                if (xmlField.valueType == 'N') { //numeric
                                    var min= +xmlField.lowRange;
                                    var max = +xmlField.highRange;

                                    var numVal = +dataField.val.replace(",", '.');
                                    if(isNaN(numVal))
                                        valErrors.push(notNumericErr.format(fieldName));
                                    else if ((min && numVal < min) || (max && numVal > max))
                                        valErrors.push(numericRangeErr.format(fieldName, min, max));
                                    else
                                    {
                                        var numDec = (('' + numVal).split('.')[1] || []).length;
                                        if(numDec > xmlField.numberOfDecimals)
                                            valErrors.push(numericMaxDecErr.format(fieldName, xmlField.numberOfDecimals));
                                    }
                                }
                                else if (xmlField.valueType == 'D') {
                                    var min = xmlField.lowRange ? moment(xmlField.lowRange, dateFormat).toDate() : null;
                                    var max = xmlField.highRange ? moment(xmlField.highRange, dateFormat).toDate() : null;

                                    var dateVal = moment(dataField.val, dateFormat, true); //strict parse the date!
                                    if (!dateVal.isValid())
                                        valErrors.push(notDateErr.format(fieldName, dateFormat));
                                    else if ((min && dateVal < min) || (max && dateVal > max))
                                        valErrors.push(dateRangeErr.format(fieldName, moment(min).format(dateFormat), moment(max).format(dateFormat)));
                                }
                            }

                           
                        }
                    });
                    

                    if (valErrors.length > 0) {
                        var errMsg = summaryErr + " \n\n" + valErrors.join('\n') + '\n\n' + confirmMsg;
                        if (askConfirm) {
                            return confirm(errMsg);
                        }
                        else alert(errMsg);
                        return false;
                    }
                    else {
                    	//update values
                        fieldVals.forEach(function (dataField) {
                            var xmlField = _.find(xmlFields, function (xf) {
                                return xf.id == dataField.id || xf.id == dataField.name;
                            });
                            if (xmlField != null)
                            	xmlField.value = dataField.val;
                        });
                    }

                    return true;
                }
            }
        };
    })
        .directive('xmlData', function ($filter, $http, $sce, xaFrameworkSetting, xmlDataHelper, xaTranslation) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/xmlData/xmlData.tpl.html',
            scope: {
                xmlDataContent: '=xmlDataContent',
                contentHeight: '@contentHeight',
                contentWidth: '@contentWidth'
            },
            link: function (scope, element, attrs) {
                var queryStringObj = {};
                var queryString = "";
                var currSection = null;
                var currPage = null;

                var resetxmlDataContent = scope.$watch("xmlDataContent", function (newXmlData) {

                    if (!newXmlData && !newXmlData.sections) {
                        element.empty();
                        return;
                    }

                    queryStringObj = newXmlData.queryStringObj;
                    queryString = xmlDataHelper.buildQueryString(queryStringObj);

                
                    newXmlData.saveCurrent = saveCurrent;

                    var rawData = newXmlData.sections;


                    $("ul.masterTabs", element).empty();
                    $("div.tabMasterContent ul", element).empty();
                    $("div.htmlContent", element).empty();

                    if (scope.xmlDataContent.forceReadonly)
                    	_.forEach(scope.xmlDataContent.sections, function (item) { item.isReadOnly = true });

                    if (scope.xmlDataContent.hideMasterTabs)
                    {

                    }
					else
	                    buildSectionTabs(rawData);
                    
					// Initial Section 
                    var initialSection = 0;
                    for (var i = 0; i<newXmlData.sections.length; i++) {
                    	if (newXmlData.sections[i].type == newXmlData.initialSection) {
                    		initialSection = i;
                    		break;
                    	}
                    }

                    switchMasterTab(initialSection);
                });

                function buildSectionTabs(sectionList) {
                    for (var idx = 0; idx < sectionList.length; idx++) {

                        var section = sectionList[idx];

                        if (section && section.html) {
                            $("ul.masterTabs", element).append('<li><a class="xang xa-form-button" data-idx="' + idx + '" href="javascript:void(0)"><div class="back">' + xaTranslation.instant( 'TXT_XML_DATATYPE_' + section.type.toUpperCase()) + '</div></a></li>');
                        }
                    }
                }

                var saveCurrent = function (allowSwitch) {
					// We need to manipulate a dom object not a jquery one.
                	var ifr = $('iframe', element)[0];
                    var fieldVals = saveIFrameFields(ifr);

                    if (currSection.isReadOnly) return true;

                    var res = xmlDataHelper.validateAndMergeFields(fieldVals, currSection.xmlFields, allowSwitch);

                    if (res === false) //validation failed somewhere
                    {
                        return false;
                    }
                    return true;
                }

                var buildPageTabs = function () {
                    $("ul.childTabs", element).empty();
                    var idx = 0;

					//sortir si aucune grille xml n'est fourni
                    if (!currSection)
                    	return;

                    for (var idx = 0; idx < currSection.html.length; idx++) {
                        var page = currSection.html[idx];
                        
                        $("ul.childTabs", element).append('<li role="presentation"><a data-idx="' + idx + '" href="javascript:void(0)">' + page.name + '</a></li>');
                    }

                    switchChildTab(0);
                };

                var validateIFrame = function (iframe) {
                    var result = true;
                    var content = iframe.contentWindow || iframe;

                    if (typeof content.fctValider != 'undefined') {
                        result = content.fctValider(); //return false: stay on the tab
                    }
                    else if (typeof content.ValidationGlobale != 'undefined') {
                        result = content.ValidationGlobale(); //return false: stay on the tab
                    }

                    return result;
                };

                var initIFrame = function () {
                    var $iframeContainer = $('.htmlContent', element);
                    $iframeContainer.empty();

                    var iframe = document.createElement('iframe');
                    iframe.id = "xmlDataContainer";
                    iframe.frameBorder = "0";
                    iframe.setAttribute("frameBorder", "0");
                    iframe.className = 'inheritFit';
                    //iframe.height = scope.contentHeight || "380px";
                	iframe.onload = function () {
                        //Injection Html
                		var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        iframeDoc.write(currPage.html);
                		/* 
						iframeDoc.queryString = queryString;
                        iframeDoc.queryStringObj = queryStringObj;
						*/

                        iframeDoc.getCustomData = function (field, table, where) {
                        	try {
                        		var xmlhttp = new XMLHttpRequest();
                        		xmlhttp.open("GET", "./application/api/XmlData/GetCustomData/?table=" + table + "&field=" + field + "&where=" + where + "&sessionid=" + xaFrameworkSetting.SessionId, false);
                        		xmlhttp.setRequestHeader('Accept', 'application/json');
                        		xmlhttp.send();

                        		return eval(xmlhttp.responseText);
                        	}
                        	catch (ex) {
                        		throw Error("Erreur lors de l'appel GetGustomData table=" + table + "&field=" + field + "&where=" + where + "&sessionid=" + xaFrameworkSetting.SessionId);
                        	}

                        }

                        iframeDoc.getParameter = function (field) {
                        	if (queryStringObj && queryStringObj[field])
                        		return queryStringObj[field];

                        	return '';
                        }

                    
                        loadIFrameFields(currSection.xmlFields, iframe, currSection.isReadOnly);

                  
                        var content = iframe.contentWindow || iframe;
						if (typeof content.AfterWindowOnload != 'undefined') {
                        	content.AfterWindowOnload();
                        };

                     
                    }
                	$iframeContainer[0].appendChild(iframe);
                	if (!currSection.isReadOnly)
	                	iframe.contentWindow.focus();

                };

                var saveIFrameFields = function (ifr) {
                    if (!validateIFrame(ifr)) return false;
                    
                    var fieldVals = [];

                    var $ifrInput = $(ifr).contents().find('input, select, textarea');

                    $ifrInput.each(function () {
                        var fieldValue = "";

                        var tagName = $(this).prop("tagName").toLowerCase();
                        if (tagName == "input") {
                            var fieldType = ($(this).attr("type") || 'text').toLowerCase();
                            if (fieldType == "text" || fieldType == "date") {
                                //Texte simple
                                fieldValue = $(this).val();
                            }
                            else if (fieldType == "radio") {
                                //RadioButton
                                if ($(this).is(":checked")) fieldValue = $(this).val();
                                else fieldValue = '';
                                //raul update: YES we need, because this field will be validated!!! no need to update radio to unckecked. If it had a value, it still has one. Otherwise, worse case, had no value and will have no value, which is fine.
                            }
                            else if (fieldType == "checkbox") {
                                //CheckBox	
                                if ($(this).is(":checked")) fieldValue = "O";
                                else fieldValue = "N";
                            }
                        }
                        else if (tagName == "textarea") {
                            //Texte Multiligne
                            fieldValue = $(this).val();
                            fieldValue = fieldValue.replace(/\r\n/g, "\n");
                            fieldValue = fieldValue.replace(/\n\r/g, "\n");
                            fieldValue = fieldValue.replace(/\n/g, "\\n");
                        }
                        else if (tagName == "select") {
                            //ComboBox
                            fieldValue = $(this).val();
                        }

                        var id = $(this).attr('id'),
                            name = $(this).attr('name');

                        var fval = _.find(fieldVals, function (v) {
                            return (id && v.id == id) || (name && v.name == name);
                        });
                        if (!fval) {
                            fval = { id: id, name: name, val: fieldValue };
                            fieldVals.push(fval);
                        }
                        else if (!fval.val && fieldValue) { //existing value, just update val if empty
                            fval.val = fieldValue;
                        }

                        
                    });

                    return fieldVals;
                }

                var loadIFrameFields = function (datas, iframe, isRO) {
                    var xmlfields = datas;
                  
                    $(iframe).contents().find('input, select, textarea').each(function () {
                        var fieldValue = null;
                        //search by ID
                        var res = null;
                        var id = $(this).attr('id'),
                            name = $(this).attr('name');

                        if (id) res = $filter("filter")(xmlfields, function (rw) { return rw.id === id });

                        if (!res || res.length == 0) res = $filter("filter")(xmlfields, function (rw) { return rw.id === name });

                        if (res && res.length > 0) fieldValue = res[0].value;

                        if (fieldValue != null) {
                            var cleanedVal = fieldValue.trim()
                                                .replace(/\\r/g, "\r")
                                                .replace(/\\n/g, "\n")
                                                .replace(/\n\r/g, "\n")
                                                .replace(/\r\n/g, "\n")
                                                .replace(/\n/g, "\r\n");

                            var tagName = $(this).prop("tagName").toLowerCase();

                            if (tagName == "input") {
                                var fieldType = ($(this).attr("type") || 'text').toLowerCase();
                                if (fieldType == "text" || fieldType == "date") {
                                    $(this).val(cleanedVal);
                                }
                                else if (fieldType == "radio" && cleanedVal) {
                                    var radVal = $(this).val().toLowerCase();
                                    $(this).prop("checked", cleanedVal.toLowerCase() == radVal);
                                }
                                else if (fieldType == "checkbox" && cleanedVal) {
                                    //CheckBox
                                    $(this).prop("checked", cleanedVal.toLowerCase() == "o");
                                }

                            }
                            else if (tagName == "textarea") {
                                //Texte Multiligne
                                $(this).val(cleanedVal);
                            }
                            else if (tagName == "select") {
                                //ComboBox
                                if (cleanedVal.indexOf(";") > -1) {
                                    //Valeur avec index
                                    var selIdx = cleanedVal.split(";")[0];
                                    $(this)[0].selectedIndex = selIdx;
                                }
                                else {
                                    //Compatibilité avec les anciennes grilles saisie en web qui ne prennaient pas l'index en compte
                                    if ($('option[value="' + cleanedVal + '"]', $(this)).length == 0)
                                        $(this).append(new Option(cleanedVal, cleanedVal));

                                    $(this).val(cleanedVal);
                                }
                            }
                        }
                    });

                    //isRO?
                    if(isRO)
                        $(iframe).contents().find('input, select, textarea').prop("disabled", true);
                };

                var switchMasterTab = function (idx, validate) {
                    if (validate) {
                        var ifr = $('iframe', element);
                        var saveResult = saveCurrent(true);
                        if (!saveResult) {
                            return;
                        }
                    }

                    $("ul.masterTabs > li > a", element).removeClass("selected");

                    $("ul.masterTabs > li > a[data-idx='" + idx + "']", element).addClass("selected");

                    currSection = scope.xmlDataContent.sections[idx];
                    buildPageTabs(); //
                }
                var switchChildTab = function (idx, validate) {
                    if (validate) {
                        var ifr = $('iframe', element);
                        var saveResult = saveCurrent(true);
                        if (!saveResult) {
                            return;
                        }
                    }

                    $("ul.childTabs li", element).removeClass("active");
                    $("ul.childTabs li a", element).removeClass("active");

                    $("ul.childTabs li a[data-idx='" + idx + "']", element).addClass("active").closest("li").addClass('active');

                    currPage = currSection.html[idx];
                    initIFrame();                   
                }

                element.on('click', "ul.masterTabs li a", function () {
                    switchMasterTab($(this).data("idx"), true);
                });

                element.on('click', "ul.childTabs li a", function () {
                    switchChildTab($(this).data("idx"), true);
                });

                element.on('click', ".printContainer", function () {

                	var iframe = window.frames["xmlDataContainer"];

                	if (!iframe)
                		return;

                	iframe = iframe.contentWindow || iframe;
                	try {
                		if (!iframe.document.execCommand('print', false, null))
                			iframe.print();
                	} catch(e) {
                		iframe.print();
                	}
                });

                scope.$on('$destroy', function () {
                    scope.xmlDataContent.save = null;
                    resetxmlDataContent();
                    element.off('click');

                    element.empty();
                });
            }
        }
    });
})(window.XaNgFrameworkXmlData);