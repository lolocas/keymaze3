(function () {
    'use strict';

    angular.module('XaCommon')
        .factory('SearchboxTo', function () {
            function SearchboxTo(data) {
                if (data == null)
                    throw new Error('Un searchboxto ne peut être initialisé à partir d un objet vide.')
                this.id = data ? data.id : '' ;
                this.libelleDisplay = data ? data.libelleDisplay : '';
            
            };
            return SearchboxTo;
        });
})();

