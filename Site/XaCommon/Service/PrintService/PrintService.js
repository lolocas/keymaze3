(function () {
    'use strict';

    angular.module('XaCommon').service('PrintService', PrintService);

    function PrintService(xaWindow, $q, $injector, ApiHelper, UrlHelper, UtilsHelper, ArrayHelper, DocumentPreferenceBusinessObject, PrinterBusinessObject, ResultTo, DocumentInfo, LocalHelper, DialogHelper) {

        this.printers = [];
        this.print = print;
        this.getConfigurationForPrintLocal = getConfigurationForPrintLocal;
        this.hasDocument = hasDocument;
        this.initialise = initialise;
        this.disconnect = disconnect;
        this.status = 'NOTSTARTED'; // NOTSTARTED, OK, STARTING

        function disconnect() {
            this.status = 'NOTSTARTED';
            this.printers = [];
        }

        function hasDocument(resultTo) {
            if (resultTo.printDocuments && resultTo.printDocuments.length > 0)
                return true;
            else
                return false;
        }

        var ctx = this;
        function initialise() {
            var def = $q.defer();

            if (ctx.status == 'OK') {
                def.resolve({ printers: ctx.printers });
            }
            else {
                this.status = 'STARTING';
                ApiHelper.callApiLocal('Printer', 'GetPrinterListWithOption', PrinterBusinessObject)
                .then(function (result) {
                    ctx.printers = result;
                    ctx.status = 'OK'
                    def.resolve({ printers: ctx.printers });
                });
            }


            return def.promise

        }


        function sendDocDirectlyToLocal(doc, pref) {

            var ext = doc.fileName.split(".").length > 1 ? (doc.fileName.split(".")[1].toLowerCase()) : "pdf";

            if (ext == 'rtf') {
                var obj = new DocumentInfo({ rtfDocument: doc.data, preference: pref, extention: ext, useRichEditPrinter: true });
                return ApiHelper.callApiLocal('Printer', 'PrintRtfDocument', obj).then(function () { return true; });
            }
            else if (ext == 'pdf') {
                var obj = new DocumentInfo({ fileInByte: doc.data, preference: pref, extention: ext, useRichEditPrinter: false });
                return ApiHelper.callApiLocal('Printer', 'PrintDocument', obj).then(function () { return true; });
            }
            else
                throw new Error("Format de document non  suppporté à l'impression.");



        }

        function sendDocToConfigForm(doc, pref, previewDocuments) {

            if (pref == null) {
                pref = new DocumentPreferenceBusinessObject();
                pref.typeDocument = doc.typeDocument;
            }

            var window = xaWindow.open({
                id: 'windowPrinterConfig',
                templateUrl: 'XaCommon/ViewInternal/Print/PrintLocal-View.html',
                controller: 'PrintLocalController as vm',
                width: '70%', height: '70%', windowMode: 'modal-gray',
                resolve: {
                    preference: function () { return pref; },
                    printers: function () { return ctx.printers; },
                    document: function () { return doc; },
                    showNeverDisplayOption: function () { return undefined; },
                    showMarginsOption: function () { return undefined; },
                    previewDocuments: function () { return previewDocuments; }
                }
            });

            return window.result;
        }

        function print(resultTo, printerPrefs) {

            var printPromiss = $q.defer();

            if (hasDocument(resultTo)) {
                if (LocalHelper.isLocalHostConnected() && ctx.status == 'OK')
                    initialise().then(function () { printWithLocal(resultTo, printPromiss, printerPrefs) });
                else
                    printWithBrowser(resultTo, printPromiss);
            }
            else {
                throw new Error("PrintHelper - No document to print !");
            }

            return printPromiss.promise;
        }

        function getConfigurationForPrintLocal(typeDocument, title) {

            if (!(LocalHelper.isLocalHostConnected() && ctx.status == 'OK')) {
                DialogHelper.showErrorMessage('TXT_ERREUR', 'TXT_HOSTLOCAL_NECESSAIRE');
                var def = $q.defer();
                def.reject(new ResultTo({ success: false }));
                return def.promise;
            }

            return ApiHelper.callApiLocal('Printer', 'GetDocumentPreference', typeDocument)
                  .then(function (pref) {
                      if (pref != null && pref.neverDisplaySelectionDialog == true) // Verif saut de paramétrage 
                      {
                          return new ResultTo({ success: true, data: pref });
                      }
                      else {
                          return sendDocToConfigForm({ title: title, typeDocument: typeDocument }, pref);
                      }
                  });


        }

        function printWithLocal(resultTo, printPromiss, printerPrefs) {

            // Initial promiss
            var def = $q.defer(); def.resolve(true);
            var previousPromiss = def.promise;
            var previousTypeDocument = '';

            //            for (var i = 0; i < resultTo.printDocuments.length; i++) {
            ArrayHelper.forEach(resultTo.printDocuments, function (doc, index) {

                if (UtilsHelper.isEmpty(doc.typeDocument))
                    throw new Error("Un objet à imprimer a été fourni sans typeDocument d'impression.");

                if (UtilsHelper.isUndefined(doc.data))
                    throw new Error("Un objet à imprimer a été fourni sans données à imprimer, le byte[] est vide.");
                previousPromiss = previousPromiss
                    // Récupération paramétrage
                    .then(function () {
                        if (!printerPrefs)
                            return ApiHelper.callApiLocal('Printer', 'GetDocumentPreference', doc.typeDocument)
                        else {
                            //TODO : test de renvoi de l'objet printerPrefs directement
                            printerPrefs.neverDisplaySelectionDialog = true; // Parametres d'impression passés a la fonction -> on force la suppression de la fenetre de parametrage
                            var def = $q.defer();
                            def.resolve(printerPrefs);
                            return def.promise;
                        }
                    })
                    // Affichage ou non de l'interface de paramétrage
                    .then(function (pref) {
                        if ((pref != null && previousTypeDocument == pref.typeDocument) // Verif nouveau type de document
                            || pref != null && pref.neverDisplaySelectionDialog == true) // Verif saut de paramétrage 
                        {
                            var def = $q.defer(); def.resolve(new ResultTo({ success: true, data: pref }));
                            return def.promise;
                        }
                        else {
                            var previewDocuments = ArrayHelper.findFromFunction(resultTo.printDocuments, function (printDocument) {
                                return ((!UtilsHelper.endsWith(printDocument.fileName, '.rtf')) && (printDocument.typeDocument == doc.typeDocument));
                            });
                            return sendDocToConfigForm(doc, pref, previewDocuments);
                        }
                    })

                    // Affichage ou non de l'interface de paramétrage
                    .then(function (resultTo) {
                        if (resultTo.success == true) {
                            previousTypeDocument = resultTo.data.typeDocument;
                            return sendDocDirectlyToLocal(doc, resultTo.data);
                        }
                        else {
                            var def = $q.defer();
                            printPromiss.reject("Annulation de l'utilisateur sur un écran");
                            def.reject(false);
                            return def.promise;
                        }
                    });

            });

            previousPromiss.then(function (result) {
                if (result == true) printPromiss.resolve(resultTo);
            })
        }


        function printWithBrowser(resultTo, printPromiss) {
            if (hasDocument(resultTo) && resultTo.printDocuments.length == 1 && UtilsHelper.endsWith(resultTo.printDocuments[0].fileName.toLowerCase(), '.pdf') && UtilsHelper.browserCanViewPdf()) {
                var formHelper = $injector.get("FormHelper");
                formHelper.openWindow('ViewerPdf', UrlHelper.getUrlApiApplication('Download', 'RunPrint', resultTo.storageServerId), UtilsHelper.getLabel('TXT_IMPRESSION'), 'XaCommon/Img/printer.png');
            }
            else if (hasDocument(resultTo) && resultTo.printDocuments.length == 1) {
                ApiHelper.openHtmlLinkApplication('Download', 'RunPrint', resultTo.storageServerId, true);
                printPromiss.resolve(resultTo);

            }
            else if (hasDocument(resultTo) && resultTo.printDocuments.length > 1) {
                throw new Error("PrintHelper - Cannot print in browser mode more than one document !");
                printPromiss.reject('No document to print');
            }
            else {
                throw new Error("PrintHelper - No document to print !");
                printPromiss.reject('No document to print');
            }

        };

    };
})();