(function () {
    'use strict';

    angular.module('XaCommon').filter('XaFilterValeurToImage', XaFilterValeurToImage);
    function XaFilterValeurToImage($sce, UtilsHelper) {
        return function (valeur, cle, rowValues) {
            if (!UtilsHelper.isEmpty(valeur)) {
                var ressourceKey = 'TXT_IMG_' + cle.toUpperCase() + '_' + valeur.toString().toUpperCase();
                var ressource = UtilsHelper.getLabel(ressourceKey);
                if (ressource == ressourceKey)
                    return $sce.trustAsHtml('<img  src="XaCommon/Img/' + cle + '_' + valeur + '.png" />');
                else
                    return $sce.trustAsHtml('<img  src="XaCommon/Img/' + cle + '_' + valeur + '.png" title="' + ressource + '" />');
            }
            else {
                return '';
            }
        }
    };
})();

(function () {
    'use strict';

    angular.module('XaCommon').filter('XaFilterValeurToCheckbox', XaFilterValeurToCheckbox);
    function XaFilterValeurToCheckbox($sce, UtilsHelper, xaFrameworkSetting) {
        return function (valeur, typeArg, rowValues, col) {
            if (!UtilsHelper.isEmpty(valeur)) {
                var title = '';
                var cl = '';
				var testId = '';
				
                if (col.tooltip)
                    title = ' title="' + col.tooltip + '"';

                if (typeArg.isEnabledFn && !typeArg.isEnabledFn(rowValues, valeur, typeArg))
                    cl = ' class="disabledCheckbox"';
				
				if (xaFrameworkSetting.TestMode)
					testId = ' test-id="btn' + typeArg.code + '_' + valeur + '" ';
				
                return $sce.trustAsHtml('<img  src="XaCommon/Img/' + typeArg.code + '_' + valeur + '.png"' + cl + title + '  ' + testId + ' />');
            }
            else {
                return '';
            }
        }
    };
})();

(function () {
    'use strict';

    angular.module('XaCommon').filter('XaFilterHtml', XaFilterHtml);
    function XaFilterHtml($sce, UtilsHelper) {
        return function (valeur) {
            if (!UtilsHelper.isEmpty(valeur))
                return $sce.trustAsHtml(valeur.replace(/\n/g, '<br/>'));
            else
                return '';
        }
    };
})();


//	formatter: function (row, cell, value, columnDef, dataContext) {
//		return ;
//	}
(function () {
    'use strict';

    angular.module('XaCommon').filter('XaFilterValeurToCouleur', XaFilterValeurToCouleur);
    function XaFilterValeurToCouleur($sce, UtilsHelper) {
        return function (valeur, cle, rowValues) {
            if (!UtilsHelper.isEmpty(valeur)) {
                if (valeur.length == 9)
                    valeur = UtilsHelper.replaceAll(valeur, '#FF', '#', true);
                return '<div  style="width:100%;height:20px;background-color: ' + valeur + '"></div>';
            }
            else
                return '';
        }
    };
})();



(function () {
    'use strict';

    angular.module('XaCommon').filter('XaFilterValeurToImageApplication', XaFilterValeurToImageApplication);
    function XaFilterValeurToImageApplication($sce, UtilsHelper) {
        return function (valeur, cle, rowValues, columnDef) {
            if (!UtilsHelper.isEmpty(valeur)) {
                var title = '';

                var ressourceKey = 'TXT_IMG_' + cle.toUpperCase() + '_' + valeur.toString().toUpperCase();
                var ressource = UtilsHelper.getLabel(ressourceKey);
                if (ressource != ressourceKey)
                    title = 'title="' + ressource + '"';
				
                return $sce.trustAsHtml(UtilsHelper.getLabelFormat('<img src="Img/{0}_{1}.png" {2} />', cle, valeur, title));
            }
            else {
                return '';
            }
        }
    };
})();

(function () {
    'use strict';

    angular.module('XaCommon').filter('XaFilterValeurToImageAdvanced', XaFilterValeurToImageAdvanced);
    function XaFilterValeurToImageAdvanced($sce, UtilsHelper) {
        return function (valeur, typeArg, rowValues, columnDef) {
            if (!UtilsHelper.isEmpty(valeur)) {
                var code = '';
                var title = '';
                var path = '';
                var height = '';

                if (typeArg.code)
                    code = typeArg.code;
                var ressourceKey = 'TXT_IMG_' + typeArg.code.toUpperCase() + '_' + valeur.toString().toUpperCase();
                var ressource = UtilsHelper.getLabel(ressourceKey);
                if (ressource != ressourceKey)
                    title = 'title="' + ressource + '"';
                if (typeArg.imagePath)
                    path = typeArg.imagePath;
                if (typeArg.imageHeight)
                    height = 'height="' + typeArg.imageHeight + '"';
				
                return $sce.trustAsHtml(UtilsHelper.getLabelFormat('<img src="{0}{1}_{2}.png" {3} {4} />', path, code, valeur, height, title));
            }
            else {
                return '';
            }
        }
    };
})();




(function () {
    'use strict';

    angular.module('XaCommon').filter('XaFilterValeurToImageFix', XaFilterValeurToImageFix);
    function XaFilterValeurToImageFix($sce, UtilsHelper, xaFrameworkSetting) {
        return function (valeur, cle, rowValues) {
			var testId = '';
			
			if (xaFrameworkSetting.TestMode)
					testId = ' test-id="btn' + cle + '" ';
					
            if (!UtilsHelper.isEmpty(cle))
                return $sce.trustAsHtml('<img src="' + cle + '" ' + testId + ' />');
            else
                return '';
        }
    };
})();


(function () {
    'use strict';
    angular.module('XaCommon').filter('XaFilterValeurToImageAvecCommentaire', XaFilterValeurToImageAvecCommentaire);
    function XaFilterValeurToImageAvecCommentaire($sce, UtilsHelper) {
        return function (valeur, cle, rowValues) {
            if (!UtilsHelper.isEmpty(valeur))
                return $sce.trustAsHtml('<img  src="' + cle + '"  title="' + valeur.replace(/\"/g, '') + '"/>');
            else
                return '';
        }
    };
})();

(function () {
    'use strict';

    angular.module('XaCommon').filter('XaFilterBooleanToImage', XaFilterBooleanToImage);
    function XaFilterBooleanToImage($sce, UtilsHelper) {
        return function (valeur, cle, rowValues) {
            if (valeur === true || valeur === -1 || valeur === '-1' || valeur === 1 || valeur === '1')
                return $sce.trustAsHtml('<img  src="XaCommon/Img/' + (cle ? cle : 'Status') + '_OK.png"/>');
            else
                return '';
        }
    };
})();


(function () {
    'use strict';

    angular.module('XaCommon').filter('XaFilterValeurToMultiType', XaFilterValeurToMultiType);
    function XaFilterValeurToMultiType($sce, $filter, UtilsHelper, ArrayHelper) {
        return function (valeur, cle, rowValues) {
            var configuration = rowValues;
            switch (configuration.type) {
                case 'Number': return valeur; break;
                case 'Text':
                case 'LongText':
                    if (configuration.listeValeur && configuration.listeValeur.length > 0) {
                        var value = ArrayHelper.findFirstFromProperty(configuration.listeValeur, 'code', valeur);
                        if (value)
                            return value.libelle;
                        else
                            return UtilsHelper.getLabel('TXT_VALEUR_INCONNUE');
                    }
                    else {
                        return valeur || '';
                    }
                    break;
                case 'Boolean':
                    return (valeur === true || valeur === -1 || valeur === '-1' || valeur === 1 || valeur === '1') ? UtilsHelper.getLabel('TXT_OUI') : UtilsHelper.getLabel('TXT_NON');
                    break;
                case 'Color':
                    return $filter('XaFilterValeurToCouleur')(valeur);
                    break;

            }
            return '';
        }
    };
})();

(function () {
    'use strict';

    angular.module('XaCommon').filter('XaFilterTextToLink', XaFilterTextToLink);
    function XaFilterTextToLink($sce, UtilsHelper) {
        return function (valeur, typeArg, rowValues) {
            if (valeur) {
                return valeur;
            }
            else
                return '';
        }
    };
})();

(function () {
    'use strict';

    angular.module('XaCommon').filter('XaFilterFixedTextToLink', XaFilterFixedTextToLink);
    function XaFilterFixedTextToLink($sce, UtilsHelper) {
        return function (valeur, cle, rowValues) {
            if (!UtilsHelper.isEmpty(cle))
                return UtilsHelper.getLabel(cle);
            else
                return 'RESOURCE ABSENTE';
        }
    };
})();



(function () {
    'use strict';
    angular.module('XaCommon').filter('XaFilterValeurToImageViewerStatus', XaFilterValeurToImageViewerStatus);
    function XaFilterValeurToImageViewerStatus($sce, UtilsHelper) {
        return function (valeur, cle, rowValues) {
            if (!UtilsHelper.isEmpty(valeur)) {
                return $sce.trustAsHtml('<img  src="XaCommon/Img/images20px.png"/>');
            }
            else
                return '';
        }
    };
})();


(function () {
    'use strict';
    angular.module('XaCommon').filter('XaFilterValeurToCommentaireDemande', XaFilterValeurToCommentaireDemande);
    function XaFilterValeurToCommentaireDemande($sce, UtilsHelper, xaFrameworkSetting) {
        return function (valeur, cle, rowValues) {
            var testId = '';

            if (UtilsHelper.isEmptyOrWhitespace(rowValues[cle]))
            	return '';
            else
            {
            	if (valeur == true) {
            		if (xaFrameworkSetting.TestMode) testId = " test-id=\"btnComment\" ";
            		return $sce.trustAsHtml('<img  src="XaCommon/Img/Info20.png" ' + testId + '/>');
            	}
            	else {
            		if (xaFrameworkSetting.TestMode) testId = " test-id=\"btnCelluleVideComment\" ";
            		return $sce.trustAsHtml('<img  src="XaCommon/Img/CelluleVide.png" ' + testId + '/>');
            	}
            }
		}
    };
})();

(function () {
	'use strict';

	var crLabelsTranslateur = {};
    crLabelsTranslateur['DIC'] ='TXT_DICTE';
	crLabelsTranslateur['DICC'] ='TXT_DICTEE_ENCOURS';
	crLabelsTranslateur['RECB'] ='TXT_RECO_ENCOURS';
	crLabelsTranslateur['RECC'] ='TXT_RECO_ENCOURS';
	crLabelsTranslateur['TAP'] ='TXT_FRAPPE';
	crLabelsTranslateur['TAPC'] ='TXT_FRAPPE_ENCOURS';
	crLabelsTranslateur['DIF'] ='TXT_DIFFUSE';
	crLabelsTranslateur['PREV'] ='TXT_DOCUMENT_PREVALIDE';
	crLabelsTranslateur['VAL'] ='TXT_VALIDE';
	crLabelsTranslateur['COR'] ='TXT_A_CORRIGER';

	crLabelsTranslateur['SVTAP'] ='TXT_FRAPPE';
	crLabelsTranslateur['SVTAPC'] ='TXT_FRAPPE_ENCOURS';
	crLabelsTranslateur['SVDIF'] ='TXT_DIFFUSE';
	crLabelsTranslateur['SVRECC'] ='TXT_RECO_ENCOURS';
	crLabelsTranslateur['SVCOR'] ='TXT_A_CORRIGER';

	crLabelsTranslateur['EXT'] ='TXT_EXTERNALISE';
	crLabelsTranslateur['TRAN'] ='TXT_TRANSCRIT';
	crLabelsTranslateur['TRANC'] ='TXT_TRANSCRIT_ENCOURS';

    angular.module('XaCommon').filter('XaFilterValeurToExamenCrStatus', XaFilterValeurToExamenCrStatus);
    function XaFilterValeurToExamenCrStatus($sce, UtilsHelper, UserHelper) {
        return function (valeur, typeArg, rowValues) {

        	if (!UtilsHelper.isEmpty(valeur)) {
                var cat = valeur.split('|');
                var html = '';
                var liaisonNumDem = false;
                var sansCr = false;

                for (var i = 0; i < cat.length; i++) {
                	var tmp = cat[i].split(':');
                	if (tmp.length != 2)
                		continue;

                	var code = tmp[0];
                	var nombre = tmp[1];

                	if (code == 'OPTL')
                		liaisonNumDem = (nombre == '1');
                	
                	if (code == 'SANSCR') 
                		sansCr = (nombre != '0');
                	
                	if (code == 'TOT' || code == 'FIRST'|| code == 'OPTL' || code == 'SANSCR'|| nombre == '' || nombre == '0')
                        continue;

                	html += '<img  src="XaCommon/Img/crstatus20px_' + code + '.png" title="' + UtilsHelper.getLabel(crLabelsTranslateur[code]) + '"/>'
                    if (nombre != '1') html += 'x' + nombre;
                    html += '&nbsp;'
                }
				
                var showBtnAddCr = false;
                if (sansCr)
                	showBtnAddCr = false;
                else if (liaisonNumDem == false && typeArg.controleLiaisonNumdemForAdd && typeArg.showAddCr) //Liaison NUMDEM + TdbNumdem
	            	showBtnAddCr = false;
                else if (typeArg && typeArg.showAddCr)
                	showBtnAddCr = typeArg.showAddCr;

             
                showBtnAddCr = showBtnAddCr && (UserHelper.hasRight('DOC_GERER_MES_DICTEES') || UserHelper.hasRight('DOC_GERER_MES_CR'));

                var showBtnExamenSansCR = false;
                if (UtilsHelper.isEmpty(html))
                	showBtnExamenSansCR = typeArg && typeArg.showSansCr && UserHelper.hasRight('EXPLOIT_EXAMEN_MARQUER_SANS_DOCUMENT');

                if (showBtnExamenSansCR && sansCr == false)
                	html = '<img style="margin-right:5px" src="XaCommon/Img/CelluleVide.png" class="crSansCR"/>';

                if (showBtnExamenSansCR && sansCr == true)
                	html = '<img src="XaCommon/Img/crstatus20px_SANSCR.png" class="crSansCR"/>';

                if (sansCr == false && showBtnAddCr && rowValues && rowValues.DEMANDE_STATUT != 'N') //Row à null => groupement
                	html += '<img src="XaCommon/Img/add_20px.png" class="crAddButton"/>';

                return $sce.trustAsHtml(html);
            }
            else
                return '';
        }
    };
})();


(function () {
    'use strict';
    angular.module('XaCommon').filter('XaFilterValeurToExamenPjStatus', XaFilterValeurToExamenPjStatus);
    function XaFilterValeurToExamenPjStatus($sce, UtilsHelper, xaFrameworkSetting) {
        return function (valeur, cle, rowValues) {
            if (!UtilsHelper.isEmpty(valeur)) {
                var cat = valeur.split(';');
                var html = '';

				var testId = '';
				
                for (var i = 0; i < cat.length; i++) {
                    var tmp = cat[i].split(':');
                    if (tmp.length != 2)
                        continue;

                    var code = tmp[0];
                    var nombre = tmp[1];

					if (xaFrameworkSetting.TestMode)
							testId = " test-id=\"btnAttacher20px\" ";
					
                    if (code == 'EXA' && nombre != '0') {
                        html += '<img  src="XaCommon/Img/attacher20px.png" ' + testId + ' />'
						
						if (nombre != '1')
                            html += 'x' + nombre;

                        html += '&nbsp;'
                    }
                }
                if (UtilsHelper.isEmpty(html))
				{
                    if (xaFrameworkSetting.TestMode)
							testId = " test-id=\"btnCelluleVideAttacher20px\" ";
					
					html = '<img  src="XaCommon/Img/CelluleVide.png" ' + testId + ' />';
				}

                return $sce.trustAsHtml(html);
            }
            else
                return '';
        }
    };
})();




(function () {
    angular.module('XaCommon').filter('XaFilterValeurFromList', XaFilterValeurFromList);
    function XaFilterValeurFromList($filter, ArrayHelper, UtilsHelper) {
        return function (valeur, typeArg, rowValues) {
            if (UtilsHelper.isEmpty(valeur))
                return '';
            else {
                // Cas d'une combo multi on affiche simplement la valeur stockée
                if (typeArg && typeArg.multiple == true)
                    return valeur;

                // Cas d'une combo simple on affiche libelle
                var source = angular.isFunction(typeArg.dataSource) ? typeArg.dataSource(rowValues) : typeArg.dataSource;
                var res = ArrayHelper.findFirstFromProperty(source, typeArg.valueCol, valeur);
                if (res == null)
                    return 'unknow value';
                else {
                    if (typeArg.displayValueFn)
                        return typeArg.displayValueFn(res, typeArg);
                    else
                        return res[typeArg.displayCol];
                }
            }

        }
    };
})();

(function () {
    angular.module('XaCommon').filter('XaFilterDate', XaFilterDate);
    function XaFilterDate($filter, UserHelper, UtilsHelper, xaFrameworkSetting) {
        return function (dt, rowValues) {
            if (!UtilsHelper.dateIsEmpty(dt))
                return $filter('date')(dt, xaFrameworkSetting.DateFormat || "dd/MM/yyyy");
            else
                return '';

        }
    };
})();

(function () {
    angular.module('XaCommon').filter('XaFilterDateAvecCommentaire', XaFilterDateAvecCommentaire);
    function XaFilterDateAvecCommentaire($filter, UserHelper, UtilsHelper, xaFrameworkSetting, $sce) {
        return function (dt, cle, rowValues) {
            if (!UtilsHelper.dateIsEmpty(dt)) {
                var date = $filter('date')(dt, xaFrameworkSetting.DateFormat || "dd/MM/yyyy");
                var comment = '';
                if (rowValues != null && !UtilsHelper.isEmpty(rowValues[cle]))
                    comment = ' <img src="XaCommon/img/info20.png" title="' + rowValues[cle].replace(/\"/g, '') + '"/>';
                return $sce.trustAsHtml(date + comment);
            }
            else
                return '';

        }
    };
})();





(function () {
    angular.module('XaCommon').filter('XaFilterPeriode', XaFilterPeriode);
    function XaFilterPeriode($filter, UserHelper, UtilsHelper, xaFrameworkSetting) {
        return function (periode, rowValues) {
            if (periode && periode.length == 2) {
                if (UtilsHelper.dateIsEmpty(periode[0]) && UtilsHelper.dateIsEmpty(periode[1]))
                    return UtilsHelper.getLabel('TXT_PAS_PERIODE');
                else if (UtilsHelper.dateIsEmpty(periode[1]))
                    return UtilsHelper.getLabel('TXT_A_PARTIR_DU') + ' ' + $filter('date')(periode[0], xaFrameworkSetting.DateFormat || "dd/MM/yyyy");
                else if (UtilsHelper.dateIsEmpty(periode[0]))
                    return UtilsHelper.getLabel('TXT_JUSQU_AU') + ' ' + $filter('date')(periode[1], xaFrameworkSetting.DateFormat || "dd/MM/yyyy");
                else
                    return UtilsHelper.getLabel('TXT_DU_AU').format($filter('date')(periode[0], xaFrameworkSetting.DateFormat || "dd/MM/yyyy"),
																	$filter('date')(periode[1], xaFrameworkSetting.DateFormat || "dd/MM/yyyy"));
            }
            else
                return '';

        }
    };
})();


(function () {
    angular.module('XaCommon').filter('XaFilterDateTime', XaFilterDateTime);
    function XaFilterDateTime($filter, xaFrameworkSetting, UserHelper, UtilsHelper) {
        return function (dt, typeArg, row) {
            if (!UtilsHelper.dateIsEmpty(dt)) {
                if (!UtilsHelper.isEmpty(typeArg)) {
                    var heure = null;
                    if (UtilsHelper.isUndefined(row) || UtilsHelper.isEmpty(row[typeArg]))
                        return $filter('date')(dt, (xaFrameworkSetting.DateFormat || "dd/MM/yyyy"));
                    else
                        return $filter('date')(UtilsHelper.dateSetTime(dt, row[typeArg]), (xaFrameworkSetting.DateFormat || "dd/MM/yyyy") + ' HH:mm:ss');
                }
                else {
                    return $filter('date')(dt, (xaFrameworkSetting.DateFormat || "dd/MM/yyyy") + ' HH:mm:ss');
                }
            }
            else
                return '';
        }
    };
})();


(function () {
    angular.module('XaCommon').filter('XaFilterDateAvecJour', XaFilterDateAvecJour);
    function XaFilterDateAvecJour($filter, UtilsHelper) {
        return function (dt, rowValues) {
            if (!UtilsHelper.isEmpty(dt))
                return UtilsHelper.dateDayString(dt) + ' ' + $filter('date')(dt, (xaFrameworkSetting.DateFormat || "dd/MM/yyyy"));
            else
                return '';

        }
    };
})();

(function () {
    angular.module('XaCommon').filter('XaFilterTime', XaFilterTime);
    function XaFilterTime($filter, xaFrameworkSetting, UserHelper, UtilsHelper) {
        return function (time, rowValues) {
            if (!UtilsHelper.dateIsEmpty(time)) {
                time = time / 10;
                var hours = Math.floor(time / 3600);
                var minutes = Math.floor((time - (hours * 3600)) / 60);
                var seconds = time - (hours * 3600) - (minutes * 60);

                // round seconds
                seconds = Math.round(seconds * 100) / 100

                var result = (hours < 10 ? "0" + hours : hours);
                result += ":" + (minutes < 10 ? "0" + minutes : minutes);
                result += ":" + (seconds < 10 ? "0" + seconds : seconds);
                return result;
            }
            else
                return '';
        }
    };
})();

(function () {
    angular.module('XaCommon').filter('XaFilterDistance', XaFilterDistance);
    function XaFilterDistance($filter, xaFrameworkSetting, UserHelper, UtilsHelper) {
        return function (distance, rowValues) {
            if (!UtilsHelper.isEmpty(distance))
                return (distance / 1000).toFixed(3) + " km";            
            else
                return '';
        }
    };
})();

(function () {
    angular.module('XaCommon').filter('XaFilterHour', XaFilterHour);
    function XaFilterHour($filter, UserHelper, UtilsHelper, xaFrameworkSetting) {
        return function (dt, rowValues) {
            if (!UtilsHelper.dateIsEmpty(dt))
                return $filter('date')(dt, xaFrameworkSetting.HourFormat || "HH:mm");
            else
                return '';
        }
    };
})();

(function () {
    'use strict';

    angular.module('XaCommon').filter('XaFilterBooleanToText', XaFilterBooleanToImage);
    function XaFilterBooleanToImage(UtilsHelper) {
        return function (valeur, cle, rowValues) {
            if (valeur === -1 || valeur === '-1' || valeur === 1)
                return UtilsHelper.getLabel('TXT_OUI');
            else
                return UtilsHelper.getLabel('TXT_NON');
        }
    };
})();



(function () {
    angular.module('XaCommon').filter('XaFilterMontant', XaFilterMontant);
    function XaFilterMontant($filter, UserHelper, UtilsHelper) {
        return function (val, typeArg, rowValues) {

            if (!UtilsHelper.isUndefined(val)) {
                if (!angular.isNumber(val))
                    return 'NaN';
                if (val === 0 && typeArg && typeArg.showZeroValue === false)
                    return '';
                return $filter('number')(val, 2) + ' ' + UserHelper.getAppParameter("SymboleDevise");
            }
            else
                return '';
        }
    };
})();

(function () {
    angular.module('XaCommon').filter('XaFilterValeurToLibelle', XaFilterValeurToLibelle);
    function XaFilterValeurToLibelle($filter, xaTranslation, UtilsHelper) {
        return function (val, cle, rowValues) {
            if (!UtilsHelper.isEmpty(cle) && !UtilsHelper.isEmpty(val)) {
                val = val.toString().toUpperCase();
                return xaTranslation.instant(cle + val);
            }
            else
                return '';
        }
    };
})();


(function () {
    angular.module('XaCommon').filter('XaFilterNombre', XaFilterNombre);
    function XaFilterNombre($filter, UtilsHelper) {
        return function (val, cle, rowValues) {
            if (!UtilsHelper.isUndefined(val)) {
                if (!angular.isNumber(val))
                    return 'NaN';
                return $filter('number')(val, cle ? parseInt(cle) : 2);
            }
            else
                return 0;
        }
    };
})();


(function () {
    angular.module('XaCommon').filter('XaFilterNombreEntier', XaFilterNombreEntier);
    function XaFilterNombreEntier($filter, UtilsHelper) {
        return function (val, typeArg, rowValues) {
            if (!UtilsHelper.isUndefined(val)) {
                if (UtilsHelper.isEmpty(val) || isNaN(val)) {
                    if (typeArg && typeArg.showNaN === false)
                        return '';
                    return 'NaN';
                }
                if (val === 0 && typeArg && typeArg.showZeroValue === false)
                    return '';
                return $filter('number')(val, 0);
            }
            else
                return 0;
        }
    };
})();


(function () {
    angular.module('XaCommon').filter('XaFilterValeurToPastilleFromField', XaFilterValeurToPastilleFromField);
    function XaFilterValeurToPastilleFromField($sce, UtilsHelper, xaFrameworkSetting) {
        return function (code, cle, rowValues) {

            if (UtilsHelper.isEmpty(cle) || !rowValues)
                return code;

            var couleur = 'white';
            if (rowValues[cle] == 'WARN') couleur = '#ffa500';
            else if (rowValues[cle] == 'OK') couleur = '#90ee90';
            else if (rowValues[cle] == 'ERROR') couleur = '#ff0000';
            else couleur = rowValues[cle];

            if (UtilsHelper.isEmpty(couleur))
                couleur = "#ffffff";

            if (couleur.length == 9)
                couleur = '#' + couleur.substr(3, 6);

            var textColor = 'black'
            if (UtilsHelper.isDarkColor(couleur))
                textColor = 'white';

            var needTestIds = xaFrameworkSetting.TestMode;
            var testIdItem = '';
            if (needTestIds) testIdItem = " test-id=\"btnPastille\" ";

            return $sce.trustAsHtml('<div class="circleForPastille" ' + testIdItem + ' style="color: ' + textColor + ';background-color: ' + couleur + '">' + code + '</div>');
        }
    };
})();


(function () {
    angular.module('XaCommon').filter('XaFilterValeurToPastille', XaFilterValeurToPastille);
    function XaFilterValeurToPastille($sce, UtilsHelper, xaFrameworkSetting) {
        return function (code, typeArg, rowValues) {
            if (!typeArg || !rowValues)
                return code;

            var tooltip = rowValues[typeArg.tooltip];
            var couleur = rowValues[typeArg.couleur];

            if (UtilsHelper.isEmpty(couleur))
                couleur = "#ffffff";

            if (couleur.length == 9)
                couleur = '#' + couleur.substr(3, 6);

            var textColor = 'black'
            if (UtilsHelper.isDarkColor(couleur))
                textColor = 'white';

            var needTestIds = xaFrameworkSetting.TestMode;
            var testIdItem = '';
            if (needTestIds) testIdItem = " test-id=\"btnPastille\" ";

            return $sce.trustAsHtml('<div class="circleForPastille" ' + testIdItem + ' style="color: ' + textColor + ';background-color: ' + couleur + '" title="' + tooltip + '">' + code + '</div>');
        }
    };
})();


(function () {
    angular.module('XaCommon').filter('XaFilterTelephone', XaFilterTelephone);
    function XaFilterTelephone($filter, UtilsHelper, xaFrameworkSetting, xaTelephonyService) {
        return function (val, cle, rowValues) {
            if (!UtilsHelper.isUndefined(val))
                return xaTelephonyService.getDisplayValue(xaFrameworkSetting.TelephonyCountryCode || 'FR', val);
            else
                return '';
        }
    };
})();


(function () {
    angular.module('XaCommon').filter('XaFilterAge', XaFilterAge);
    function XaFilterAge($filter, UtilsHelper) {
        return function (val, typeArg, row) {
            var dateRef = undefined;
            if (typeArg && row)
                dateRef = row[typeArg];
            return UtilsHelper.getAge(val, dateRef);
        }
    };
})();

(function () {
    'use strict';
    angular.module('XaCommon').filter('XaFilterDateHeure', XaFilterDateHeure);
    function XaFilterDateHeure($filter, UtilsHelper, xaFrameworkSetting) {
        return function (valeur, typeArg, row) {
            if (!UtilsHelper.dateIsEmpty(valeur) && !UtilsHelper.isEmpty(typeArg)) {
                var heure = null;
                if (UtilsHelper.isUndefined(row) || UtilsHelper.isEmpty(row[typeArg]))
                    return $filter('date')(valeur, (xaFrameworkSetting.DateFormat || "dd/MM/yyyy"));
                else
                    return $filter('date')(UtilsHelper.dateSetTime(valeur, row[typeArg]), (xaFrameworkSetting.DateFormat || "dd/MM/yyyy") + ' HH:mm');
            }
            else
                return '';
        }
    };
})();

(function () {
    'use strict';
    angular.module('XaCommon').filter('XaFilterDateNaissanceSS', XaFilterDateNaissanceSS);
    function XaFilterDateNaissanceSS(UtilsHelper) {
        return function (valeur) {
            if (!UtilsHelper.isEmpty(valeur) && valeur.length == 12) {
                return valeur.substr(6, 2) + "/" + valeur.substr(4, 2) + "/" + valeur.substr(0, 4);
            }
            else
                return '';
        }
    };
})();

(function () {
    'use strict';

    angular.module('XaCommon').filter('XaFilterValeurToEmail', XaFilterValeurToEmail);
    function XaFilterValeurToEmail($sce, UtilsHelper) {
        return function (valeur) {
            if (!UtilsHelper.isEmpty(valeur)) {
                return $sce.trustAsHtml('<a href="mailto:' + valeur + '">' + valeur + '</a>');
            }
            else {
                return '';
            }
        }
    };
})();

(function () {
    'use strict';
    angular.module('XaCommon').filter('XaFilterHistoExamenCr', XaFilterHistoExamenCr);
    function XaFilterHistoExamenCr() {
        return function (val) {
            if (val.haveCr === true) {
                return 'XaCommon/Img/hascr.png';
            }
            else {
                return '';
            }
        }
    };
})();

(function () {
    'use strict';
    angular.module('XaCommon').filter('XaFilterHistoExamenPj', XaFilterHistoExamenPj);
    function XaFilterHistoExamenPj() {
        return function (val) {
            if (val.isPatient)
                return 'XaCommon/Img/patient15.png';
            else
                return '';
        }
    };
})();

(function () {
    'use strict';
    angular.module('XaCommon').filter('XaFilterHistoClassRdvPrevus', XaFilterHistoClassRdvPrevus);
    function XaFilterHistoClassRdvPrevus(UtilsHelper) {
        return function (val) {
            if (!UtilsHelper.isEmpty(val.numdrv))
                return (val.heureArriveeExamen != '00:00' && val.heureExamen == '00:00') ? 'rdv-presc-preaccueil' : 'rdv-presc-simple';
            else
                return 'rdv-simple';
        }
    };
})();
