(function () {
    'use strict';

    angular.module('XaCommon')
        .factory('ResultTo', function () {
            function ResultTo(data) {
                this.storageServerId = data ? data.storageServerId : null;
                this.exportDocument = data ? data.exportDocument : null;
                this.printDocuments = data ? data.printDocuments : [];
                this.validationErrors = data ? data.validationErrors : [];
                this.itemId = data ? data.itemId : [];
                this.itemDeleteId = data ? data.itemDeleteId : [];
                this.success = data ? data.success : false;
                this.confirmationMessages = data ? data.confirmationMessages : [];
                this.data = data ? data.data : null;
                this.dataDashboard = data ? data.dataDashboard : null;
            };


            ResultTo.prototype.hasConfirmationMessages = function () {
                if (this.confirmationMessages && this.confirmationMessages.length > 0)
                    return true;
                else
                    return false;
            };

            ResultTo.prototype.getConfirmationMessages = function () {
                if (this.confirmationMessages && this.confirmationMessages.length > 0)
                	return _.pluck(this.confirmationMessages, 'message').join('\r\n\r\n');
                else
                    return null;
            };

            ResultTo.prototype.hasErrorMessages = function () {
                if (this.validationErrors && this.validationErrors.length > 0)
                    return true;
                else
                    return false;
            };

            ResultTo.prototype.getErrorMessages = function () {
                if (this.validationErrors && this.validationErrors.length > 0)
                    return _.pluck(this.validationErrors, 'message').join('\r\n');
                else
                    return null;
            };

            return ResultTo;
        });

})();

