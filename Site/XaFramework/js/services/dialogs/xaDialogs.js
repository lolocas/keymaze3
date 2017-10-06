(function (local) {
	'use strict';

	//a strip down version of https://github.com/m-e-conroy/angular-dialog-service

	var baseCtrl = function ($scope, $windowInstance, header, msg, opts) {

		$scope.header = header;
		$scope.msg = msg;
		$scope.hideClose = (opts && opts.hideClose) ? true : false;

		$scope.closeFn = function () {
			$scope.closeForm(false);
		};

		$scope.validateFn = function () {
			$scope.closeForm(true);
		};

		$scope.no = function () {
			$windowInstance.dismiss('no');
		};

		$scope.yes = function () {
			$windowInstance.close('yes');
		};

	}

	local.controller('errorDialogCtrl', function ($scope, $windowInstance, header, msg, opts) {
		baseCtrl($scope, $windowInstance, header, msg, opts);
	})
		.controller('notifyDialogCtrl', function ($scope, $windowInstance, header, msg, opts) {
			baseCtrl($scope, $windowInstance, header, msg, opts);
		})
		.controller('confirmDialogCtrl', function ($scope, $windowInstance, header, msg, opts) {
			baseCtrl($scope, $windowInstance, header, msg, opts);
		});

	local.provider('dialogs', function () {


		this.$get = function (xaWindow, $q, xaDirectiveHelper) {

			return {
				error: function (header, msg, opts) {


					return $q(function (acc, rej) {
						var win = xaWindow.open({
							width: (opts && opts.width) ? opts.width : '500px',
							templateUrl: '../js/services/dialogs/error.tpl.html',
							controller: 'errorDialogCtrl',
							windowClass: 'dialogs dialogs-error',
							windowMode: 'modal-gray',
							allowMultiple: true,
							id: 'DlgError',
							resolve: {
								header: function () { return angular.copy(header); },
								msg: function () { return angular.copy(xaDirectiveHelper.textToHtml(msg)); },
								opts: function () { return angular.copy(opts); }
							}
						});
						win.result.then(function () { acc(); }, function () { acc(); });
					});
				},

				notify: function (header, msg, opts) {

					return $q(function (acc, rej) {
						var win = xaWindow.open({
							width: (opts && opts.width) ? opts.width : '500px',
							templateUrl: '../js/services/dialogs/notify.tpl.html',
							controller: 'notifyDialogCtrl',
							windowClass: 'dialogs dialogs-notify',
							windowMode: 'modal-gray',
							id: 'DlgInformation',
							allowMultiple: true,
							resolve: {
								header: function () { return angular.copy(header); },
								msg: function () { return angular.copy(xaDirectiveHelper.textToHtml(msg)); },
								opts: function () { return angular.copy(opts); }

							}
						});
						win.result.then(function () { acc(); }, function () { acc(); });
					});
				},

				confirm: function (header, msg, opts) {

					return xaWindow.open({
						width: (opts && opts.width) ? opts.width : '500px',
						templateUrl: '../js/services/dialogs/confirm.tpl.html',
						controller: 'confirmDialogCtrl',
						windowClass: 'dialogs dialogs-confirm',
						windowMode: 'modal-gray',
						id: 'DlgConfirmation',
						allowMultiple: true,
						resolve: {
							header: function () { return angular.copy(header); },
							msg: function () { return angular.copy(xaDirectiveHelper.textToHtml(msg)); },
							opts: function () { return angular.copy(opts); }
						}
					}).result;
				},

			};

		};
	});

})(window.XaNgFrameworkServices);
