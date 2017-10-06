(function (local) {
	'use strict';

	/*
	 * Simple publisher/subscriber helper.
	 */

	local.service('xaEventing', function () {

		var topics = {},
			subUid = -1;

		this.publish = function (topic, args) {

			if (!topics[topic]) {
				return false;
			}

			var subscribers = topics[topic],
				len = subscribers ? subscribers.length : 0;

			while (len--) {
				subscribers[len].func(topic, args);
			}

			return true;

		};

		this.subscribe = function (topic, func) {

			if (!topics[topic]) {
				topics[topic] = [];
			}

			var token = (++subUid).toString();
			topics[topic].push({
				token: token,
				func: func
			});
			return token;
		};

		this.unsubscribe = function (token) {
			for (var m in topics) {
				if (topics[m]) {
					for (var i = 0, j = topics[m].length; i < j; i++) {
						if (topics[m][i].token === token) {
							topics[m].splice(i, 1);
							if (topics[m].length == 0)
								delete topics[m];
							return token;
						}
					}
				}
			}
			return false;
		};

	});

})(window.XaNgFrameworkServices);