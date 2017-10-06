(function (local) {
    'use strict';
    local.service('xaLoadingService', function () {
        

        return {
            show: function () {
                //console.warn("no loading in the page!!!");
            },
            showWithCancel: function () {
            	//console.warn("no loading in the page!!!");
            },
            hide: function () {
                //console.warn("no loading in the page!!!");
            },
        	isVisible: function () {
        		//console.warn("no loading in the page!!!");
        	},
        	changeTitleAndSubTitle: function () {
        		//console.warn("no loading in the page!!!");
        	}
        }
    });
    local.directive('xaLoading', function ($rootScope, xaLoadingService) {

        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../js/loading/loading.tpl.html',
            scope: {
				loadingCustomMessage: '='
            },
            link: function (scope, element) {
             
                scope.loadingCancel = false;


            	/* Exposition extérieure */
                xaLoadingService.show = showLoading;
                xaLoadingService.hide = hideLoading;
                xaLoadingService.isVisible = isVisible;
                xaLoadingService.changeTitleAndSubTitle = changeTitleAndSubTitle;
				
				/*  Internal counter*/
                var pendingLoadingCount = 0;
                
                function showLoading(showWithCancel) {
                	if (showWithCancel)
                		scope.loadingCancel = true;

                	
                	if (pendingLoadingCount >= 0)
                		pendingLoadingCount++;
                	else
                		console.log("Inconsistent state for loading panel");

				 	if (pendingLoadingCount == 1) {
						element.show(0);
				 		attachKeyPress();
				 	}
                }


                function hideLoading() {
                	if (pendingLoadingCount > 0)
                		pendingLoadingCount--;
                	else
                		console.log("Inconsistent state for loading panel");


                	if (pendingLoadingCount == 0) {
                		element.hide(0);
                		scope.loadingCancel = false;
                		detachKeyPress();
                	}
                }

                function isVisible() {
                	return pendingLoadingCount > 0;
                }

                function changeTitleAndSubTitle(title, subtitle) {
                	$('.title',element).text(title);
                	$('.subtitlefixed', element).text(subtitle);
				}

				/* Gestion du click */
                scope.cancelClick = function () {
                	if ($rootScope.cancelServerCall)
                		$rootScope.cancelServerCall();
                }

            	/* Gestion du clavier pour desactiver toute saisie pendant le loading. */
                function interceptAnyKeyboardEventAndCancelIt(evt) {
                	if (evt.target.id != "loadingCancelButton") {
                        evt.stopPropagation();
                        evt.preventDefault();
                    }
                }
                function attachKeyPress() {
                	$(document)[0].addEventListener('keydown', interceptAnyKeyboardEventAndCancelIt, true);
                	$(document)[0].addEventListener('click', interceptAnyKeyboardEventAndCancelIt, true);
                	$(document)[0].addEventListener('dblclick', interceptAnyKeyboardEventAndCancelIt, true);
                }
                function detachKeyPress() {
                	$(document)[0].removeEventListener('keydown', interceptAnyKeyboardEventAndCancelIt, true);
                	$(document)[0].removeEventListener('click', interceptAnyKeyboardEventAndCancelIt, true);
                	$(document)[0].removeEventListener('dblclick', interceptAnyKeyboardEventAndCancelIt, true);
                }

				/* Dispose */
                scope.$on('$destroy', function () {
                    destroyShowEvt();
                    destroyHideEvt();
                    unwatchShow();

                    detachKeyPress();
                });
            }
        };
    });

    local
      .config(function ($httpProvider) {
          $httpProvider.interceptors.push('loadingInterceptor');
      })
      .factory('loadingInterceptor', function ($q, $rootScope, xaLoadingService) {
          return {
              'request': function (config) {
                  if (!config.headers['x-noloading']) { //do not show loading for template requests!
                  	xaLoadingService.show(config.headers['x-cancellable']);
                  }
                  return config || $q.when(config);
              },
              'response': function (response) {
                  if (!response.config.headers['x-noloading']) {
                  	xaLoadingService.hide();
                  }
                  return response || $q.when(response);
              },
              'responseError': function (rejection) {
                  if (rejection.config && rejection.config.headers && rejection.config.headers['x-noloading']) {
                  }
                  else
                  {
                  	xaLoadingService.hide();
                  } 
                  return $q.reject(rejection);
              }
          }
  });

})(window.XaNgFrameworkLoading);
