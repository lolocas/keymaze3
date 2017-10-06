(function (local, key) {
    'use strict';

    local.service('xaKeyboard', function ($rootScope) {

        key.filter = function (event) {
            // We remove any global filter, in order to allow binding keys on any element.
            // Optionally, specific elements (scopes) can be ignored from key management.

            return true;
        };

        var contextStack = [];

		function isValidContextType(context) {
			return angular.isString(context) || angular.isNumber(context);
		}

        return {

            /*
             * Use this function to activate specific keyboard contexts.
             * This should be used in conjunction with binding with context
             * (i.e. same keys in different areas of the app.)
             */
        	setContext: function (context) {

        		if (!isValidContextType(context)) {
					throw new Error('A valid string is required for setting a keyboard context.');
				}

				if (context === 'all') {
					throw new Error('Keyboard context `all` is reserved.');
				}

				context = context + '';

				if (_.last(contextStack) !== context) {
					contextStack.push(context);
					key.setScope(context);
				}
            },

            /*
             * Retrieve the active keyboard context.
             */
            getContext: function () {
                return key.getScope();
            },

            /*
             * Reset the active context to default value.
             * If a value is passed, the context is reset only if the given param is the current context.
             */
            resetContext: function (context) {
				
            	if (!isValidContextType(context)) {
            		throw new Error('A valid string is required for reseting the keyboard context.');
            	}

	            context = context + '';

            	if (_.last(contextStack) === context) {
            		key.deleteScope(context);
            		contextStack.pop();
		            var last = _.last(contextStack) || 'all';
		            key.setScope(last);
	            }
            },
            
            /*
             * 
             * Bind the given key to a specified callback.
             * For details on syntax see https://github.com/madrobby/keymaster
             * The callback received as parameters the keyboard event and the handler data.
             * The keyboard event is cacelable, use event.preventDefault() to stop propagation.
             * Context: string used to bind the key only for a specific context. 
             *          Usefull when using the same key conbination is different areas of the application.
             *          When a context functionality is not needed, and you want to bind keys globally
             *          for the app don't pass it, or pass as null.
             * apply:   bool used to prevent scope digest when the callback is called. 
             *          By default this is true and scope digest is called.
             * 
             */
            bind: function (keys, callback, context, apply) {
                
                var digestChanges = angular.isDefined(apply) ? apply : true;

                function propagate (event, handler) {
                    if (digestChanges && !$rootScope.$$phase) {
                        $rootScope.$apply(function () { callback(event, handler); });
                    } else {
                        callback(event, handler);
                    }
                }

                if (context) {
                    key(keys, context, propagate);
                } else {
                    key(keys, propagate);
                }

            },

            /*
             * Use this for unbinding a previously set key combination.
             * The context is optional.
             * When no scope is specified it defaults to the current scope (xaKeyboard.getContext())
             */
            unbind: function (keys, context) {
                key.unbind(keys, context);
            }
        };

    });

})(window.XaNgFrameworkServices, key);