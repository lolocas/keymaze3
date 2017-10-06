(function () {
	'use strict';

	angular.module('XaCommon').service('DialogHelper', DialogHelper)

	function DialogHelper(dialogs, ProfilerService, UtilsHelper) {



		this.showErrorMessage = showErrorMessage;
		this.showInfoMessage = showInfoMessage;
		this.showConfirmMessagePromise = showConfirmMessagePromise;



		function showErrorMessage(title, message, opt) {
			ProfilerService.addScreen('showErrorMessage', 'Dialog', 'ERROR', [title, message]);
			return dialogs.error(UtilsHelper.getLabelIfStartWithTxt(title), UtilsHelper.getLabelIfStartWithTxt(message), opt);
		};

		function showInfoMessage(title, message, opt) {
			ProfilerService.addScreen('showInfoMessage', 'Dialog', 'INFO', [title, message]);
			return dialogs.notify(UtilsHelper.getLabelIfStartWithTxt(title), UtilsHelper.getLabelIfStartWithTxt(message), opt);
		};

		function showConfirmMessagePromise(title, message, opt) {
		    ProfilerService.addScreen('showConfirmMessagePromise', 'Dialog', 'CONFIRM', [title, message]);
			var dlg = dialogs.confirm(UtilsHelper.getLabelIfStartWithTxt(title), UtilsHelper.getLabelIfStartWithTxt(message), opt);
			return dlg.then(function (btn) { return true; },
							function (btn) { return false; })
		};



	};

})();