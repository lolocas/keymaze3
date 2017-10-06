//based on https://github.com/leon/angular-upload

(function (local) {
    'use strict';

 
    local.directive('xaUploadButton', function (upload, dialogs, $rootScope, xaTranslation, xaFrameworkSetting) {
        
        var fileTooBigHeader = xaTranslation.instant('TXT_ERREUR');
        var fileTooBigBody = xaTranslation.instant('ERR_AJOUT_PIECE_JOINTE');

        var fileExtensionNotAllowedHeader = xaTranslation.instant('TXT_ERREUR');
        var fileExtensionNotAllowedBody = xaTranslation.instant('TXT_EXTENSION_NOT_ALLOWED');

      return {
          restrict: 'EA',
          replace:true, 
          scope: {
              uploadOptions: '='
          },
          templateUrl: '../js/upload/upload.tpl.html',
          link: function (scope, element, attr) {

              //var opts = {
              //    handlers: {
              //        onUpload: '&?',
                          //onSuccess: '&?',
                          //onError: '&?',
                          //onComplete: '&?',
                          //onFileTooBig: '&?',
              //    },
              //    data: '=?data',
              //    url: '@',
              //    param: '@',
              //    method: '@',
              //    maxSize: '@',
                  
              //    allowExtensions: '@',
              //    isMultiple: '=?', // true par défaut
              //    dropZoneHeight: '@',    
              //}
              
              scope.uploadOptions = scope.uploadOptions || {};
              scope.uploadOptions.handlers = scope.uploadOptions.handlers || {};

              scope.uploadOptions.handlers.openFileBrowser = function (allowExtensions, isMultiple) {
              	if (allowExtensions && scope.uploadOptions.allowExtensions != allowExtensions)
					refreshAcceptAndMultiple();

              	if (isMultiple && scope.uploadOptions.isMultiple != isMultiple)
              		refreshAcceptAndMultiple();

              	fileInput.click();
              }
              scope.uploadOptions.handlers.uploadFiles = function (fileArr) {
              	  uploadFiles(fileArr);
              };


            //var el = angular.element(element);
            var fileInput = element.find('input');
            //fileInput.appendTo(el);
            
            refreshAcceptAndMultiple();

            function refreshAcceptAndMultiple() {
                if (scope.uploadOptions.isMultiple == false)
                    fileInput.removeAttr('multiple');
                else
                    fileInput.attr('multiple');

                if (scope.uploadOptions.allowExtensions)
                    fileInput.attr('accept', scope.uploadOptions.allowExtensions);
                else
                    fileInput.removeAttr('accept');
            }

            function resetValue() {
                try {
                    fileInput[0].value = '';
                    if (fileInput[0].value) {
                        fileInput[0].type = "text";
                        fileInput[0].type = "file";
                    }
                } catch (e) { }
            }

              fileInput.on('change', function uploadButtonFileInputChange() {
                  if (fileInput[0].files && fileInput[0].files.length === 0) {
                      return;
                  }

                  uploadFiles(fileInput[0].files);
              });

              if ('required' in attr) {
                  attr.$observe('required', function uploadButtonRequiredObserve(value) {
                      var required = value === '' ? true : scope.$eval(value);
                      fileInput.attr('required', required);
                      element.toggleClass('ng-valid', !required);
                      element.toggleClass('ng-invalid ng-invalid-required', required);
                  });
              }
              if ('accept' in attr) {
                  attr.$observe('accept', function uploadButtonAcceptObserve(value) {
                      fileInput.attr('accept', value);
                  });
              }
              if (upload.support.formData) {
                  var uploadButtonMultipleObserve = function () {
                      fileInput.attr('multiple', !!(scope.$eval(attr.multiple) && !scope.$eval(attr.forceIframeUpload)));
                  };
                  attr.$observe('multiple', uploadButtonMultipleObserve);
                  attr.$observe('forceIframeUpload', uploadButtonMultipleObserve);
              }

              function uploadFiles(fileArr) {
                  if (!fileArr || fileArr.length === 0) return;

                  var firstFile = fileArr[0]; //todo: do we need mutiple file support?!?!

                  if (scope.uploadOptions.allowExtensions) {
                      var errList = [];
                      _.each(fileArr, function (file) {
                          var extName = file.name.split('.').pop();
                          if (scope.uploadOptions.allowExtensions.indexOf(extName) == -1) {
                              errList.push(fileExtensionNotAllowedBody.replace('{0}', extName));
                          }
                      });

                      if (errList.length > 0) {
                          dialogs.error(fileExtensionNotAllowedHeader, errList.join('\n'));

                          resetValue();
                          return;
                      }
                      
                  }

                  var tailleMaxInMeg = scope.uploadOptions.maxSize || xaFrameworkSetting.AttachedFileMaxSize;
                  if (tailleMaxInMeg) { //can validate file size
                      var size = tailleMaxInMeg * 1024 * 1024;

                      var filesTooBig = [];
                      _.each(fileArr, function (file) {
                          if (size < file.size) {
                              filesTooBig.push(file);

                              if (angular.isFunction(scope.uploadOptions.handlers.onFileTooBig))
                                  scope.uploadOptions.handlers.onFileTooBig(file.size, scope.uploadOptions.maxSize, file.name);
                              else { //handler not defined, just alert the message
                                  dialogs.error(fileTooBigHeader, fileTooBigBody.replace('{0}', tailleMaxInMeg));
                              }
                          }
                      });

                      if (filesTooBig.length) {
                         
                          resetValue();
                          return;
                      }
                  }

                  var options = {
                      url: scope.uploadOptions.url ? scope.uploadOptions.url : xaFrameworkSetting.UploadUrl,
                      method: scope.uploadOptions.method || 'POST',
                      forceIFrameUpload: scope.$eval(attr.forceIframeUpload) || false,
                      data: scope.uploadOptions.data || {}
                  };
                  options.data[scope.uploadOptions.param || 'file'] = fileArr;
                  
                  scope.uploadOptions.handlers.onUpload && scope.uploadOptions.handlers.onUpload(fileArr);
                  if(!$rootScope.$$phase) scope.$apply();
                  
                  upload(options).then(function (response) {
                      scope.uploadOptions.handlers.onSuccess && scope.uploadOptions.handlers.onSuccess(response);
                  }, function (response) {
                      scope.uploadOptions.handlers.onError && scope.uploadOptions.handlers.onError(response);
                  }).finally(function () {
                      scope.uploadOptions.handlers.onComplete && scope.uploadOptions.handlers.onComplete(response);
                      resetValue();
                  });
              }

              var ns = '.fileUpload-' + scope.$id;
              var dropElem = element.find('.dropToUpload');
              var dragOptionsObj = {
                  windowDragOver: function (e) {
                      e = e || event;
                      if (!$(e.target).hasClass('dropToUpload')) {
                          e.preventDefault();
                          //element.removeClass('fileDragOver');
                      }
                      
                  },
                  windowDrop: function windowDrop(e) {
                      e = e || event;
                      e.preventDefault();
                      element.removeClass('fileDragOver');
                  },
                  elementDrop: function (e) { //need to use native event listener, because of jquery.drag overload needed for slickgrid
                      if (e.dataTransfer) {
                          if (e.dataTransfer.files.length) {
                              e.preventDefault();
                              e.stopPropagation();

                              uploadFiles(e.dataTransfer.files);
                          }
                      }
                      e.preventDefault();
                      e.stopPropagation();

                      dropElem.removeClass('fileCanDrop');
                      element.removeClass('fileDragOver');
                  }
              };


              function registerDragDropSection() {

                  var dragTimer;
                  var dragTimer2;


                  $(document).on('dragover' + ns, function (e) {
                      var dt = e.originalEvent.dataTransfer;

                      var hasFiles = dt.types != null && ((dt.types.length && dt.types[0] === 'Files') || dt.types.contains('application/x-moz-file'));

                      if (hasFiles) {
                          element.addClass('fileDragOver');
                          window.clearTimeout(dragTimer);
                      }
                  });
                  $(document).on('dragleave' + ns, function (e) {
                      window.clearTimeout(dragTimer);
                      dragTimer = window.setTimeout(function () {
                          element.removeClass('fileDragOver');
                      }, 25);
                  });
                  $(document).on('dragenter' + ns, function (e) {
                      e.stopPropagation();
                      e.preventDefault();
                  });
                  //prevent file drop outside file upload
                  window.addEventListener('dragover', dragOptionsObj.windowDragOver, false);
                  window.addEventListener('drop', dragOptionsObj.windowDrop, false);

                  dropElem.on('dragenter', function (e) {
                      e.stopPropagation();
                      e.preventDefault();

                      dropElem.addClass('fileCanDrop');
                      window.clearTimeout(dragTimer);
                  });
                  dropElem.on('dragover', function (e) {
                      e.stopPropagation();
                      e.preventDefault();

                      dropElem.addClass('fileCanDrop');

                      window.clearTimeout(dragTimer);
                  });
                  dropElem.on('dragleave', function (e) {
                      window.clearTimeout(dragTimer2);
                      dragTimer2 = window.setTimeout(function () {
                          dropElem.removeClass('fileCanDrop');
                      }, 25);
                  });
                  dropElem[0].addEventListener('drop', dragOptionsObj.elementDrop, false);
              }

              function unregisterDragDropSection() {
                  dropElem.off('dragenter dragover drop dragleave');

                  dropElem[0].removeEventListener('drop', dragOptionsObj.elementDrop, false);

                  window.removeEventListener('dragover', dragOptionsObj.windowDragOver, false);
                  window.removeEventListener('drop', dragOptionsObj.windowDrop, false);

                  $(document).off('dragover' + ns + ' dragleave' + ns + ' drop' + ns + ' dragenter' + ns);

                  //dragOptionsObj = {};
              }

              if (scope.uploadOptions.dropZoneHeight) {
                  if (scope.uploadOptions.dropZoneHeight == 'auto') { // managed externally 
                  }
                  else {
                      if (scope.uploadOptions.dropZoneHeight.toString().indexOf('px') == -1)
                          scope.uploadOptions.dropZoneHeight += 'px';
                      element.find('.dropToUpload').show()
                          .height(scope.uploadOptions.dropZoneHeight)
                          .css('line-height', scope.uploadOptions.dropZoneHeight);
                  }
                  registerDragDropSection();
              }


              scope.$on('$destroy', function () {
                  //unregisterDragDropSection();
                  if (scope.uploadOptions.dropZoneHeight) unregisterDragDropSection();
                  
                
              });
          }
      };
  }
);

    local.factory('formDataTransform', function () {
        return function formDataTransform(data) {
            var formData = new FormData();
            angular.forEach(data, function (value, key) {
                var files = [];
                if (angular.isElement(value)) {
                    
                    angular.forEach(value, function (el) {
                        angular.forEach(el.files, function (file) {
                            files.push(file);
                        });
                    });
                } else {
                    if (value.length) { //value is array
                        files = value;
                    }
                    else
                        files = [ value ];//formData.append(key, value);
                }

                if (files.length !== 0) {
                    if (files.length > 1) {
                        angular.forEach(files, function (file, index) {
                            formData.append(key + '[' + index + ']', file);
                        });
                    } else {
                        formData.append(key, files[0]);
                    }
                } 
            });
            return formData;
        };
    }).factory('formDataUpload', [
  '$http',
  'formDataTransform',
  function ($http, formDataTransform) {
      return function formDataUpload(config) {
          config.transformRequest = formDataTransform;
          config.headers = angular.extend(config.headers || {}, { 'Content-Type': undefined });
          return $http(config);
      };
  }
    ]);

    local.factory('iFrameUpload', [
  '$q',
  '$http',
  '$document',
  '$rootScope',
  function ($q, $http, $document, $rootScope) {
      function indexOf(array, obj) {
          if (array.indexOf) {
              return array.indexOf(obj);
          }
          for (var i = 0; i < array.length; i++) {
              if (obj === array[i]) {
                  return i;
              }
          }
          return -1;
      }
      function iFrameUpload(config) {
          var files = [];
          var deferred = $q.defer(), promise = deferred.promise;
          angular.forEach(config.data || {}, function (value, key) {
              if (angular.isElement(value)) {
                  delete config.data[key];
                  value.attr('name', key);
                  files.push(value);
              }
          });
          var addParamChar = /\?/.test(config.url) ? '&' : '?';
          if (config.method === 'DELETE') {
              config.url = config.url + addParamChar + '_method=DELETE';
              config.method = 'POST';
          } else if (config.method === 'PUT') {
              config.url = config.url + addParamChar + '_method=PUT';
              config.method = 'POST';
          } else if (config.method === 'PATCH') {
              config.url = config.url + addParamChar + '_method=PATCH';
              config.method = 'POST';
          }
          var body = angular.element($document[0].body);
          var uniqueScope = $rootScope.$new();
          var uniqueName = 'iframe-transport-' + uniqueScope.$id;
          uniqueScope.$destroy();
          var form = angular.element('<form></form>');
          form.attr('target', uniqueName);
          form.attr('action', config.url);
          form.attr('method', config.method || 'POST');
          form.css('display', 'none');
          if (files.length) {
              form.attr('enctype', 'multipart/form-data');
              form.attr('encoding', 'multipart/form-data');
          }
          var iframe = angular.element('<iframe name="' + uniqueName + '" src="javascript:false;"></iframe>');
          iframe.on('load', function () {
              iframe.off('load').on('load', function () {
                  var response;
                  try {
                      var doc = this.contentWindow ? this.contentWindow.document : this.contentDocument;
                      response = angular.element(doc.body).text();
                      if (!response.length) {
                          throw new Error();
                      }
                  } catch (e) {
                  }
                  form.append(angular.element('<iframe src="javascript:false;"></iframe>'));
                  try {
                      response = transformData(response, $http.defaults.transformResponse);
                  } catch (e) {
                  }
                  deferred.resolve({
                      data: response,
                      status: 200,
                      headers: [],
                      config: config
                  });
              });
              angular.forEach(files, function (input) {
                  var clone = input.clone(true);
                  input.after(clone);
                  form.append(input);
              });
              angular.forEach(config.data, function (value, name) {
                  var input = angular.element('<input type="hidden" />');
                  input.attr('name', name);
                  input.val(value);
                  form.append(input);
              });
              config.$iframeTransportForm = form;
              $http.pendingRequests.push(config);
              function transformData(data, fns) {
                  var headers = [];
                  if (angular.isFunction(fns)) {
                      return fns(data, headers);
                  }
                  angular.forEach(fns, function (fn) {
                      data = fn(data, headers);
                  });
                  return data;
              }
              function removePendingReq() {
                  var idx = indexOf($http.pendingRequests, config);
                  if (idx !== -1) {
                      $http.pendingRequests.splice(idx, 1);
                      config.$iframeTransportForm.remove();
                      delete config.$iframeTransportForm;
                  }
              }
              form[0].submit();
              promise.then(removePendingReq, removePendingReq);
          });
          form.append(iframe);
          body.append(form);
          return promise;
      }
      return iFrameUpload;
  }
    ]);

    local.factory('upload', [
  '$window',
  'formDataUpload',
  'iFrameUpload',
  function ($window, formDataUpload, iFrameUpload) {
      var support = {
          fileInput: !(new RegExp('(Android (1\\.[0156]|2\\.[01]))' + '|(Windows Phone (OS 7|8\\.0))|(XBLWP)|(ZuneWP)|(WPDesktop)' + '|(w(eb)?OSBrowser)|(webOS)' + '|(Kindle/(1\\.0|2\\.[05]|3\\.0))').test($window.navigator.userAgent) || angular.element('<input type="file" class="xaInputControl">').prop('disabled')),
          fileUpload: !!($window.XMLHttpRequestUpload && $window.FileReader),
          formData: !!$window.FormData
      };
      function upload(config) {
          if (support.formData && !config.forceIFrameUpload) {
              return formDataUpload(config);
          }
          return iFrameUpload(config);
      }
      upload.support = support;
      return upload;
  }
    ]);


})(window.XaNgFrameworkUpload);