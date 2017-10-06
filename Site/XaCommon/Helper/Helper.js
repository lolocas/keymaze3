(function () {
    'use strict';

    angular.module('XaCommon').service('HELPER', function (ConfConst, ApiHelper, UtilsHelper, ArrayHelper, CacheHelper, UserHelper, DialogHelper, FormHelper, FilterHelper, KeyboardHelper, GridHelper, PushHelper, UrlHelper, TdbHelper, ToastHelper, LocalHelper, SearchboxHelper) {

        this.Api = ApiHelper;

        this.Utils = UtilsHelper;

        this.Cache = CacheHelper;

        this.ConfConst = ConfConst;

        this.User = UserHelper;

        this.Dialog = DialogHelper;

        this.Form = FormHelper;

        this.Filter = FilterHelper;

        this.Array = ArrayHelper;

        this.Keyboard = KeyboardHelper;

        this.Grid = GridHelper;

        this.Push = PushHelper;

        this.Url = UrlHelper;

        this.Tdb = TdbHelper;

        this.Toast = ToastHelper;

        this.Local = LocalHelper;

        this.Searchbox = SearchboxHelper;
    });

})();

