declare module CommonInterface {
    export interface HELPER {
        Api: {
            callApiApplication: (controller?, method?, param?, expectedType?, opts?) => any
            callApiLocal: (controller?, method?, param?, expectedType?, opts?) => any
            openHtmlLinkApplication: (controller?, method?, id?, newPage?) => any
            openHtmlLinkFromUrl: (url?, target?) => any
        }
        Utils: {
            convertToType: (src?, classType?) => any
            convertArrayToType: (src?, classType?) => any
            convertSubArrayToType: (src?, classType?) => any
            convertTdbArrayToType: (src?, classType?) => any
            convertObjectOrArrayToType: (result?, expectedType?) => any
            extendPropFrom: (src?, from?) => any
            removeEmptyProperties: (value?) => any
            clearProperties: (obj?, properties?) => any
            objGetKeys: (obj?) => any
            jsonToObject: (jsonString?) => any
            objectToJson: (object?) => any
            cloneObject: (object?) => any
            getItem: (p_strString?, p_intIndex?, p_strSeparator?, p_blnThrowErrors?) => any
            getItemToBool: (p_strString?, p_intIndex?, p_strSeparator?, p_blnThrowErrors?) => boolean
            dateDayString: (date?) => any
            dateTodayIsInPeriod: (debut?, fin?, dateToCompare?) => any
            dateToday: () => any
            dateEmpty: () => any
            dateMax: (stringValue?) => any
            dateEqual: (a?, b?) => any
            dateIsInferieur: (a?, b?, includeEqual?) => any
            dateIsSuperieur: (a?, b?, includeEqual?) => any
            dateIsEmpty: (date?) => any
            isDate: (date?) => any
            daysBetween: (startDate?, endDate?, withHours?) => any
            monthsBetween: (startDate?, endDate?) => any
            dateAddDays: (date?, days?) => any
            getAge: (p_objDateNaissance?, p_objDateReference?) => any
            dateAddMinutes: (date?, minutes?) => any
            dateAddHours: (date?, hours?) => any
            dateSetTime: (date?, time?) => any
            dateDiff: (date1?, date2?) => any
            isUndefined: (value?) => any
            isFunction: (obj?) => any
            hasProperties: (obj?) => any
            isArray: (obj?) => any
            isObject: (obj?) => any
            isString: (value?) => any
            isDarkColor: (couleurHexa?) => any
            timeAddHours: (time?, hours?) => any
            timeAddMinutes: (time?, minutes?) => any
            timeAddDurations: (duration1?, duration2?) => any
            timeSubstractDurations: (duration1?, duration2?) => any
            isEmpty: (value?) => any
            isInValues: (value?, array?) => any
            isEmptyOrWhitespace: (value?) => any
            endsWith: (chaine?, suffix?) => any
            addLeadingZero: (num?, size?) => any
            startWith: (chaine?, prefix?) => any
            containString: (chaine?, str?) => any
            replaceAll: (string?, find?, replace?, ignoreCase?) => any
            replaceAt: (string?, index?, character?) => any
            cleanUpSpecialChars: (str?) => any
            getValueOrDefault: (value?, defaultValue?) => any
            getLabel: (code?) => any
            getLabelIfStartWithTxt: (text?) => any
            getLabelFormat: (code?, val1?, val2?, val3?, val4?) => any
            getGuid: () => any
            runPromiseMultiple: (func?, listParameters?) => any
            emptyPromise: (value?, isReject?) => any
            setLoadingMessage: (label?) => any
            getIntervalStringFromNow: (val?) => any
            browserCanViewPdf: () => any
            browserSupportsDataUri: () => any
            PreventMultiExecution: (fn?) => any
            setPageTitle: (title?) => any
            delayExecutionFn: (delayInMs?, fn?) => any
            paramToString: (param?) => any
            textToHtml: (text?) => any
            isTouchDevice: () => any
            throwClientBusinessException: (message?) => any
            getValueFromStringProperty: (value?, key?) => any
            setValueFromStringProperty: (value?, key?, newValue?) => any
            forceRefreshView: () => any
            appendValueAtCursorPosition: (idControl?, textToAppend?) => any
            openFileBrowserAndApplyFn: (fn?, allowExtensions?, isMultiple?) => any
            toTSInterface: (objInstance?, recCall?, argOptional?) => any
            _weekDay: string[];
        }
        Cache: {
            getDataFromCommonServerOrMemory: (controllerName?, apiName?, liste?, callback?) => any
            getDataFromApplicationServerOrMemory: (controller?, apiName?, liste?, callback?) => any
        }
        ConfConst: {
            PRODUCT_TITLE: string;
            DEFAULT_VIEW: string;
            LOGIN_STATE: string;
            LOGIN_URL: string;
            PARAMETRAGE_MENU_OPTIONS: any[];
        }
        User: {
            isAuthenticated: () => any
            setPreference: (rubrique?, cle?, valeur?) => any
            logout: (redirectToLogin?, showTimeOutMessage?) => any
            getUser: () => any
            getCurrentSite: () => any
            getPreference: (rubrique?, cle?, defaultValue?) => any
            getAppParameter: (key?, defaultValue?) => any
            hasRight: (rightCode?) => any
            getAllowMenuOptions: (menuOptions?) => any
            getDefaultMenuOption: (defaultOptionCode?, menuOptions?) => any
            getInitialState: () => any
        }
        Dialog: {
            showErrorMessage: (title?, message?, opt?) => any
            showInfoMessage: (title?, message?, opt?) => any
            showConfirmMessage: (title?, message?, okFunction?, cancelFunction?, opt?) => any
            showConfirmMessagePromise: (title?, message?, opt?) => any
        }
        Form: {
            setModalParam: (value?) => any
            closeAllWindows: () => any
            showErrorDialogFromResultTo: (resultTo?) => any
            openMainScreenWithOpts: (stateName?, opts?, param1?, param2?) => any
            openMainScreen: (stateName?, param1?, param2?) => any
            openWindow: (formName?, ...extraParams: any[]) => any
            openTooltip: (formName?, cssPosName?, ...extraParams:any[]) => any
            openWindowWithOpts: (formName?, overloadParam?) => any
            openWindowFromTdb: (tdbManager?, formName?) => any
            closeFormWithSuccess: (vm?, data?) => any
            closeFormWithCancel: (vm?) => any
            closeFormWithResult: (vm?, result?) => any
            closeTooltip: (vm?) => any
            addCustomActionOnVignette: (vigParam?, id?, clickFn?, visibilityFn?, img?) => any
            resetValueIfNotInDataSource: (parentValue?, model?, propertyName?, datatSource?, dataSourceCode?) => any
            getCopySearchboxValue: (value?) => any
            getExternalCallUrl: (login?, pwd?, formType?, formName?, formArgument?) => any
            controlParam: (formParameter?, parameterName?, value?) => any
            controlParamInList: (formParameter?, parameterName?, value?, possibleValues?) => any
            controlParamMandatory: (formParameter?, parameterName?, value?) => any
            initializeWindowOptions: (vm?, dataSourceOptions?, rubriquePreference?, visibilityFn?) => any
            getCurrentWindowOptions: (vm?) => any
            addButtonInWindowHeader: (vm?, img?, title?, applyFn?, visibilityFn?, rightKey?) => any
            doTdbPrint: (tdbManager?, controllerName?, methodName?, data?, printAfterMethodName?, printAfterParameter?, extraOpts?) => any
            doTdbActionWithSimpleConfirmation: (tdbManager?, controllerName?, methodName?, data?, initialConfirmMessage?, extraOpts?) => any
            doTdbActionWithAdvancedConfirmation: (tdbManager?, controllerName?, methodValidateName?, methodSaveName?, data?, extraOpts?) => any
            doTdbAction: (tdbManager?, controllerName?, methodName?, data?, extraOpts?) => any
            doWinPrint: (vm?, controllerName?, methodName?, data?, printAfterMethodName?, printAfterParameter?, closeForm?, extraOpts?) => any
            doWinActionWithSimpleConfirmation: (vm?, controllerName?, methodName?, data?, initialConfirmMessage?, closeForm?, extraOpts?) => any
            doWinActionWithAdvancedConfirmation: (vm?, controllerName?, methodValidateName?, methodSaveName?, data?, closeForm?, extraOpts?) => any
            doWinAction: (vm?, controllerName?, methodName?, data?, closeForm?, extraOpts?) => any
            isLoadingVisible: () => any
            isWindowOnScreen: () => any
            onViewLoaded: (func?) => any
            addClientValidationError(vm?, message?, controlID?);
        }
        Filter: {
            toDateString: (dt?, rowValues?) => any
            toMontantString: (val?, rowValues?) => any
            toDateTimeString: (dt?, rowValues?) => any
            toLibelleString: (val?, cle?, rowValues?) => any
            toNombreString: (val?, cle?, rowValues?) => any
            toNombreEntierString: (val?, cle?, rowValues?) => any
            toTelephoneString: (val?, cle?, rowValues?) => any
            toAgeString: (p_objDateNaissance?, p_objDateReference?) => any
            toHourString: (dt?, rowValues?) => any
        }
        Print: {
            print: (resultTo?) => any
            callApiApplicationAndPrint: (controller?, classname?, param?, printerPrefs?, optsApi?) => any
            callApiApplicationAndExport: (controller?, classname?, param?, viewInBrowser?) => any
            callApiApplicationAndPrintOneByOne: (controller?, classname?, param?, printAfterMethodName?, typeDoc?, titleParam?) => any
            runExportFromResultTo: (resultTo?, viewInBrowser?) => any
        }
        ApplicationStatus: {
            getProductVersion: () => any
            getLocalHostStatus: () => any
            getClientIp: () => any
        }
        Array: {
            isEmpty: (array?) => any
            clear: (array?) => any
            isArray: (param?) => any
            removeItem: (array?, item?) => any
            removeItems: (array?, itemsToRemove?) => any
            removeItemFromProperty: (array?, property?, value?) => any
            removeItemsFromProperty: (array?, items?, property?) => any
            removeDuplicateFromProperty: (array?, property?) => any
            removeItemsFromFunction: (array?, func?) => any
            generateIds: (array?) => any
            findItem: (array?, value?, prop?) => any
            replaceItemWithSameKey: (array?, newItem?, propKey?) => any
            updateItemWithSameKey: (array?, newItem?, propKey?) => any
            findFirstFromProperty: (array?, property?, value?) => any
            findFirstFromFunction: (array?, func?, ctx?) => any
            findFromProperty: (array?, property?, value?) => any
            findFromFunction: (array?, func?, ctx?) => any
            forEach: (array?, func?, ctx?) => any
            contains: (array?, value?) => any
            groupBy: (array?, iteratee?) => any
            splitSubArrayWithLimit: (array?, limit?) => any
            sortByProperty: (array?, property?) => any
            joinArrays: (array1?, array2?) => any
            getStringFromProperty: (array?, propertyName?, separator?) => any
            mapFunction: (array?, func?, ctx?) => any
            mapProperty: (array?, propertyName?) => any
            sumProperty: (array?, property?) => any
            distinctProperty: (array?, property?) => any
            distinctByFromProperty: (array?, property?) => any
            addItemsIfNotExist: (array?, arrayNew?, propKey?, replaceItemIfExist?) => any
            addItemIfNotExist: (array?, item?, propKey?) => any
            moveItemToFirstPosition: (array?, item?) => any
            moveIdToFirstPosition: (array?, property?, value?) => any
        }
        Keyboard: {
            addShortcut: (keyString?, ctx?, func?) => any
            removeShortcut: (keyString?, ctx?) => any
            setContext: (ctxString?) => any
            resetContext: (ctxString?) => any
        }
        Grid: {
            setStyleRowFromFunction: (grid?, func?) => any
            setStyleCellFromFunction: (grid?, func?) => any
            setCellEditorWillChangeFunction: (grid?, func?) => any
            setCellEditorDidChangeFunction: (grid?, func?) => any
            setCellEditorBeforeEditFunction: (grid?, func?) => any
            setCellEditorWithSuggestion: (grid?, columnName?, datasourceFn?) => any
            setCellEditorWithCombogrid: (grid?, columnName?, valueCol?, displayCol?, datasourceFn?, opts?) => any
            setGridLayoutStorage: (gridOptions?, getPreferenceFn?, savePreferenceFn?) => any
            addButtonActionInColumn: (grid?, columnName?, image?, resourceKey?, clickFn?, visibilityFn?) => any
            addButtonActionInHeader: (grid?, image?, tooltip?, func?, visibilityFn?) => any
            addFilterActionInColumn: (grid?, columnName?, cellFilter?, clickFn?) => any
            addTextClickActionInColumn: (grid?, columnName?, clickFn?) => any
            addFixedTextClickActionInColumn: (grid?, columnName?, resourceKey?, clickFn?) => any
            setColumnAction: (grid?, columnName?, func?) => any
            setTitle: (grid?, titleFunc?) => any
            setDescription: (grid?, descFunc?) => any
            setFooter: (grid?, footerFunc?) => any
            setRowSelectedAction: (grid?, func?) => any
            setDblClickAction: (grid?, func?) => any
            setDragRowAction: (grid?, dropTargetArray?, funcLabel?, funcDrop?) => any
            setCellClickAction: (grid?, func?) => any
            setCellDblClickAction: (grid?, func?) => any
            setSelectedItemsFromKeys: (gridOptions?, keys?) => any
            setSelectedItemFromKey: (gridOptions?, key?) => any
            setSelectedFirstItem: (gridOptions?, ignoreFocus?) => any
            setSelectedItems: (gridOptions?, itemsInTdb?) => any
            setSelectedItem: (gridOptions?, itemInTdb?, ignoreFocus?) => any
            getSelectedItems: (gridOptions?, keepGroups?) => any
            getSelectedItem: (gridOptions?, keepGroups?) => any
            goToCellAndFocus: (grid?, row?, columnName?) => any
            refreshGridDisplay: (gridOptions?, forceResizeCanvas?) => any
            refreshRowDisplay: (gridOptions?, itemInTdb?) => any
            refreshGridWithColumns: (gridOptions?, columns?) => any
            refreshGridExistingColumns: (gridOptions?, columns?) => any
            setDragRowActionOnPlanning: (grid?, funcLabel?) => any
            setDragFromDesktopAction: (grid?, func?, allowExtensions?, isMultiple?) => any
        }
        Push: {
            addFunctionOnLocalPush: (pushName?, fn?) => any
            removeFunctionOnLocalPush: (pushName?, fn?) => any
            addFunctionOnServerPush: (pushName?, fn?) => any
            removeFunctionOnServerPush: (pushName?, fn?) => any
            isConnectedLocalPush: () => any
            isConnectedServerPush: () => any
        }
        Searchbox: {
            addButtonAction: (searchboxManager?, img?, resourceKey?, isVisibleWhenSearch?, isVisibleWhenValue?, clickFn?, visibilityFn?) => any
        }
        Url: {
            getUrlApi: (prefix?, controller?, classname?, param?, excludeSessionId?) => any
            getUrlApiApplication: (controller?, classname?, param?) => any
            getUrlApiLocal: (localPort?, controller?, classname?, param?) => any
            getUrlApiApplicationWithoutSession: (controller?, classname?, param?) => any
            getUrlApiLocalWithoutSession: (localPort?, controller?, classname?, param?) => any
            getUrlParameter: (name?) => any
            _initUrl: string
            sessionId: string
        }
        Tdb: {
            tdbLoadData: (tdbManager?) => any
            tdbLoadDataWithValues: (tdbManager?, selectionCode?, periodType?, clearFilters?) => any
            hasFiltersActive: (tdbManager?) => any
            getCurrentTdbItemKey: (tdbManager?) => any
            getCurrentTdbItem: (tdbManager?) => any
            getCurrentTdbItems: (tdbManager?) => any
            applyTdbItemReloadAndFocus: (tdbManager?) => any
            applyCurrentTdbItemReloadAndFocus: (tdbManager?) => any
            setOnTdbDataLoadedFn: (tdbManager?, fn?) => any
            setOnTdbItemRefreshedOrChangedFn: (tdbManager?, fn?) => any
            setOnBeforeTdbLoadDataFn: (tdbManager?, fn?) => any
            addAction: (tdbManager?, code?, resourcName?, actionFn?, visibilityFn?, rightKey?) => any
            addSelection: (tdbManager?, code?, resourceName?, rightKey?) => any
            addPrint: (tdbManager?, code?, text?, printFn?, visibilityFn?, rightKey?) => any
            addActionInHeader: (tdbManager?, img?, tooltip?, applyFn?, visibilityFn?, rightKey?) => any
            setAddAction: (tdbManager?, actionFn?) => any
            setDefaultActionFn: (tdbManager?, actionFn?) => any
            getCurrentPeriodType: (tdbManager?) => any
            getCurrentSelectionStatusCode: (tdbManager?) => any
            getCurrentFilters: (tdbManager?) => any
            hasCurrentFilters: (tdbManager?) => any
            openFilterWindow: (tdbManager?) => any
        }
        Toast: {
            showToastInfo: (title?, body?, clickFn?, timeout?) => any
            showToastError: (title?, body?, clickFn?, timeout?) => any
            showToastWarning: (title?, body?, clickFn?, timeout?) => any
        }
        Local: {
            isLocalHostConnected: () => any
            getLocalConfiguration: () => any
        }
    }
}