(function () {
    'use strict';

    angular.module('XaCommon')

        .factory('PrinterBusinessObject', function (UtilsHelper) {
            var PrinterBusinessObject = function (src) {
                UtilsHelper.extendPropFrom(this, src);
            };
            return PrinterBusinessObject;
        })

        .factory('DocumentPreferenceBusinessObject', function (UtilsHelper) {
            var DocumentPreferenceBusinessObject = function (src) {
                UtilsHelper.extendPropFrom(this, src);
                this.nombreCopie = this.nombreCopie ? this.nombreCopie : 1;
                };
                return DocumentPreferenceBusinessObject;
            })

       .factory('DocumentInfo', function (UtilsHelper) {
           var DocumentInfo = function (src) {
                   UtilsHelper.extendPropFrom(this, src);
                   /*
                   this.fileInByte data ? data.fileInByte : '';
                   this.extention = data ? data.extention : '';
                   this.preference = data ? data.preference : {};
                   this.useRichEditPrinter = data ? data.useRichEditPrinter : false
                   */
                  
                };
                return DocumentInfo;
            })

})();