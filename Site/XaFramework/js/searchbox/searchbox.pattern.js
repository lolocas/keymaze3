(function(local) {
	'use strict';

	local.directive('xaSearchBoxPattern', function() {

		var separator = ',';

		return {
			restrict: 'E',
			replace: true,
			templateUrl: '../js/searchbox/searchbox.pattern.tpl.html',
			link: function(scope) {

				var unwatchActiveSep = scope.$watch('activeSeparatorInterval', function() {
					scope.highlightText = scope.controlSettings.searchPattern
						? scope.controlSettings.searchPattern.split(separator)[scope.activeSeparatorInterval]
						: '';
				});

				scope.$on('$destroy', function() {
					unwatchActiveSep();
				});
			}
		};
	});

	local.filter('searchboxPatternHighlight', function() {
		return function(text, search, position) {
			text = text.toString();
			if (angular.isNumber(position)) {
				var tokens = text.split(',');
				if (position >= 0 && position < tokens.length) {
					tokens[position] = '<span class="ui-match">' + tokens[position] + '</span>';
					return tokens.join();
				}
			}
			return text;
		};
	});

})(window.XaNgFrameworkSearchBox);