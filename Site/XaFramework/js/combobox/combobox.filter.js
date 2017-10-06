(function(local) {
	'use strict';

	//
	// This filter is used for filtering combobox items who's fields 
	// (display or value) are matching some text.
	//
	local.filter('xaComboBoxFilter', function() {

		var isMatch = function(token, label, strict) {

			var labelString = label.toString();

			// On renvoi false si la valeur cherchée est vide
			 if (labelString.length == 0) {
				return false;
			}

			return strict ?
				labelString === token :
				labelString.toUpperCaseWithoutAccent().indexOf(token.toUpperCaseWithoutAccent()) > -1;
		};

		function matchHasToken(match, tokens, strict, matchFields) {

			return _.any(matchFields, function(matchField) {
				return _.some(tokens, function (t) { return isMatch(t, match.model[matchField], strict); });
			});

		}

		return function(matches, text, separator, strict, matchFields) {

			if (!text) {
				return matches;
			}

			var tokens = _.filter(text.split(separator), function(t) { return t && angular.isString(t); });

			if (tokens.length === 0) {
				return matches;
			}

			return _.filter(matches, function(m) { return matchHasToken(m, tokens, strict, matchFields); });

		};

	});

})(window.XaNgFrameworkComboBox);