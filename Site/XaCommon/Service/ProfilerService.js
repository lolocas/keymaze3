(function () {
	'use strict';


	angular.module('XaCommon')
	 .factory('ProfilerApiTo', function (UtilsHelper) {
	 	function ProfilerApiTo(src) {
	 		UtilsHelper.extendPropFrom(this, src);
	 	};
	 	return ProfilerApiTo;
	 });


	angular.module('XaCommon')
        .factory('ProfilerScreenTo', function (UtilsHelper) {
        	function ProfilerScreenTo(src) {
        		UtilsHelper.extendPropFrom(this, src);
        	};
        	return ProfilerScreenTo;
        });



	angular.module('XaCommon').service('ProfilerService', ProfilerService);

	function ProfilerService($rootScope, $state, UtilsHelper, ArrayHelper, ProfilerApiTo, ProfilerScreenTo) {
		this.isEnabled = false;
		this.screenList = [];
		this.apiCallList = [];
		this.counterScreen = 0;
		this.counterApi = 0;

		this.addScreen = addScreen;
		this.addApi = addApi;
		this.updateTdbParam = updateTdbParam;

		function updateTdbParam(lastTdbSelection, lastTdbPeriod, lastTdbFilters) {
			$rootScope.lastFormType = 'MainScreen';
			$rootScope.lastFormName = $state.current.name;


			$rootScope.lastFormStateInformations = {};
			$rootScope.lastFormStateInformations.tdbSelection = lastTdbSelection;
			$rootScope.lastFormStateInformations.tdbPeriod = lastTdbPeriod;


			var keys = UtilsHelper.objGetKeys(lastTdbFilters);
			var filterStr = '';
			ArrayHelper.forEach(keys, function (key) {
				if (UtilsHelper.isDate(lastTdbFilters[key])) {
					var d = new Date(lastTdbFilters[key]);
					var strYYYYMMDD = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
					filterStr += key + ":D:" +  strYYYYMMDD + ";";
				}
				else
					filterStr += key + ":S:" + lastTdbFilters[key] + ";";
			})

			$rootScope.lastFormStateInformations.tdbFilters = filterStr;
		}

		function addScreen(origine, type, formName, params) {
			// Suivi des navigation d'ecran
			if (type.toUpperCase() != 'DIALOG') {
				$rootScope.lastFormType = type;
				$rootScope.lastFormName = formName;

				// Reset to null parameter for tdb
				$rootScope.lastFormStateInformations = null;

				if (null != ArrayHelper.findFirstFromFunction(params, function (item) { return UtilsHelper.isObject(item) }))
					$rootScope.lastFormName = "APPEL URL NON VALIDE CAR LA FORM RECOIT UN OBJET";
				else
					$rootScope.lastFormArgument = params;
			}

			/* 	if (this.isEnabled != true)
					 return;
	 
				 params = params ? params : []
				 this.counterScreen++;
				 if (this.screenList.length > 25)
					 this.screenList.shift();
	 
				 this.screenList.push(new ProfilerScreenTo({id: this.counterScreen, origine: origine, view: formName, type: type, param1: params[0], param2: params[1], param3: params[2], param4: params[3], param5: params[4] }));
			 */
		}

		function addApi(type, controller, method, param) {
			/* if (this.isEnabled != true)
        		return;

        	this.counterApi++;
        	if (this.apiCallList.length > 25)
        		this.apiCallList.shift();

        	this.apiCallList.push(new ProfilerApiTo({ id: this.counterApi, type: type, controller: controller, method: method, param: param }));
			*/
		}


	};

})();