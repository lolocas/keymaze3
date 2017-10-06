(function(local, $) {
	'use strict';

	local.directive('xaDatePicker', function ($filter, $timeout, $document, $rootScope, xaKeyboard, xaTranslation, xaKeyHelper, xaDirectiveHelper, xaFrameworkSetting) {

		$.datepick.setDefaults(xaFrameworkSetting.getDateRegionalOptions());

		var invalidDateDialogHeader = xaTranslation.instant('TXT_DATEINVALIDE_TITRE'),
			invalidDateDialogMessage = xaTranslation.instant('TXT_DATEINVALIDE_MSG'),
			minDateDialogMessage = xaTranslation.instant('TXT_MINDATEINVALIDE_MSG'),
			maxDateDialogMessage = xaTranslation.instant('TXT_MAXDATEINVALIDE_MSG'),
            blurThrottleDelay = 50,
            defaultEmptyDate = new Date(Date.parse('0001-01-01T00:00:00')),
            dateFormat = xaFrameworkSetting.DateFormat || "dd/MM/yyyy";

		var dateSeparatorUnescaped = dateFormat.toUpperCase().replace(/D/g, '').replace(/M/g, '').replace(/Y/g, '')[0];
		var dateSeparator = dateSeparatorUnescaped;
            if (dateSeparator == '.') dateSeparator = '\\.'; //TODO: escape
 
		var separatorRegEx = new RegExp(dateSeparator, 'g'),
			strippedDateFormat = dateFormat.replace(separatorRegEx, '').toUpperCase();
			

		var dateRegEx = /^(0[1-9]|1\d|2\d|3[01])(0[1-9]|1[0-2])\d{4}$/; ///^(0[1-9]|1\d|2\d|3[01])(0[1-9]|1[0-2])(19|20)\d{2}$/,
         
		var datePlaceholder = dateFormat.toUpperCase().replace(/D/g, '_').replace(/M/g, '_').replace(/Y/g, '_');

		return {
			restrict: 'EA',
			replace: true,
			templateUrl: '../js/datePicker/datePicker.tpl.html',
			scope: {
				min: '=',
				max: '=',
				selectedDate: '=inputValue',
				position: '@?',
				willChange: '&?',
				didChange: '&?',
                canedit: '=?',
				onError: '&?',
				emptyIsNull: '=?'
			},
			link: datePickerDefaultLinkFn
		};



		function datePickerDefaultLinkFn(scope, element, attrs) {
			scope.datePlaceholder = datePlaceholder;

			if (scope.canedit == undefined) scope.canedit = true;
			var willChangeFn =  scope.willChange ? scope.willChange() : undefined;
			var didChangeFn = scope.didChange ? scope.didChange() : undefined;

			var defaultDisplayValue = '';

			//
			// Private variables.
			//
			var emptyDate = scope.emptyIsNull ? null : defaultEmptyDate,
				$inputElem = element.find('input').attr('id', 'datePicker_input_' + scope.$id);

			if (scope.selectedDate === null || scope.selectedDate === undefined || scope.selectedDate === '')
			    scope.selectedDate = emptyDate;

			xaDirectiveHelper.setTestIdOnElement(element, 'dt', attrs.inputValue);

			if ($rootScope.isTouchDevice) {
			    $inputElem.attr('readonly', 'true');
			    $inputElem.click(function() {
			        scope.toggle();
			    });
			}

			//
			// Local scope variables.
			//
			scope.opened = false;
			scope.isDisabled = false;
			scope.displayValue = defaultDisplayValue;

			//
			// Local scope methods.
			//
			scope.up = function () {
				addDays(1);
			};

			scope.down = function () {
				addDays(-1);
			};

			scope.toggle = function (evt) {
				if (scope.isInitializing == true)
					return;
				scope.opened = !scope.opened;

				if (!scope.opened) {
					destroyPlugin();					
				} else {
					initDatepickPlugin();
					
					$inputElem.datepick("show");

					scope.isInitializing = true;

				}

			};

			//
			// Validate external parameters.
			//
			initializeDirective();

			//
			// Create $$watchers.
			//
			var unwatchSelDate =		scope.$watch('selectedDate', selectedDateWatchFn);
			var unwatchDisplayValue =	scope.$watch('displayValue', inputValueWatchFn);
			var unwatchMin =			scope.$watch("min", minWatchFn);
			var unwatchMax =			scope.$watch("max", maxWatchFn);
			var unwatchCanedit =		scope.$watch('canedit', disabledObserveFn);
			scope.$on('$destroy', destroy);



			$inputElem.on('focus', function () {
				$(this).select();
			});

			$inputElem.on('blur', function () {
			/*	scope.focus = false;
				if (scope.opened) {
					scope.opened = false;
					if (!$rootScope.$$phase) scope.$digest(); //why is a digest neede here? $timeout will trigger one!!!
				}*/
				
			//	$(this).val($(this).val());	//get rid of the selection
			});

			$inputElem.on('keypress', function (e) {
			    var pressedKey = xaKeyHelper.getKey(e, 'keypress');

			    if (xaKeyHelper.isNavigationKey(pressedKey))
			    	return true; 

			    var isNumeric = xaKeyHelper.isNumber(pressedKey);
			    var isSep = xaKeyHelper.isChar(pressedKey, dateSeparatorUnescaped); //also allow "/"

				
			    if (xaKeyHelper.isEnter(pressedKey)) {
					$inputElem.triggerHandler('blur');
					$inputElem.triggerHandler('focus');
					e.preventDefault(); return;
				}

			    if (!isNumeric && !isSep) {
					e.preventDefault(); return;
				}
			});

			$inputElem.on('keydown', documentKeyBind);

			//
			// Private methods implementation.
			//
			function initializeDirective() {
				if (angular.isDefined(scope.selectedDate) && scope.selectedDate !== null && !angular.isDate(scope.selectedDate)) {
					try {
						scope.selectedDate = new Date(scope.selectedDate);
					} catch (error) {
						throw new Error('Only dates or valid date strings are allowed in xa-date-picker.');
					}
				}
			}

			function showError(text) {
				var tooltipData = {
					placement: 'bottom',
					trigger: 'focus',
					html: true,
					title: text
				};
				$inputElem.addClass('has-err').tooltip(tooltipData);
			}

			function removeError() {
				$inputElem.removeClass('has-err').tooltip('destroy');
			}

			function isEmptyDate(date) {
				return date == undefined || date == '' || date == '0001-01-01T00:00:00' || +date == +Date.parse('0001-01-01T00:00:00');
			}

			function addDays(count) {
				var m;
				if (isEmptyDate(scope.selectedDate)) 
					m = moment(new Date());
				else 
					m = moment(scope.selectedDate).add(count, 'days');

				var isAfterMinimum = angular.isDefined(scope.min) ? m.isAfter(moment(scope.min)) : true;
				var isBeforeMaximum = angular.isDefined(scope.max) ? m.isBefore(moment(scope.max)) : true;

				if (isAfterMinimum && isBeforeMaximum) {
					scope.selectedDate = m.toDate();
				}

				if (!$rootScope.$$phase) scope.$apply();


				$timeout(function () {
					if ($inputElem)
						$inputElem.select();
				}, 0, false)
			};

		

			function initDatepickPlugin() {

				var confObj = {

					showAnim: false,
					showOnFocus: false,
					dateFormat: dateFormat,
					selectDefaultDate: false,
					showOtherMonths: true,
					yearRange: "-100:+10",

					// Ideally we should focus back the input on any action inside the picker
					// but this doesn't work as the picker expects to have focus on the dropdowns.
					//onShow: registerPickerEvents,

					onSelect: function(date) {
						scope.selectedDate = date[0];
						if (!$rootScope.$$phase) scope.$apply();
			
						$inputElem.select();

					},

					onShow : function () {
						scope.isInitializing = false;
					},

					onClose: function () {
						scope.opened = false;
						scope.isInitializing = false;

						if (!$rootScope.$$phase) scope.$apply();
						destroyPlugin();
					},

					onChangeMonthYear: function() {
						$inputElem.select();					

					}
				};

				if (scope.min) {
					confObj.minDate = scope.min;
				}
				if (scope.max) {
					confObj.maxDate = scope.max;
				}
				if (scope.selectedDate) {
					
					if (isEmptyDate(scope.selectedDate)) {
						confObj.selectDefaultDate = false;
						confObj.defaultDate = new Date();
					}
					else {
						confObj.selectDefaultDate = true;
						confObj.defaultDate = scope.selectedDate;
						confObj.selectedDates = [scope.selectedDate];
					}
				}

				$inputElem.datepick(confObj);
			};

			function documentKeyBind(evt) {
				if (!$inputElem.is(":focus")) { //trigger ONLY for current datepicker
					return;
				}

                var pressedKey = xaKeyHelper.getKey(evt, 'keydown');

                if (pressedKey === 38) {
					scope.up();
					if (!scope.$$phase) scope.$apply();
				}

                if (pressedKey === 40) {
					scope.down();
					if (!scope.$$phase) scope.$apply();
                }

                if (pressedKey === xaKeyHelper.isEsc()) {
                	if (scope.opened) {
                		scope.toggle();
						
                		evt.preventDefault();
                		e.stopPropagation();
                	}
                	if (!scope.$$phase) scope.$apply();
                }
			};

			function onChangeNotify() {
				if (angular.isDefined(attrs.onChange)) {
					scope.onChange({ date: scope.selectedDate });
				}
			};

			function destroyPlugin() {
				try {
					$inputElem.datepick('destroy');
					//$inputElem.removeClass("hasDatepicker").removeAttr('id');
				}
				catch (e) { }
			}

			function destroy() {
				destroyPlugin();

				$inputElem.off('keydown', documentKeyBind);

				removeError();
				$inputElem.off(); //removes all handlers

				$inputElem = null;
				
				unwatchCanedit();
				unwatchSelDate();
				unwatchDisplayValue();
				unwatchMin();
				unwatchMax();

			}

			function uniformValue(val) {
			    val = val || '';
			    var currDate = new Date();

			    var strippedVal = val.replace(new RegExp(dateSeparator, 'g'), '');
			    if (strippedVal == '') {
			        $inputElem.val('');
			        scope.displayValue = '';
			        return '';
			    }

			    //needs month + year autofilled?
			    if (strippedVal.length == 2 || strippedVal.length == 1) // 01
			    {
				    strippedVal = xaKeyHelper.padLeft(strippedVal, 2) + xaKeyHelper.padLeft(currDate.getMonth() + 1, 2) + currDate.getFullYear(); //month is 0-based!!!
				}
				else if (strippedVal.length == 4) { // 0102
					strippedVal = strippedVal + currDate.getFullYear();
				}
				else if (strippedVal.length == 6) { //010203
					strippedVal = xaKeyHelper.insertCharAt(strippedVal, 4, '20');
				}

				strippedVal = xaKeyHelper.insertCharAt(strippedVal, 2, dateSeparatorUnescaped);
				strippedVal = xaKeyHelper.insertCharAt(strippedVal, 5, dateSeparatorUnescaped);
				
                //raul: can see no reason why the below should be here. it will enter an infinite loop when called from inputValueWatchFn
				//$inputElem.val(strippedVal);
				//scope.displayValue = strippedVal;

				return strippedVal;
			}

			function inputValueWatchFn(val, old) {
			    val = uniformValue(val);
			    old = uniformValue(old);

				val = val ? val.replace(separatorRegEx, '') : val;
				old = old ? old.replace(separatorRegEx, '') : old;

				if (val && val !== old) {

					if (dateRegEx.test(val)) {

						removeError();

						var newDate = moment(val, strippedDateFormat).toDate();

						triggerDateChange(newDate);

					} else {

						showError(invalidDateDialogHeader);
						if (angular.isFunction(scope.onError)) {
							scope.onError({ error: $inputElem.val() });
						}

						$inputElem.val('');
						scope.displayValue = '';
						triggerDateChange(emptyDate);

					}
				}

				if (val === '' && old !== '') {
					//todo: show error?
					triggerDateChange(emptyDate);
					return;

				}

			}

			function triggerDateChange(newDate) {
				if (newDate !== scope.selectedDate) {

					var cont = true;

					if (angular.isFunction(willChangeFn)) {
						cont = willChangeFn(newDate);
					}

					if (cont === false) {
						scope.displayValue = old;
						return;
					}

					var oldDate = scope.selectedDate;

					scope.selectedDate = newDate;

					xaDirectiveHelper.removeErrorTooltip(element);
					if (angular.isFunction(didChangeFn)) {
						$timeout(function () {
							didChangeFn(scope.selectedDate, oldDate);
						});
					}
				}
			}

			function selectedDateWatchFn(value) {

			    if (value && value.length && angular.isString(value) && !angular.isDate(value)) {
			        scope.selectedDate = new Date(value);
			        value = scope.selectedDate;
			    }

			    if (!value || isEmptyDate(value)) {

					scope.displayValue = defaultDisplayValue;

				} else {

					var m = moment(value).startOf('day'); //selected day is at noon, bigger than max day, which is at midnight.

					if (angular.isDate(scope.min) && m.isBefore(moment(scope.min))) {

						showError(minDateDialogMessage.replace('{0}', $inputElem.val()));
						scope.displayValue = defaultDisplayValue;

					} else if (angular.isDate(scope.max) && m.isAfter(moment(scope.max))) {

						showError(maxDateDialogMessage.replace('{0}', $inputElem.val()));
						scope.displayValue = defaultDisplayValue;

					} else {

						removeError();
						scope.displayValue = $filter("date")(value, dateFormat);

					}
				}
			}

			function disabledObserveFn(value) {
				if (value != true) {
					$inputElem.removeClass('has-err').tooltip('destroy');

					if (scope.opened) {
						scope.opened = false;
					}
				}
			}

			function minWatchFn(newVal) {
				if ($inputElem.data('datepick')) {
					$inputElem.datepick('option', { minDate: newVal });
				}
			}

			function maxWatchFn(newVal) {
				if ($inputElem.data('datepick')) {
					$inputElem.datepick('option', { maxDate: newVal });
				}
			}
		}
	});

})(window.XaNgFrameworkDatePicker, window.jQuery);