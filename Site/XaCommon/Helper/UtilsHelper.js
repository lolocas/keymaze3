(function () {
    'use strict';

    angular.module('XaCommon').service('UtilsHelper', UtilsHelper);

    function UtilsHelper($q, $rootScope, $timeout, $document, $sce, dialogs, xaTranslation, xaTouch, xaPeriodService, xaFrameworkSetting, xaTelephonyService) {

        this.convertToType = convertToType;
        this.convertArrayToType = convertArrayToType;
        this.convertSubArrayToType = convertSubArrayToType;
        this.convertTdbArrayToType = convertTdbArrayToType;
        this.convertObjectOrArrayToType = convertObjectOrArrayToType;
        this.convertToDate = convertToDate;
        this.extendPropFrom = extendPropFrom;
        this.removeEmptyProperties = removeEmptyProperties;
        this.clearProperties = clearProperties;
        this.objGetKeys = objGetKeys;
        this.jsonToObject = jsonToObject;
        this.objectToJson = objectToJson;
        
        this.cloneObject = cloneObject;
        this.getItem = getItem;
        this.getItemToBool = getItemToBool;

        this.dateDayString = dateDayString;
        this.dateTodayIsInPeriod = dateTodayIsInPeriod;
        this.dateIsInPeriod = dateIsInPeriod;
        this.dateToday = dateToday;
        this.dateEmpty = dateEmpty;
        this.dateMax = dateMax;
        this.dateEqual = dateEqual;
        this.dateIsInferieur = dateIsInferieur;
        this.dateIsSuperieur = dateIsSuperieur;
        this.dateIsEmpty = dateIsEmpty;
        this.isDate = isDate;
        this.daysBetween = daysBetween;
        this.monthsBetween = monthsBetween;
        this.dateAddDays = dateAddDays;
        this.getAge = getAge;
        this.getAgeInYears = getAgeInYears;
        this.dateAddMinutes = dateAddMinutes;
        this.dateAddHours = dateAddHours;
        this.dateAddDays = dateAddDays;
        this.dateSetTime = dateSetTime;
        this.dateDiff = dateDiff;
        this.dateConvertDDMMYYYY = dateConvertDDMMYYYY;

        this.periodUpdate = periodUpdate;
        this.periodAllDate = periodAllDate;
        this.periodToday = periodToday;

        this.isUndefined = isUndefined;
        this.isFunction = isFunction;
        this.hasProperties = hasProperties;
        this.isArray = isArray;
        this.isObject = isObject;
        this.isString = isString;
        this.isDarkColor = isDarkColor;

        this.timeAddHours = timeAddHours;
        this.timeAddMinutes = timeAddMinutes;
        this.timeAddDurations = timeAddDurations;
        this.timeSubstractDurations = timeSubstractDurations;

        this.isEmpty = isEmpty;
        this.isInValues = isInValues;
        this.isEmptyOrWhitespace = isEmptyOrWhitespace;
        this.endsWith = endsWith;
        this.addLeadingZero = addLeadingZero;
        this.padRight = padRight;
        this.startWith = startWith;
        this.containString = containString;
        this.replaceAll = replaceAll;
        this.replaceAt = replaceAt;
        this.cleanUpSpecialChars = cleanUpSpecialChars;
        this.containStringComma = containStringComma;

        this.getValueOrDefault = getValueOrDefault;
        this.getLabel = getLabel;
        this.getLabelIfStartWithTxt = getLabelIfStartWithTxt;
        this.getLabelFormat = getLabelFormat;
        this.getGuid = getGuid;
        //	this.runMultiple = runMultiple;
        this.runPromiseMultiple = runPromiseMultiple;
        this.emptyPromise = emptyPromise;
        this.setLoadingMessage = setLoadingMessage;
        this.getIntervalStringFromNow = getIntervalStringFromNow;


        this.browserCanViewPdf = browserCanViewPdf;
        this.browserSupportsDataUri = browserSupportsDataUri;
        this.PreventMultiExecution = PreventMultiExecution;
        this.setPageTitle = setPageTitle;
        this.delayExecutionFn = delayExecutionFn;
        this.paramToString = paramToString;
        this.textToHtml = textToHtml;

        this.isTouchDevice = isTouchDevice;
        this.throwClientBusinessException = throwClientBusinessException;

        this.getValueFromStringProperty = getValueFromStringProperty;
        this.setValueFromStringProperty = setValueFromStringProperty;
        this.forceRefreshView = forceRefreshView;

        this.appendValueAtCursorPosition = appendValueAtCursorPosition;
        this.uploadOpenFileBrowserAndApplyFn = uploadOpenFileBrowserAndApplyFn;
        this.uploadSetApplyAndDropFn = uploadSetApplyAndDropFn;

        this.toTSInterface = toTSInterface;

        this.saveImageFromBase64 = saveImageFromBase64;

        this.getPhoneNumberInternational = getPhoneNumberInternational;
        this.openHtmlLinkFromUrl = openHtmlLinkFromUrl;

        this.copyToClipboard = copyToClipboard;
        this.openMailBoxTo = openMailBoxTo;
        this.focusControlWithId = focusControlWithId;
        this.loadLibraries = loadLibraries;
        this.prepareHtmlForBinding = prepareHtmlForBinding;

        var ctx = this;

        function uploadOpenFileBrowserAndApplyFn(uploadOptions, fn, allowExtensions, isMultiple) {
            if (!uploadOptions.handlers)
                throw new Error("Invalid uploadOptions provided cannot see the handlers on it.")
            uploadOptions.handlers.onSuccess = fn;
            uploadOptions.handlers.openFileBrowser(allowExtensions, isMultiple);
        }


        function uploadSetApplyAndDropFn(uploadOptions, fn, allowExtensions, isMultiple, dropZoneHeight) {
            uploadOptions.handlers.onSuccess = fn;
            uploadOptions.allowExtensions = allowExtensions;
            uploadOptions.dropZoneHeight = dropZoneHeight;
            uploadOptions.isMultiple = isMultiple;
        }

        function getValueFromStringProperty(value, key) {
            var indice = key.indexOf('.');
            if (value == null)
                return null;
            else if (indice > 0)
                return getValueFromStringProperty(value[key.substring(0, indice)], key.substring(indice + 1));
            else {
                if (key.substring(key.length - 2) == "()")
                    return value[key.substring(0, key.indexOf("("))]();
                else
                    return value[key];
            }
        };

        function setValueFromStringProperty(value, key, newValue) {
            var indice = key.indexOf('.');
            if (value == null)
                return null;
            else if (indice > 0)
                setValueFromStringProperty(value[key.substring(0, indice)], key.substring(indice + 1), newValue);
            else {
                value[key] = newValue;
            }
        };


        function throwClientBusinessException(message) {
            var result = {};
            result.type = 'ClientBusinessException'
            result.message = message;
            throw result;
        };


        function getLabelIfStartWithTxt(text) {
            if (startWith(text, 'TXT_'))
                return getLabel(text);
            else
                return text;
        }

     

        function getItem(p_strString, p_intIndex, p_strSeparator, p_blnThrowErrors) {

            if (isEmpty(p_strSeparator))
                p_strSeparator = ";";
            if (isEmpty(p_blnThrowErrors))
                p_blnThrowErrors = true;
            if (isEmpty(p_strString)) {
                if (!p_blnThrowErrors)
                    return;
                else
                    throw new Error("getItem:chaine d'entrée vide");
            }
            var l_tabItems = p_strString.split(p_strSeparator);
            if (p_intIndex >= 0 && p_intIndex < l_tabItems.length) {
                return l_tabItems[p_intIndex];
            }
            else {
                if (p_blnThrowErrors)
                    throw new Error("getItem:L'index est en dehors de la plage.");
                else
                    return '';
            }
        }

        function getItemToBool(p_strString, p_intIndex, p_strSeparator, p_blnThrowErrors) {
            var l_strItem = getItem(p_strString, p_intIndex, p_strSeparator, p_blnThrowErrors);
            if (l_strItem == "1" || l_strItem == "-1")
                return true;
            return false;
        }

        function textToHtml(text) {
            if (text)

                return String(text)
						.replace(/&/g, '&amp;')
						.replace(/"/g, '&quot;')
						.replace(/'/g, '&#39;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;')
						.replace(/\n/g, "<br/>");

            else
                return '';
        }


        function paramToString(param) {
            if (isUndefined(param)) return '';

            if (isArray(param) || isObject(param)) {
                return encodeURIComponent(objectToJson(param));
            }
            else
                return param;
        }

        function PreventMultiExecution(fn) {
            // Debounce remonter à 500 pour quand on laisse appuyer sur bas, exécution unique.
            return firstAndLastDebounce(fn, 500);

        }

        function firstAndLastDebounce(func, wait) {
            var timeout, args, context, timestamp, result, callAfterFirst;

            var later = function () {
                var last = _.now() - timestamp;
                if (last < wait && last >= 0) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (callAfterFirst) {
                        result = func.apply(context, args);
                        if (!timeout) context = args = null;
                    }
                }
            };

            return function () {
                context = this;
                args = arguments;
                timestamp = _.now();
                var callNow = !timeout;
                callAfterFirst = (timeout != null);
                if (!timeout) timeout = setTimeout(later, wait);
                if (callNow) {
                    result = func.apply(context, args);
                    context = args = null;
                }

                return result;
            };
        };

        function isString(value) {
            if (typeof value == 'string' || value instanceof String)
                return true;
            else
                return false;
        }

        function dateIsEmpty(date) {
            return isEmpty(date) || date == '0001-01-01T00:00:00' || +date == +Date.parse('0001-01-01T00:00:00');
        }


        function convertToDate(a) {
            var date = new Date(a);
            date.setHours(0, 0, 0, 0);
            return date;
        }

        function dateIsSuperieur(a, b, includeEqual) {
            var date1 = dateIsEmpty(a) ? new Date('0001-01-01T00:00:00') : convertToDate(a);
            var date2 = dateIsEmpty(b) ? new Date('0001-01-01T00:00:00') : convertToDate(b);

            var result = date1 > date2;
            if (result == false && includeEqual == true)
                return +date1 == +date2;

            return result;
        }

        function dateIsInferieur(a, b, includeEqual) {
            var date1 = dateIsEmpty(a) ? new Date('0001-01-01T00:00:00') : convertToDate(a);
            var date2 = dateIsEmpty(b) ? new Date('0001-01-01T00:00:00') : convertToDate(b);

            var result = date1 < date2;
            if (result == false && includeEqual == true)
                return +date1 == +date2;

            return result;

        }

        function dateEqual(a, b) {
            var date1 = dateIsEmpty(a) ? new Date('0001-01-01T00:00:00') : convertToDate(a);
            var date2 = dateIsEmpty(b) ? new Date('0001-01-01T00:00:00') : convertToDate(b);

            return +date1 == +date2;
        }

        this._weekDay = ['TXT_DIMANCHE', 'TXT_LUNDI', 'TXT_MARDI', 'TXT_MERCREDI', 'TXT_JEUDI', 'TXT_VENDREDI', 'TXT_SAMEDI'];
        function dateDayString(date) {
            return getLabel(this._weekDay[(new convertToDate(date)).getDay()]);
        }

        function dateTodayIsInPeriod(debut, fin, dateToCompare) {
            var date1 = dateIsEmpty(debut) ? new Date('0001-01-01T00:00:00') : convertToDate(debut);
            var date2 = dateIsEmpty(fin) ? new Date('9999-12-31T00:00:00') : convertToDate(fin);
            var today = dateIsEmpty(dateToCompare) ? dateToday() : convertToDate(dateToCompare);
            return +date1 <= +today && +today <= +date2;
        }

        function dateIsInPeriod(dateToCompare, debut, fin) {
        	return dateTodayIsInPeriod(debut, fin, dateToCompare)
        }


        function dateToday() {
            var date1 = new Date();
            date1.setHours(0, 0, 0, 0);
            return date1;
        }

        function dateEmpty() {
            var emptyDate = new Date('0001-01-01T00:00:00');
            return emptyDate;
        }


        function dateMax(stringValue) {
            return stringValue ? "9999-12-31T00:00:00" : new Date('9999-12-31T00:00:00');
        }


        function getIntervalStringFromNow(val) {
            if (isEmpty(val))
                return '';

            if (!isDate(val))
                return '';

            var dateDuJour = new Date();
            var dateVal = new Date(val);

            var a = dateDuJour.getFullYear() - dateVal.getFullYear();
            var m = dateDuJour.getMonth() - dateVal.getMonth();
            if (m < 0 || (m === 0 && dateDuJour.getDate() < dateVal.getDate())) {
                a--;
            }

            if (dateVal.getFullYear() == 1)
                return '';

            if (a < -1) {
                return dateVal.getFullYear();
            }

            if (a < 0) {
                return val.substr(8, 2) + "/" + val.substr(5, 2);
            }

            if (a < 1) {
                if (m < 0)
                    var nbMois = 12 + m;
                else if (m >= 0)
                    var nbMois = 0 + m;

                if (nbMois > 3)
                    return nbMois + "m"
                else
                    return val.substr(8, 2) + "/" + val.substr(5, 2);
            }

            if (a >= 1)
                return dateVal.getFullYear();

        }


        function isDarkColor(couleurHexa) {
            if (isEmpty(couleurHexa))
                return false;

            var c = couleurHexa.substring(1);      // strip #
            var rgb = parseInt(c, 16);   // convert rrggbb to decimal
            var r = (rgb >> 16) & 0xff;  // extract red
            var g = (rgb >> 8) & 0xff;  // extract green
            var b = (rgb >> 0) & 0xff;  // extract blue

            var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

            if (luma < 160)
                return true;
            else
                return false;
        }

        function isDate(date) {
            return ((new Date(date) !== "Invalid Date" && !isNaN(new Date(date))));
        }

        function clearProperties(obj, properties) {
            for (var i = 0; i < properties.length; i++) {
                obj[properties[i]] = "";
            }

        }

        function setLoadingMessage(label) {
            if (isEmptyOrWhitespace($rootScope.customLoadingMessage) && isEmptyOrWhitespace(label))
                return;

            $rootScope.customLoadingMessage = label;
        }

        function containString(chaine, str, prefSuffChar) {
            if (isUndefined(prefSuffChar))
                return chaine.toLowerCase().trim().indexOf(str.toLowerCase().trim()) >= 0;
            else {
                chaine = prefSuffChar + chaine + prefSuffChar;
                str = prefSuffChar + str + prefSuffChar;
                return chaine.toLowerCase().trim().indexOf(str.toLowerCase().trim()) >= 0;

            }
        }

        function containStringComma(bigString, litleString) {
        	var bigTable = bigString.split(',');
        	var litleTable = litleString.split(',');
     
        	for (var i = 0; i < litleTable.length; i++) {
        		if (bigTable.indexOf(litleTable[i]) == -1)
        			return false
        	}

        	return true;
 		}


        function addLeadingZero(num, size) {
            var s = num + "";
            while (s.length < size) s = "0" + s;
            return s;
        }

        function padRight(chaine, num, str) {
            if ((num - chaine.length) > 0)
                return Array((num - chaine.length) + 1).join(str || " ");
            return "";
        }

        function endsWith(chaine, suffix) {
            return chaine.toLowerCase().trim().indexOf(suffix.toLowerCase().trim(), chaine.length - suffix.length) !== -1;
        }

        function startWith(chaine, prefix) {
            return chaine.toLowerCase().trim().indexOf(prefix.toLowerCase().trim()) == 0;
        }

        function _escapeRegExp(string) {
            return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        }

        function replaceAll(string, find, replace, ignoreCase) {
            return string.replace(new RegExp(_escapeRegExp(find), (ignoreCase == true) ? 'ig' : 'g'), replace);
        }

        function replaceAt(string, index, character) {
            return string.substr(0, index) + character + string.substr(index + character.length);
        }

        function cleanUpSpecialChars(str) {
            str = str.replace(/[ÀÁÂÃÄÅ]/g, "A");
            str = str.replace(/[àáâãäå]/g, "a");
            str = str.replace("Ç", "C");
            str = str.replace("ç", "c");
            str = str.replace(/[ÈÉÊË]/g, "E");
            str = str.replace(new RegExp("[èéêë]", 'g'), "e");
            str = str.replace(/[ÌÍÎÏ]/g, "I");
            str = str.replace(new RegExp("[ìíîï]", 'g'), "i");
            str = str.replace(/[ÒÓÔÕÖ]/g, "O");
            str = str.replace(new RegExp("[òóôõö]", 'g'), "o");
            str = str.replace(/[ÙÚÛÜ]/g, "U");
            str = str.replace(new RegExp("[ùúûü]", 'g'), "u");
            return str.replace(/[^a-z0-9 ]/gi, ''); //Les autres caractères non alphanumériques sauf l'espace
        }

        function isFunction(obj) {
            return _.isFunction(obj);
        }

        function isObject(obj) {
            return angular.isObject(obj);
        }

        function hasProperties(obj) {
            return Object.keys(obj).length > 0
        }

        function isArray(obj) {
            return angular.isArray(obj);
        }


        function setPageTitle(title) {
            $document[0].title = title;
        }



        function convertToType(src, classType) {
            if (isUndefined(src))
                return null;

            return new classType(src);
        };

        function convertArrayToType(src, classType) {
            if (isUndefined(src))
                return [];

            return _.map(src, function (item) {
                return new classType(item);
            });
        };

        function convertSubArrayToType(src, classType) {
            if (isUndefined(src))
                return [];

            var keys = objGetKeys(src);
            for (var i = 0; i < keys.length; i++) {
                if (Array.isArray(src[keys[i]]) && src[keys[i]].length > 0 && typeof src[keys[i]][0] === 'object') 
                    src[keys[i]] = convertArrayToType(src[keys[i]], classType);
                
            };

            return src;

        };


        function convertObjectOrArrayToType(result, expectedType) {
            if (expectedType) {
                if (Array.isArray(result))
                    return convertArrayToType(result, expectedType);
                else
                    return convertToType(result, expectedType);

            }
            else {
                return result;
            }
        }

        function convertTdbArrayToType(src, classType) {
            return _.map(src.values, function (item) {
                return new classType(src.keys, item);
            });
        };

        function extendPropFrom(src, from) {
            return _.extend(src, from);
        };

        function isEmpty(value) {
            if (value == undefined)
                return true;

            if (value === '')
            	return true;

            return false;
        };

        function isEmptyOrWhitespace(value) {
            if (isEmpty(value))
                return true;

            if (value.trim() === '')
                return true;

            return false;
        };

        function getValueOrDefault(value, defaultValue) {
            if (this.isUndefined(value))
                return defaultValue;
            else
                return value;
        };

        function isUndefined(value) {
            if (value == null)
                return true;

            if (value == undefined)
                return true;

            return false;
        };

        function daysBetween(startDate, endDate, withHours) {
            var startMoment;
            var endMoment;
            if (withHours){
                startMoment = moment(startDate).clone();
                endMoment = moment(endDate).clone();
            }
            else{
                startMoment = moment(startDate).clone().startOf('day');
                endMoment = moment(endDate).clone().startOf('day');
            }
            return Math.abs(startMoment.diff(endMoment, 'days'));
        }

        function monthsBetween(startDate, endDate) {
            var startMoment = moment(startDate).clone().startOf('day'),
                endMoment = moment(endDate).clone().startOf('day');
            return Math.abs(startMoment.diff(endMoment, 'months'));
        }

        function dateConvertDDMMYYYY(stringDate)
        {
            return moment(stringDate, "DD/MM/YYYY").toDate();
        }

        function periodUpdate(date) {
        	return xaPeriodService.updateDateFromValue(date);
        }

        function periodAllDate() {
        	return xaPeriodService.updateDateFromValue({type: 'ALL', mode: 'past'});
        }

        function periodToday() {
        	return xaPeriodService.updateDateFromValue({ type: 'TODAY', mode: 'past' });
        }
        

        function getLabel(code) {
            return xaTranslation.instant(code);
        };

        function getLabelFormat(code) {
        	var str =  xaTranslation.instant(code);
        	return str.format.apply(str, Array.prototype.slice.call(arguments, 1));
        };


        function jsonToObject(jsonString) {
            return angular.fromJson(jsonString);
        };

        function objectToJson(object) {
            return angular.toJson(object);
        };

        function objectFromJson(json) {
            return angular.from(json);
        };

        function cloneObject(object) {
            return angular.copy(object);
        };

        function removeEmptyProperties(value) {
            var keys = _.keys(value);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (this.isEmpty(value[key]))
                    delete value[key];
            }
            return value;
        }

        function getGuid() {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                   s4() + '-' + s4() + s4() + s4();

            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                           .toString(16)
                           .substring(1);
            }
        };




        function objGetKeys(obj) {
            if (obj) {
                return _.keys(obj);
            }
            else
                return null;
        }

        function runPromiseMultiple(func, listParameters) {
            var promess = null;

            listParameters.forEach(
                function (parameters, index) {
                    // Ajout au parametres de l'index courant et de l'index maximal du traitement pour utilisation en progression.
                    var params = parameters.concat([index + 1, listParameters.length])

                    if (promess == null)
                        promess = func.apply(ctx, params);
                    else
                        promess = promess.then(function () { return func.apply(ctx, params); });
                }
            );

            if (promess == null)
            	return emptyPromise(true);
			else
	            return promess;
        }

        function emptyPromise(value, isReject) {
            if (isEmpty(value))
            {
                if (isReject)
                    value = false;
                else
                    value = true;
            }
            var def = $q.defer();
            if (isReject)
                def.reject(value);
            else
                def.resolve(value);
            return def.promise;
        }


        // Pas si bete à reréflechir
        /*	function runMultiple() {
    
                if (arguments.length == 0)
                    throw new Error("La methode n'a reçu aucun parametre");
    
                if (arguments.length % 2 != 0)
                    throw new Error("Une promesse ou une nom de propriété manque");
    
                // Todo control du type des parametres
                // cas  ou il y a des erreurs
                var def = $q.defer();
    
                var nbPromise = arguments.length / 2;
    
                var arrPromise = [];
                var arrResultProp = [];
                for (var i = 0; i < arguments.length; i = i + 2) {
                    arrPromise.push(arguments[i + 1]);
                    arrResultProp.push(arguments[i]);
                }
    
    
                $q.all(arrPromise).then(function (res) {
                    var resObj = {};
                    for (var i = 0; i < res.length; i++) {
                        resObj[arrResultProp[i]] = res[i];
                    }
                    def.resolve(resObj);
                });
    
                return def.promise;
            }*/

        function browserCanViewPdf() {
            //Verification de la présence d'acrobat uniquement qd on utilise IE
            //Chrome et firefox embarquent un lecteur Pdf en natif
            var browserIsCompatible = !isTouchDevice();
            if (browserIsCompatible) {
                var userAgent = navigator ? navigator.userAgent : "OTHER";
                if (userAgent.toUpperCase().indexOf("MSIE") > -1 || (!!userAgent.match(/Trident\/7\./))) {
                    browserIsCompatible = false;
                }
            }
            return browserIsCompatible;
        }

        function browserSupportsDataUri() {
            var isOldIE = navigator.appName === "Microsoft Internet Explorer";
            var isIE11 = !!navigator.userAgent.match(/Trident\/7\./);
            return !(isOldIE || isIE11);  //Return true if not any IE
        }

        function dateAddDays(date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }


        function delayExecutionFn(delayInMs, fn) {
            $timeout(function () {
                fn();
            }, false, delayInMs);
        }

        function dateAddMinutes(date, minutes) {
            var result = new Date(date);
            result.setMinutes(result.getMinutes() + minutes);
            return result;
        }

        function dateAddHours(date, hours) {
            var result = new Date(date);
            result.setMinutes(result.getHours() + hours);
            return result;
        }

        function dateSetTime(date, time) {
            var timeParts = time.split(':');
            var result = convertToDate(date);

            result.setHours(Number(timeParts[0]));
            if (timeParts.length > 1)
                result.setMinutes(Number(timeParts[1]));
            if (timeParts.length > 2)
                result.setSeconds(Number(timeParts[2]));

            return result;
        }

        function timeAddMinutes(time, minutes) {
            var timeParts = time.split(':');

            var dateISOString = '0001-01-01T' + time + ':00'
            if (timeParts.length > 2)
                dateISOString = '0001-01-01T' + time

            var hourFormat = 'HH:mm';
            if (timeParts.length > 2)
                hourFormat = 'HH:mm:ss';

            var date = new Date(dateISOString);
            date.setMinutes(date.getMinutes() + minutes);
            return moment(date).format(hourFormat);
        }

        function timeAddHours(time, hours) {
            var timeParts = time.split(':');

            var dateISOString = '0001-01-01T' + time + ':00'
            if (timeParts.length > 2)
                dateISOString = '0001-01-01T' + time

            var date = new Date(dateISOString);
            date.setMinutes(date.getHours() + hours);

            var hourFormat = 'HH:mm';
            if (timeParts.length > 2)
                hourFormat = 'HH:mm:ss';

            return moment(date).format(hourFormat);
        }

        function timeAddDurations(duration1, duration2) {
            var date = new Date('0001-01-01T00:00:00');

            var timeParts = duration1.split(':');
            date.setHours(Number(timeParts[0]));
            if (timeParts.length > 1)
                date.setMinutes(Number(timeParts[1]));
            if (timeParts.length > 2)
                date.setSeconds(Number(timeParts[2]));

            var timeParts2 = duration2.split(':');
            date.setHours(date.getHours() + Number(timeParts2[0]));
            if (timeParts2.length > 1)
                date.setMinutes(date.getMinutes() + Number(timeParts2[1]));
            if (timeParts2.length > 2)
                date.setSeconds(date.getSeconds() + Number(timeParts2[2]));

            var hourFormat = 'HH:mm';
            if (timeParts.length > 2 || timeParts2.length > 2)
                hourFormat = 'HH:mm:ss';

            return moment(date).format(hourFormat);
        }

        function timeSubstractDurations(duration1, duration2) {
            var date = new Date('0001-01-01T00:00:00');

            var timeParts = duration1.split(':');
            date.setHours(Number(timeParts[0]));
            if (timeParts.length > 1)
                date.setMinutes(Number(timeParts[1]));
            if (timeParts.length > 2)
                date.setSeconds(Number(timeParts[2]));

            var timeParts2 = duration2.split(':');
            date.setHours(date.getHours() - Number(timeParts2[0]));
            if (timeParts2.length > 1)
                date.setMinutes(date.getMinutes() - Number(timeParts2[1]));
            if (timeParts2.length > 2)
                date.setSeconds(date.getSeconds() - Number(timeParts2[2]));

            var hourFormat = 'HH:mm';
            if (timeParts.length > 2 || timeParts2.length > 2)
                hourFormat = 'HH:mm:ss';

            return moment(date).format(hourFormat);
        }

        function dateDiff(date1, date2) {
            var diff = {}
            var result = date2 - date1;

            result = Math.floor(result / 1000);

            diff.totalSeconds = result;
            diff.totalMinutes = diff.totalSeconds / 60;
            diff.totalHours = diff.totalMinutes / 60;
            diff.totalDays = diff.totalHours / 24;

            var tmp = result;
            diff.seconds = tmp % 60;

            tmp = Math.floor((tmp - diff.seconds) / 60);
            diff.minutes = tmp % 60;

            tmp = Math.floor((tmp - diff.minutes) / 60);
            diff.hours = tmp % 24;

            tmp = Math.floor((tmp - diff.hours) / 24);
            diff.days = tmp;

            return diff;
        }

        function delayExecutionFn(delayInMs, fn) {
            $timeout(function () {
                fn();
            }, delayInMs, false);
        }


        function isInValues(value, array) {
            if (array && array.length > 0) {
                return _.contains(array, value);
            }
            else
                return false;
        }

        function isTouchDevice() {
			
            if ($rootScope.isTouchDevice != undefined) return $rootScope.isTouchDevice;
            return xaTouch.isTouchDevice();
        }


        function getAge(p_objDateNaissance, p_objDateReference) {
            var l_intNbMois = 0;
            var l_intAge = 0;

            if (dateIsEmpty(p_objDateNaissance)) {
                return '';
            }

            p_objDateNaissance = new Date(p_objDateNaissance);

            if (dateIsEmpty(p_objDateReference))
                p_objDateReference = dateToday();
            else
                p_objDateReference = new Date(p_objDateReference);


            l_intNbMois = monthsBetween(p_objDateNaissance, p_objDateReference);
            if (l_intNbMois < 48) {
                l_intNbMois = l_intNbMois;
            }
            else {
                if (p_objDateNaissance.getMonth() == p_objDateReference.getMonth()
						&& p_objDateNaissance.getDay() > p_objDateReference.getDay())
                    l_intNbMois = l_intNbMois - 1;
                else
                    l_intNbMois = l_intNbMois;
            }

            if (l_intNbMois >= 0) {

                if (l_intNbMois < 48)
                    return l_intNbMois.toString() + ' ' + getLabel("TXT_MOIS");
                else
                    return Math.floor(l_intNbMois / 12) + ' ' + getLabel("TXT_ANS");
                /*if (p_blnWithMonths)
                {
                    svar l_intMonths = p_intNbMois % 12;
                    if (l_intMonths >0)
                    {
                        return string.Format("{0}{1}, {2}{3}",
                                              (int)p_intNbMois / 12,
                                              (p_blnFullDisplay ? " " + XnResourceManager.Resources["TXT_ANS"] : XnResourceManager.Resources["TXT_ANS"].Substring(0, 1).ToLower()),
                                              l_intMonths ,
                                              (p_blnFullDisplay ? " " + XnResourceManager.Resources["TXT_MOIS"] : XnResourceManager.Resources["TXT_MOIS"].Substring(0, 1).ToLower()));
                    }
                }*/

            }
            return '';
        }

        function getAgeInYears(p_objDateNaissance, p_objDateReference) {
            if (dateIsEmpty(p_objDateReference))
                p_objDateReference = dateToday();

            var ageDifMs = p_objDateReference - p_objDateNaissance.getTime();
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        function forceRefreshView() {
            if (!$rootScope.$$phase)
                $rootScope.$digest();
        }

        function appendValueAtCursorPosition(idControl, textToAppend) {
            var $tarea = $('#' + idControl);

            if ($tarea.length !=  1)
                throw Error('Impossible de trouver le controle avec l\'id ' + idControl );

            if ($tarea[0].tagName != 'INPUT' && $tarea[0].tagName != 'TEXTAREA') {
                $tarea = $tarea.find('input');
                if ($tarea == null)
                    $tarea = $tarea.find('textarea');
            }

            if ($tarea.length != 1)
                throw Error('Impossible de trouver le controle avec l\'id ' + idControl);


            var textToInsert = textToAppend;

            var start = $tarea.prop("selectionStart")
            var end = $tarea.prop("selectionEnd")
            var text = $tarea.val()
            var before = text.substring(0, start)
            var after = text.substring(end, text.length)
            
            $timeout(function () {
                $tarea.focus();
            }, 100,false);
            return before + textToInsert + after;

        }

        function toTSInterface(objInstance, recCall, argOptional) {
            var str = 'export interface TOREPLACE { ';
            if (recCall) str = '';

            for (var key in objInstance) {
                var type = typeof (objInstance[key]);
                str += '\n' + key + ': ';
                if (Array.isArray(objInstance[key])) {
                    var arrInstance = objInstance[key];
                    if (arrInstance.length) {
                        str += '[{\t' + toTSInterface(arrInstance[0], true, argOptional) + '\n}]';
                    }
                    else {
                        str += 'any[]';
                    }
                }
                else if (objInstance[key] instanceof Date) {
                    str += 'Date';
                }
                else if (type == 'object') {
                    str += '{\t' + toTSInterface(objInstance[key], true, argOptional) + '\n}';
                }
                else if (type === 'function') {
                    var funcStr = objInstance[key].toString();

                    var args = /\(\s*([^)]*?)\s*\)/.exec(funcStr);
                    if (args && args[1]) {
                        console.log('function: ', args[1], funcStr);
                        if (argOptional) {
                            var param = replaceAll(args[1], ",", "?,");
                            str += '(' + param + '?) => any';
                        }
                        else
                            str += '(' + args[1] + ') => any';
                    }
                    else str += '() => any';
                }
                else if (type == "undefined") {
                    str += 'any';
                }
                else {
                    str += type;
                }
            }

            if (!recCall) str += '\n}';

            return str;
        }

        function saveImageFromBase64(base64Image, name) {

            function dataURItoBlob(dataURI) {
                // convert base64 to raw binary data held in a string
                // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
                var byteString = atob(dataURI.split(',')[1]);

                // separate out the mime component
                var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

                // write the bytes of the string to an ArrayBuffer
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }

                // write the ArrayBuffer to a blob, and you're done
                var bb = new Blob([ab]);
                return bb;
            }

            function saveImage(blob, filename) {
                if (window.navigator.msSaveBlob)
                    window.navigator.msSaveBlob(blob, filename);
                else {
                    var link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
                    link.style = "display: none";
                    link.href = URL.createObjectURL(blob);
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();

                    setTimeout(function () {
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(link.href);
                    }, 100); //firefox is picky, needs the link appended to the body
                }
            }

            var blobObj = dataURItoBlob(base64Image, 'image/png');
            saveImage(blobObj, name);

        }
                
        function getPhoneNumberInternational(phoneNumber, cultureCode) {
            var culture = (cultureCode || xaFrameworkSetting.TelephonyCountryCode || 'FR');
            return xaTelephonyService.getStorageValue(culture, phoneNumber);
        }

        function openHtmlLinkFromUrl(url, target) {
            //le $timeout sert a éviter une exception de digest si jamais l'url n'est pas valide (ex: un chemin reseau qui n'existe pas)
            $timeout(function () {
                try {
                    window.open(url, target);
                }
                catch (e) {
                    dialogs.error(getLabel('TXT_ERREUR'), getLabelFormat('TXT_ERROR_OPEN_LINK', url));
                }
            }, 0, false);
        };
        
        function copyToClipboard(strValue) {
            var $temp = $("<textarea>");
        	$("body").append($temp);
        	$temp.val(strValue).select();
        	document.execCommand("copy");
        	$temp.remove();
        }

        function openMailBoxTo(mailAdress) {
        	window.location.href = "mailto:" + mailAdress;
        }

        function focusControlWithId(id) {
        	$("#" + id + ' input').focus();
        }

        function prepareHtmlForBinding(value) {
        	return $sce.trustAsHtml(value)
        }


        var libraryLoaded = [];
        function loadLibraries(libraries) {
        	var arr = [];
        	for (var i = 0; i < libraries.length; i++) {
        		if (libraryLoaded.indexOf(libraries[i]) >= 0)
        			continue;

        		switch (libraries[i]) {
        			case 'chart':
        				arr.push(['chart/highcharts.js']);
        				arr.push(['chart/highcharts-3d.js']);
        				arr.push(['chart/chart.directive.js']);
        				break;
        			case 'codeeditor':
        				arr.push(['codeeditor/ace.js']);
        				arr.push(['codeeditor/mode-javascript.js']);
        				arr.push(['codeeditor/theme-chrome.js']);
        				arr.push(['codeeditor/worker-javascript.js']);
        				arr.push(['codeeditor/codeeditor.directive.js']);
        				break;
						
        			default: throw new Error('Unrecognized-lib');
        		}

        		libraryLoaded.push(libraries[i]);
        	}

        	if (arr.length > 0)
        		return runPromiseMultiple(getScript, arr);
        	else
        		return emptyPromise(true);

        	function getScript(file) {
        		var def = $q.defer();

        		// Allow user to set any option except for dataType, cache, and url
        		var options = $.extend(options || {}, {
        				dataType: "script",
        				cache: true,
        				url: 'XaCommon/ScriptsLazy/' + file
        			});

        		jQuery.ajax(options).done(function () {
        			def.resolve();
        		}).fail(function () {
        			def.reject()
        		});

        		return def.promise;
        	}
        
        }


    }


})();




