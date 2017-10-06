(function (local) {
	'use strict';

	local.service('xaPeriodService', function ($filter, xaTranslation, xaFrameworkSetting) {

		var xaPeriodService = this;

		var minDate = new Date('1/1/1800'),
			maxDate = new Date('1/1/2100');

		

		xaPeriodService.isToday = function (date) {
			var today = moment().startOf('day');
			return moment(date).diff(today) === 0;
		};

		xaPeriodService.isYesterday = function (date) {
			var yesterday = moment().startOf('day').add(-1, 'days');
			return moment(date).diff(yesterday) === 0;
		};

		xaPeriodService.isTomorrow = function (date) {
			var tomorrow = moment().startOf('day').add(1, 'days');
			return moment(date).diff(tomorrow) === 0;
		};

		xaPeriodService.weekDifference = function (from, to) {
			var fromMoment = moment(from).startOf('day');
			var toMoment = moment(to).startOf('day');
			return Math.abs(fromMoment.diff(toMoment, 'days')) / 7;
		};

		xaPeriodService.minDate = function () {
			return  minDate;
		};

		xaPeriodService.maxDate = function () {
			return  maxDate;
		};

		xaPeriodService.isMinimum = function (date) {
			return date === minDate;
		};

		xaPeriodService.isMaximum = function (date) {
			return date === maxDate;
		};

		xaPeriodService.today = function () {
			return {
				from: moment().startOf('day').toDate(),
				to: moment().endOf('day').toDate()
			};
		};

		xaPeriodService.tomorrow = function () {
			return {
				from: moment().add(1, "days").startOf('day').toDate(),
				to: moment().add(1, "days").endOf('day').toDate()
			};
		};

		xaPeriodService.yesterday = function () {
			return {
				from: moment().subtract(1, "days").startOf('day').toDate(),
				to: moment().endOf('day').toDate()
			};
		};

		xaPeriodService.weeks = function (numberOfWeeks, past) {
			return {
				from: past ? moment().startOf('day').add(numberOfWeeks * -1, 'weeks').toDate() : moment().startOf('day').toDate(),
				to: past ? moment().startOf('day').toDate() : moment().endOf('day').add(numberOfWeeks, 'weeks').toDate()
			};
		};

		xaPeriodService.all = function () {
			return {
				from: minDate,
				to: maxDate
			};
		};

/*
		xaPeriodService.text = {
			today:,
			tomorrow: xaTranslation.instant('TXT_DEMAIN'),
			yesterday: xaTranslation.instant('TXT_DEPUIS_HIER'),
			from: xaTranslation.instant('TXT_DE'),
			to: xaTranslation.instant('TXT_A'),
			day: xaTranslation.instant('TXT_JOUR'),
			days: xaTranslation.instant('TXT_JOURS'),
			week: xaTranslation.instant('TXT_SEMAINE'),
			weeks: xaTranslation.instant('TXT_SEMAINES'),
			depuisX: xaTranslation.instant('TXT_DEPUISX'),
			jusquaX: xaTranslation.instant('TXT_JUSQUAX'),
			free: xaTranslation.instant('TXT_PERIODE_LIBRE'),
			all: xaTranslation.instant('TXT_PERIODE_ALL'),
			custom: xaTranslation.instant('TXT_CUSTOM')
		};*/

		xaPeriodService.updateDateFromValue = function (dateSaved) {
			var dateObj = {};
			dateSaved.mode = dateSaved.mode || 'past';
			switch (dateSaved.type) {
				case 'TODAY':
					dateObj = xaPeriodService.today();
					dateObj.title = xaTranslation.instant('TXT_AUJOURDHUI');
					break;
				case 'YESTERDAY':
					dateObj = xaPeriodService.yesterday();
					dateObj.title = xaTranslation.instant('TXT_DEPUIS_HIER');
					break;
				case 'TOMORROW':
					dateObj = xaPeriodService.tomorrow();
					dateObj.title = xaTranslation.instant('TXT_DEMAIN');
					break;

				case 'ONEWEEK':
					dateObj = xaPeriodService.weeks(1, dateSaved.mode == 'past');
					dateObj.title = (dateSaved.mode == 'past' ? '- ' : '') + '1 ' + xaTranslation.instant('TXT_SEMAINE');
					break;

				case 'TWOWEEKS':
					dateObj = xaPeriodService.weeks(2, dateSaved.mode == 'past');
					dateObj.title = (dateSaved.mode == 'past' ? '- ' : '') + '2 ' + xaTranslation.instant('TXT_SEMAINES');
					break;

				case 'FOURWEEKS':
					dateObj = xaPeriodService.weeks(4, dateSaved.mode == 'past');
					dateObj.title = (dateSaved.mode == 'past' ? '- ' : '') + '4 ' + xaTranslation.instant('TXT_SEMAINES');
					break;

				case 'ALL':
					dateObj = xaPeriodService.all();
					dateObj.title = xaTranslation.instant('TXT_PERIODE_ALL');
					break;

				case 'FREE': 
					dateObj.from = moment(dateSaved.from).toDate();
					dateObj.to = moment(dateSaved.to).toDate();
					dateObj.title = xaTranslation.instant('TXT_PERIODE_LIBRE');
					/*var diffDays = to.diff(from, 'days');
					dateObj.from = moment().startOf('day').add(diffDays * -1, 'days').toDate()
					dateObj.to = moment().startOf('day').toDate()*/
					break;

				 case 'SLIDER':
					var from = moment(dateSaved.from);
					var to = moment(dateSaved.to);

					var diffDays = dateSaved.typeinfo ||  to.diff(from, 'days');
					dateObj.from = moment().startOf('day').add(diffDays * (dateSaved.mode == 'past' ? -1 : 1), 'days').toDate()
					dateObj.to = moment().startOf('day').toDate();

					dateObj.typeinfo = diffDays;
					dateObj.title = (dateSaved.mode == 'past' ? xaTranslation.instant('TXT_DEPUISX') : xaTranslation.instant('TXT_JUSQUAX')).format(diffDays);
					break;

				case 'CUSTOM':
					var customPeriodSetting = _.find(xaFrameworkSetting.CustomPeriods, function (item) { return item.code == dateSaved.typeinfo });
					if (customPeriodSetting) {
						dateObj = xaPeriodService.perso(customPeriodSetting.type, customPeriodSetting.debut, customPeriodSetting.duree);
						dateObj.typeinfo = customPeriodSetting.code;
						dateObj.title = customPeriodSetting.libelle;
					}
					else {
						dateSaved.type = 'TODAY';
						dateObj = xaPeriodService.today();
						dateObj.title = xaTranslation.instant('TXT_AUJOURDHUI');
					}

					break;

				default: dateSaved.type = 'TODAY';
					dateSaved.type = 'TODAY';
					dateObj = xaPeriodService.today();
					dateObj.title = xaTranslation.instant('TXT_AUJOURDHUI');
					break;
			}
			dateObj.mode = dateSaved.mode;
			dateObj.type = dateSaved.type;
			dateObj.textRange = xaTranslation.instant('TXT_DU') + ' ' + $filter('date')(dateObj.from, xaFrameworkSetting.DateFormat) + ' ' + xaTranslation.instant('TXT_AU')  + ' ' + $filter('date')(dateObj.to, xaFrameworkSetting.DateFormat);

			return dateObj;


		}

		xaPeriodService.perso = function (type, debut, fin) {
			var dateDebut = dateToday();
			var dateFin = dateToday();

			switch (type) {
				case 'J':
					dateDebut = dateAddDays(dateDebut, debut);
					dateFin = moment(dateAddDays(dateDebut, fin - 1)).toDate();
					break;
				case 'S':
					dateDebut = dateAddDays(dateDebut, 7 * debut);
					var firstday = new Date(dateDebut.setDate(dateDebut.getDate() - (dateDebut.getDay()) + 1));
					dateFin = dateAddDays(dateDebut, 7 * (fin - 1));
					var lastday = new Date(dateFin.setDate((dateFin.getDate() + 1) - dateFin.getDay() + 6));
					break;
				case 'M':
					dateDebut = dateAddDays(dateDebut, 30 * debut);
					dateDebut = '01' + '/' + (dateDebut.getMonth() + 1) + '/' + dateDebut.getFullYear();
					dateDebut = new Date(moment(dateDebut).format('DD/MM/YYYY'));
					var dateDebutCopie = new Date(dateDebut);
					(dateDebutCopie.setMonth(dateDebutCopie.getMonth() + fin));
					dateFin = dateDebutCopie;
					dateFin = dateAddDays(dateFin, -1);
					break;
			}

			function dateToday() {
				var date1 = new Date();
				date1.setHours(0, 0, 0, 0);
				return date1;
			}

			function dateAddDays(date, days) {
				var result = new Date(date);
				result.setDate(result.getDate() + days);
				return result;
			}

			return {
				from: dateDebut,
				to: dateFin
			};
		};



	});

})(window.XaNgFrameworkServices);