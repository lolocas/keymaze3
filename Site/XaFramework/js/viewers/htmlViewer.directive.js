(function (local) {
    'use strict';

    local.directive('xaHtmlViewer', function ($filter) {
        
        return {
            restrict: 'EA',
            replace: true,
            template: '<div class="htmlViewer"></div>',
            scope: {
                content: '=content',
                url: '=url'
            },
            
            link: function (scope, element, attrs) {
                
                var createIFrame = function () {
                    var iframe = document.createElement('iframe');
                    iframe.frameBorder = "0";
                    iframe.setAttribute("frameBorder", "0");
                    //iframe.width = "100%";
                    //iframe.height = "380px";
                    iframe.className = "inheritFit";

                    return iframe;
                }


               var unwatchContent = scope.$watch('content', function (newVal, oldVal) {
                    if (!newVal && !oldVal) return;

                    element.empty();

                    if (newVal && newVal != "") {
                    	var iframe = createIFrame();

                    	iframe.onload = function () {
                    		//Injection Html
                    		var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    		iframeDoc.write(scope.content || '');
                    	};

                    	element.append(iframe);
                    }
                });

               var unwatchUrl =  scope.$watch('url', function (newVal, oldVal) {
                    if (!newVal && !oldVal) return;

                    if (!newVal) newVal = "about:blank";

                    element.empty();
                    var iframe = createIFrame();

                    iframe.setAttribute('src', scope.url);

                    element.append(iframe);
                });

                scope.$on('$destroy', function () {
                	unwatchContent();
                	unwatchUrl();

                	// Correctif sur ie page blanche si affichage en ng-if en sortie de patient ou autre
                	element.children().hide();
                	element.children().empty();

                	element.empty();
                    element = null;
                });
            }
        };

    });

})(window.XaNgFrameworkViewers);
