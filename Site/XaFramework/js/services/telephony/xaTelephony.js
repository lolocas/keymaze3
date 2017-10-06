(function (local) {
	'use strict';

	/*
	 * Simple publisher/subscriber helper.
	 */

	local.service('xaTelephonyService', function () {
		
		this.conf = {
			'FR': {
				size: 10, code: '33', removeStartChar: 1, process: function (val) {

					var temp = val.substring(3, val.length);
					return '+33 ' + temp.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5").trim();
				}
			},
			'CH': {
				size: 9, code: '41', removeStartChar: 0, process: function (val) {
					var temp = val.substring(3, val.length);
					return '+41 ' + temp.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
				}
			},

			'DE': {
				size: 9, code: '49', removeStartChar: 1, process: function (val) {
					var temp = val.substring(3, val.length);
					return '+49 ' + temp.replace(/(\d{3})(\d{6})(\d{2})/, "$1 $2 $3").trim();
				}
			},

			'IT': {
				size: 9, code: '39', removeStartChar: 0, process: function (val) {
					temp = val.substring(3, val.length);
					return '+39 ' + temp.replace(/(\d{3})(\d{7})/, "$1 $2")
				}
			},


			'UK': {
				size: 9, code: '44', removeStartChar: 1, process: function (val) {
					temp = val.substring(3, val.length);


					return '+44 ' + temp.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")
				}
			}

		};

		var conf = this.conf;
		this.getDisplayValue = function getDisplayValue(country, value) {
			return parseContent(country, value, 'display');
		}

		this.getStorageValue = function getStorageValue(country, value) {
			return parseContent(country, value, '');
		}


		function isLetter(str) {
			var code = str.charCodeAt(0);
			if (((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122))) {
				return true
			}
			return false;
		}

		function getFirstAlphaCharIndex(input) {
			//Move the startIndex forward one because we ignore the index user set
			for (var i = 0; i < input.length; i++) {
				if (input.charAt(i) != '+' && isLetter(input.charAt(i))) {
					return i;
				}
			}

			return -1;
		}


		function findConfFromNumKey(val) {
			var keys = Object.keys(conf);
			for (var i = 0; i < keys.length; i++) {
				if (conf[keys[i]].code == val) {
					return conf[keys[i]];
				}
			}
			return null;
		}

		function parseContent(strCulture, input, format) {
			var pos = getFirstAlphaCharIndex(input);
			var extraContent = "";
			var num = "";

			if (pos > 0) {
				var text = input.substring(0, pos)
				num = text.replace(/[^0-9+]/g, "");
				extraContent = input.substring(pos - 1, input.length).trim();
			}
			else {
				num = input.replace(/[^0-9+]/g, "");
				extraContent = "";
			}

			if (num.length < 8)
				return input;

			if (num.indexOf('00') == 0) {
				num = '+' + num.substring(2, num.length);
			}

			if (num.indexOf('+') != 0)
				num = '+' + conf[strCulture].code + num.substring(conf[strCulture].removeStartChar, num.length);


			if (format == 'display') {
				var keyCode = num.substring(1, 3);
				var formatter = findConfFromNumKey(keyCode);


				if (formatter != null) {

					num = formatter.process(num);

				}
			}


			var finalInput = num + (extraContent != "" ? " " + extraContent : "");

			if (finalInput.length > 25)
				finalInput = finalInput.substring(0, 24);

			return finalInput;


		}



	});

})(window.XaNgFrameworkServices);