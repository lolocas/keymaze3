(function () {
    'use strict';

    angular.module('XaCommon').service('SearchboxHelper', SearchboxHelper)

    function SearchboxHelper(SearchboxTo, UtilsHelper, searchBoxAction) {

        this.addButtonAction = addButtonAction;

        function addButtonAction(searchboxManager, img, resourceKey, isVisibleWhenSearch, isVisibleWhenValue, clickFn, visibilityFn) {
            if (visibilityFn && visibilityFn === false)
                return;

            var visMode=''
            if (isVisibleWhenSearch && !isVisibleWhenValue)
                visMode = 'whenSearch';
            else if (!isVisibleWhenSearch && isVisibleWhenValue)
                visMode = 'whenSelected';
            else
                visMode = 'both';


            searchboxManager.customActions.push(new searchBoxAction(img, visMode, resourceKey, clickFn));

        }

    }

})();
