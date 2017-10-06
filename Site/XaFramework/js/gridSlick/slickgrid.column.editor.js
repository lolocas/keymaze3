(function (local) {
	'use strict';

	local.service('xaSlickGridColumnEditor', function (xaSlickNumericEditor,
        xaSlickTextboxEditor,
        xaSlickDateEditor,
        xaSlickBoolEditor,
        xaSlickComboboxEditor,
		xaSlickHeureEditor,
        xaSlickColorEditor,
		xaSlickMultiTypeValueEditor) {

		// Maps the cellFilter property to a corresponding <slick> formatter.

		var editors = {
			'montant': xaSlickNumericEditor,
			'nombre': xaSlickNumericEditor,
			'heure': xaSlickHeureEditor,
			'string': xaSlickTextboxEditor,
			'date': xaSlickDateEditor,
			'bool': xaSlickBoolEditor,
			'combobox': xaSlickComboboxEditor,
			'color': xaSlickColorEditor,
			'multitype': xaSlickMultiTypeValueEditor
		};

		this.getEditor = function (column) {
			if (!column.enableCellEdit) return false;

			if (column.enableCellEdit && column.editorSettings && column.editorSettings.type && editors.hasOwnProperty(column.editorSettings.type)) {
				return editors[column.editorSettings.type];
			}

			return null;
		};

	});


	local.factory('xaSlickNumericEditor', function (xaSlickDefaultEditor) {

		function xaSlickNumericEditor(args) {
			var defaultTemplate = '<xa-numeric-text-box input-value="COL_FIELD" ';

			if (args.column.editorSettings) {
				if (args.column.editorSettings.nbDecimal)
					defaultTemplate += ' nb-decimal="' + args.column.editorSettings.nbDecimal + '"';
				if (args.column.editorSettings.min)
					defaultTemplate += ' min="' + args.column.editorSettings.min + '"';
				if (args.column.editorSettings.max)
					defaultTemplate += ' max="' + args.column.editorSettings.max + '"';
			}

			defaultTemplate += '></xa-numeric-text-box>';

			xaSlickDefaultEditor.getDefaults(args, defaultTemplate, this);

			this.init();
		}
		return xaSlickNumericEditor;
	});

	local.factory('xaSlickTextboxEditor', function (xaSlickDefaultEditor) {

		function xaSlickTextboxEditor(args) {

			var defaultTemplate = '<xa-text-box input-value="COL_FIELD"';
			var editSettings = args.column.editorSettings || {};

			if (args.column.editorSettings && args.column.editorSettings.maxLength)
				defaultTemplate += ' maxLength="' + args.column.editorSettings.maxLength + '"';

			defaultTemplate += '></xa-text-box>';

			xaSlickDefaultEditor.getDefaults(args, defaultTemplate, this);

			this.init();
		}
		return xaSlickTextboxEditor;
	});

	local.factory('xaSlickHeureEditor', function (xaSlickDefaultEditor) {

		function xaSlickHeureEditor(args) {

			var defaultTemplate = '<xa-time-picker input-value="COL_FIELD"></xa-time-picker>';
			var editSettings = args.column.editorSettings || {};

			xaSlickDefaultEditor.getDefaults(args, defaultTemplate, this);

			this.init();
		}
		return xaSlickHeureEditor;
	});

	local.factory('xaSlickDateEditor', function (xaSlickDefaultEditor) {

		function xaSlickDateEditor(args) {

			var defaultTemplate = '<xa-date-picker input-value="COL_FIELD"></<xa-date-picker>';

			args.formatFn = function (val) {
				if (typeof val == 'string')
					return new Date(val);
				return val;
			}

			xaSlickDefaultEditor.getDefaults(args, defaultTemplate, this);

			this.init();
		}
		return xaSlickDateEditor;
	});

	local.factory('xaSlickBoolEditor', function (xaSlickDefaultEditor) {

		function xaSlickBoolEditor(args) {

			var defaultTemplate = '<xa-image-checkbox checked="COL_FIELD"></<xa-image-checkbox>';

			xaSlickDefaultEditor.getDefaults(args, defaultTemplate, this);

			this.init();
		}
		return xaSlickBoolEditor;
	});

	local.factory('xaSlickColorEditor', function (xaSlickDefaultEditor) {

		function xaSlickColorEditor(args) {

			var defaultTemplate = '<xa-color-picker auto-open="true" input-value="COL_FIELD"></<xa-color-picker>';

			xaSlickDefaultEditor.getDefaults(args, defaultTemplate, this);

			this.init();
		}
		return xaSlickColorEditor;
	});



	local.factory('xaSlickComboboxEditor', function (xaSlickDefaultEditor) {

		function xaSlickComboboxEditor(args) {
			var sourceArr = null;
			if (angular.isFunction(args.column.editorSettings.source)) {
				sourceArr = args.column.editorSettings.source(args.item);
			}
			else sourceArr = args.column.editorSettings.source;

			var defaultTemplate = '<xa-combo-box source="comboboxSource" columns="columnsSource" did-change="applyNavigate" input-value="COL_FIELD" display-col="{{dc}}" value-col="{{vc}}" width="{{wg}}"  separator="{{sp}}" allow-other="o" multiple="m"></xa-combo-box>';

			args.extraScopeVars = [
				{ key: 'columnsSource', value: args.column.editorSettings.columnsSource },
				{ key: 'comboboxSource', value: sourceArr },
				{ key: 'dc', value: args.column.editorSettings.displayCol },
                { key: 'vc', value: args.column.editorSettings.valueCol },
                { key: 'm', value: args.column.editorSettings.multiple },
                { key: 'wg', value: args.column.editorSettings.width },
				{ key: 'o', value: args.column.editorSettings.allowOther },
				{ key: 'sp', value: args.column.editorSettings.separator },
				{
					key: 'applyNavigate', value: function applyNavigate() {
						if (args.column.editorSettings.navigateNextOnClickResult) {
							args.grid.navigateNext();
						}
					}
				}];


			xaSlickDefaultEditor.getDefaults(args, defaultTemplate, this);

			this.init();

		}
		return xaSlickComboboxEditor;
	});

	local.factory('xaSlickMultiTypeValueEditor', function (xaSlickDefaultEditor, xaTranslation) {

		function xaSlickMultiTypeValueEditor(args) {
		    if (!args.item) return;

			var configuration = args.item;
			args.extraScopeVars = [];
			var defaultTemplate = '';
			switch (configuration.type) {
			    case 'Number': 
			        defaultTemplate = '<xa-numeric-text-box input-value="COL_FIELD" min="0" nb-decimal="' + configuration.nbDecimal + '" ></xa-numeric-box>'; break;
				case 'LongText':
				case 'Text':
					if (configuration.listeValeur && configuration.listeValeur.length > 0) {
						var defaultTemplate = '<xa-combo-box source="comboboxSource" display-col="libelle" value-col="code" input-value="COL_FIELD" ></xa-combo-box>';
						args.extraScopeVars = [{ key: 'comboboxSource', value: configuration.listeValeur }];
					}
					else {
						defaultTemplate = '<xa-text-box input-value="COL_FIELD"></xa-text-box>';
					}
					break;
				case 'Boolean':
					var defaultTemplate = '<xa-combo-box columns="columnsSource"  source="comboboxSource" display-col="libelle" value-col="code" input-value="COL_FIELD" ></xa-combo-box>';
					args.extraScopeVars = [
						{ key: 'comboboxSource', value: [{ code: '-1', libelle: xaTranslation.instant('TXT_OUI') }, { code: '0', libelle: xaTranslation.instant('TXT_NON') }] },
						{ key: 'columnsSource', value: [{ field: 'libelle', displayName: xaTranslation.instant('TXT_LIBELLE') }] },
					];
					break;
				case 'Color':
					defaultTemplate = '<xa-color-picker auto-open="true" input-value="COL_FIELD"></<xa-color-picker>';
					break;

				default: throw "Type de donnees d'édition pour la colonne invalide";
			}
			xaSlickDefaultEditor.getDefaults(args, defaultTemplate, this);
			this.init();
		}
		return xaSlickMultiTypeValueEditor;
	});

	local.service('xaSlickDefaultEditor', function ($rootScope, $compile, $timeout, xaKeyHelper) {

		var obj = this;

		return {
			getDefaults: function (args, defaultTemplate, obj) {
				var col = args.column;

				var $compiledTemplate;
				var defaultValue;
				var scope = $rootScope.$new();

				obj.init = function () {
					$compile(defaultTemplate)(scope, function (clone) {
						$compiledTemplate = clone;
						$compiledTemplate.appendTo(args.container);
						$timeout(function () {
							if (args.column.editorSettings
								&& args.column.editorSettings.autoOpenCombo === true)
								$('input', args.container).mousedown();
							else
								$('input', args.container).focus();
						}, 0, false);
					});
				};
				var isDestroying = false;
				obj.destroy = function () {
					if (isDestroying) return;
					isDestroying = true;

					if (scope) scope.$destroy();
					$('input', args.container).off();
					$(args.container).empty();

					scope = null;
				};

				obj.focus = function () {
					$compiledTemplate.focus();
				};
				var initialValue = null;
				var initialItem = null;
				obj.loadValue = function (item) {
					initialValue = defaultValue = item[args.column.field];
					initialItem = item;
					if (args.formatFn)
						defaultValue = args.formatFn(defaultValue);

					scope.COL_FIELD = defaultValue;

					if (args.extraScopeVars && args.extraScopeVars.length > 0) {
						for (var idx = 0; idx < args.extraScopeVars.length; idx++)
							scope[args.extraScopeVars[idx].key] = args.extraScopeVars[idx].value;

					}



					if (!$rootScope.$$phase)
						scope.$digest();


				};

				obj.serializeValue = function () {
					if (restoreOriginal) return initialValue;
					return scope.COL_FIELD;
				};

				obj.applyValue = function (item, state) {
					item[args.column.field] = state;
				};


				obj.updateControlToGetLastValue = function () {
					if (scope.$$childHead.ctlType == 'COMBOBOX')
						scope.$$childHead.doBlur()
					else
						$('input', args.container).triggerHandler('blur');
				}

				obj.isValueChanged = function () {
					return (obj.serializeValue() !== defaultValue);
				};

				var restoreOriginal = false;
				obj.validate = function () {
					restoreOriginal = false;
					var res = args.grid.onCellChanging.notify({ oldValue: initialValue, value: scope.COL_FIELD, item: initialItem, column: args.column });

					if (res === false) //restore old val
						restoreOriginal = true; //args.cancelChanges();
					else if (res && typeof res == 'string') //res if object
					{
						return { valid: false, msg: res };
					}
					return {
						valid: true,
						msg: null
					};
				};

				obj.handleKeyPress = function gridDefaultEditPress(evt, keyArgs) { //todo Vivien: would recomment to use xaKeyHelper methods, isEsc / isEnter / etc
					var pressedKey = xaKeyHelper.getKey(evt, 'keypress');

					// Touche ECHAP = ANNULATION DE SAISIE MAIS ARRET PROPAGATION POUR PAS DE FERMETURE DE FENETRE
					if (pressedKey == 27) {
						evt.stopPropagation();
					}

					if (scope.$$childHead.ctlType == 'COMBOBOX') {

						// Dans le cas du mutli, ENTER ne doit pas valider le champ.
						if (pressedKey == 13 && scope.$$childHead.multiple == true)
							evt.skipGridProcessing = true;

						// COMBO TOUCHE HAUT OU BAS IGNORER
						if ([38, 40, 37, 39].indexOf(pressedKey) > -1) {
							evt.skipGridProcessing = true;
						}

						// Si activation option de navigation, l'access à la cellule suivante est géré par la touche tab / enter.
						if (args.column.editorSettings.navigateNextOnClickResult)
						{
							if ([9,13].indexOf(pressedKey) > -1) {
								evt.skipGridProcessing = true;
							}
						}
					}
				};
			}
		}

	});

})(window.XaNgFrameworkSlickGrid);