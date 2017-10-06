(function(local) {
	'use strict';

	local.factory('searchBoxAction', function (xaDirectiveHelper, xaTranslation) {

		var searchBoxAction = function (imageUrl, visibleTime, text, onClick, visibleOnEditStatus) {
			this.imageUrl = imageUrl;
			this.visibleTime = visibleTime; // Possible values: whenSelected, whenSearch, both, never
			this.testId = xaDirectiveHelper.getTestId('sba', text)
			this.text = xaTranslation.instant(text);
			this.onClick = onClick; // The onClick is called having the searchBox scope as context.
			this.img = imageUrl;
			this.visibleOnEditStatus = visibleOnEditStatus || 'whenEditAndReadonly'; // 'whenEditAndReadonly', 'whenEdit', whenReadOnly
		};

		searchBoxAction.prototype = {
	
			isVisible: function(entity, canedit) {
			    if (canedit == true && this.visibleOnEditStatus == 'whenReadonly')
					return false;

			    if (canedit === false && this.visibleOnEditStatus == 'whenEdit')
			        return false;

				switch (this.visibleTime) {
					case 'whenSelected':
						return true && entity;
					case 'whenSearch':
						return entity == null;
					case 'both':
						return true;
					default:
						return false;
				}
			}
		};

		return searchBoxAction;

	});

})(window.XaNgFrameworkSearchBox);