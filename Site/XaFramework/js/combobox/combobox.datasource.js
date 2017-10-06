(function(local) {
	'use strict';

	local.factory('ComboboxDataSource', function(comboboxDataSourceBuilder, $filter) {

		/// TODO: Use a model for matches.

		var LABEL_FIELD_NAME = 'label',
			VALUE_FIELD_NAME = 'value';

		function ComboboxDataSource(multiple, separator, allowOther) {

			this.collection = [];
			this.columnsToSearch = [];
			this.filteredCollection = [];
			this.valueText = '';
			this.displayText = '';
			this.multiple = multiple;
			this.separator = separator || ',';
			this.onBeforeSelectionChange = angular.noop;
			this.onAfterSelectionChange = angular.noop;
			this.onDisplayTextChangeCallback = angular.noop;
			this.onValueTextChangeCallback = angular.noop;
			this.filter = $filter('xaComboBoxFilter');
			this.allowOther = allowOther || false;
		}

		ComboboxDataSource.prototype = {

			initialize: function (ctx) {
				this.collection = comboboxDataSourceBuilder.buildMatches(ctx.dataSource, ctx.columns, ctx.displayColumn, ctx.valueColumn);
				this.columnsToSearch = ctx.columns.map(function (item) {return item.field});
				
				this.setValueText(ctx.valueText);
			},

			setDisplayText: function (text, preventNotification) {

				var originalValueText = this.valueText,
					originalDisplayText = this.displayText,
					originalSelection = this.getSelectedItems();

				this.displayText = text || '';
				
				// Maj datasource.
				this.filteredCollection = this.filter(this.collection, this.displayText, this.separator, false, this.columnsToSearch);
				if (this.multiple && originalSelection.length == this.filteredCollection.length)
					this.filterCollection = this.collection;
				
				// Identificaion des lignes selectionnées.
				this.onDisplayTextChangeCallback(this.displayText, true);
		
				var tokens = text ? text.split(this.separator) : [];
				var newData = _.filter(this.filteredCollection, function (m) { return (_.contains(tokens, m.label) || _.contains(tokens, m.value)) });

				// En cas de saisie sur un suggestion control, si je veux supprimer un caracter la valeur reste selectionné.
				if (this.allowOther) {
					angular.forEach(this.filteredCollection, function (m) {
						m.selected = (text == m.value);
					});
				}

				// MAJ Instantanée si retour à valeur vide ou multiple
				if (this.valueText != matchesToString(newData, VALUE_FIELD_NAME, this.separator)) {
				    if (this.multiple && tokens.length==newData.length)
				        this.select(newData);
				    else if (!this.multiple) {
						// Desactivation de la selection automatique de valeur sauf pour chaine vide.
				    	if ($.trim(text) == '') //newData.length == 1 ||
				    		this.select(null);  //*newData.length == 1 ? newData[0] :
				    }
				}
				
			},

			setValueText: function(text) {

				this.valueText = text || '';
				this.filteredCollection = this.collection; //this.multiple ? this.collection : this.filter(this.collection, this.valueText, this.separator, true, ['value']);
				this._markSelectedMatches();
				this.displayText = this.allowOther ? text : matchesToString(this.getSelectedItems(), LABEL_FIELD_NAME, this.separator);

				this.onDisplayTextChangeCallback(this.displayText);
				this.onValueTextChangeCallback(this.valueText);

			},

			getSelectedItems: function() {
				return _.filter(this.filteredCollection, function(match) { return match.selected && angular.isDefined(match.value); });
			},

			select: function(match) {

				var self = this;

				if (this.allowOther) {
					var newValue = match || '';
					newValue = newValue.label || newValue;

					var newSingle = {
						value: newValue,
						label: newValue,
						model: newValue
						};

					var oldSingle = {
						value: this.valueText,
						label: this.valueText,
						model: this.valueText
					};

					var continueSingle = this.onBeforeSelectionChange(newSingle, oldSingle);

					if (continueSingle === false) {
						return;
					}

					self.onAfterSelectionChange(newSingle, oldSingle);
				}
				else if (this.multiple) {
				    //raul: crash when you hit enter in the textbox, with no selection. match is undefined
				    if (match == undefined) return;
					var currentMultipleSelection = this.getSelectedItems(); /// TODO: don't use a function.

					var futureMultipleSelection = null;
					if (angular.isArray(match))
						futureMultipleSelection = match;
					else
						futureMultipleSelection = match.selected ?
						_.without(currentMultipleSelection, match) :
						currentMultipleSelection.concat([match]);

					var oldMultiple = {
						value: this.valueText,
						label: this.displayText,
						model: mapModel(currentMultipleSelection)
					};

					var newMultiple = {
						value: matchesToString(futureMultipleSelection, VALUE_FIELD_NAME, this.separator),
						label: matchesToString(futureMultipleSelection, LABEL_FIELD_NAME, this.separator),
						model: mapModel(futureMultipleSelection)
					};

					var continueMultiple = this.onBeforeSelectionChange(newMultiple, oldMultiple);

					if (continueMultiple === false) {
						return;
					}

					if (angular.isArray(match))
						angular.forEach(this.collection, function (m) { m.selected = _.contains(match, m); });
					else
						match.selected = !match.selected;

					this.valueText = newMultiple.value;
					this.displayText = newMultiple.label;

					self.onAfterSelectionChange(newMultiple, oldMultiple);

				} else {

					var oldSingle = {
						value: this.valueText,
						label: this.displayText,
						model: _.first(mapModel(this.getSelectedItems())), /// TODO: don't use a function.
					};

					var newSingle = {
						value: match ? matchesToString([match], VALUE_FIELD_NAME, this.separator) : '',
						label: match ? matchesToString([match], LABEL_FIELD_NAME, this.separator) : '',
						model:match ? match.model : ''
					};

					var continueSingle = this.onBeforeSelectionChange(newSingle, oldSingle);

					if (continueSingle === false) {
						return;
					}

					angular.forEach(this.filteredCollection, function(m) { m.selected = false; });
					if (match) match.selected = true;
					this.valueText = newSingle.value;
					this.displayText = newSingle.label;

					self.onAfterSelectionChange(newSingle, oldSingle);
				}
			},

			toggle: function() {

				if (!this.multiple) {
					return;
				}

				var shouldSelectAll = _.any(this.filteredCollection, function(m) { return !m.selected; });
				var currentMultipleSelection = this.getSelectedItems();
				var futureMultipleSelection = shouldSelectAll ? this.filteredCollection : [];

				var oldMultiple = {
					value: this.valueText,
					label: this.displayText,
					model: mapModel(currentMultipleSelection)
				};

				var newMultiple = {
					value: matchesToString(futureMultipleSelection, VALUE_FIELD_NAME, this.separator),
					label: matchesToString(futureMultipleSelection, LABEL_FIELD_NAME, this.separator),
					model: mapModel(futureMultipleSelection)
				};

				var continueMultiple = this.onBeforeSelectionChange(newMultiple, oldMultiple);

				if (continueMultiple === false) {
					return;
				}

				angular.forEach(this.filteredCollection, function(match) { match.selected = shouldSelectAll; });

				this.valueText = newMultiple.value;
				this.displayText = newMultiple.label;

				this.onDisplayTextChangeCallback(this.displayText);
				this.onValueTextChangeCallback(this.valueText);
				this.onAfterSelectionChange(newMultiple, oldMultiple);

			},

			reset: function () {
			    this.filteredCollection = this.collection; //.multiple ? this.collection : this.filter(this.collection, this.valueText, this.separator, true, ['value']);
				this._markSelectedMatches();
				
				// Réaliser des MAJS de valeur uniquement en cas de changement ...
				if (this.allowOther) {
					if (this.valueText != this.displayText)
						this.setValueText(this.displayText)
				}
				else {
					var newDisplayText = matchesToString(this.getSelectedItems(), LABEL_FIELD_NAME, this.separator);
					if (this.displayText != newDisplayText) {
						this.displayText = newDisplayText;
						this.onDisplayTextChangeCallback(this.displayText);
					}
				}
				
			},

			unfilter: function() {
				this.filteredCollection = this.collection;
			},

			beforeSelectionChange: function(callback) {
				this.onBeforeSelectionChange = callback;
				return this;
			},

			afterSelectionChange: function(callback) {
				this.onAfterSelectionChange = callback;
				return this;
			},

			onDisplayTextChange: function(callback) {
				this.onDisplayTextChangeCallback = callback;
				return this;
			},

			onValueTextChange: function(callback) {
				this.onValueTextChangeCallback = callback;
				return this;
			},

			_markSelectedMatches: function() {
				var tokens = [];
				if (this.multiple === true)
					tokens = this.valueText ? this.valueText.split(this.separator) : [];
				else
					tokens = this.valueText ? [this.valueText] : [];

				angular.forEach(this.filteredCollection, function(m) {
					m.selected = _.contains(tokens, m.value);
				});

			},

			checkCurrentValueIsInDatasource: function() {
				var tokens = [];
				var currentValue = this.valueText;

				// Remove last, first separator
				if (currentValue.charAt(0) === this.separator)
					currentValue = currentValue.substr(1);
				if (currentValue.charAt(currentValue.length -1) === this.separator)
					currentValue = currentValue.slice(0, -1);

				if (this.multiple === true)
					tokens = currentValue ? currentValue.split(this.separator) : [];
				else
					tokens = currentValue ? [currentValue] : [];


				var result = _.filter(this.filteredCollection, function(m) {
					return _.contains(tokens, m.value);
				});

				// PATCH POUR EDB
				if (tokens.length == 1 && tokens[0].toString() == '0')
					return true;

				if (result.length == tokens.length)
					return true;
				else
					return false;

			},

			destroy: function() {
				this.filteredCollection.length = 0;
				this.collection.length = 0;
				this.onBeforeSelectionChange = null;
				this.onAfterSelectionChange = null;
				this.onDisplayTextChangeCallback = null;
				this.onValueTextChangeCallback = null;
				this.filter = null;
			}
		};


		function matchesToString(collection, targetField, separator) {
			var labels = _.pluck(collection, targetField);
			return labels.join(separator);
		};

		function mapModel(collection) {
			return _.map(collection, function(m) { return m.model; });
		}


		return ComboboxDataSource;

	});

	local.factory('ComboboxItem', function() {

		function ComboboxItem(data) {

			this.id = data.id;
			this.label = data.label;
			this.model = data.model;
			this.value = data.value;
			this.selected = false;
		}

		return ComboboxItem;

	});

})(window.XaNgFrameworkComboBox);