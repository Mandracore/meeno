define ([
		'jquery',
		'channel',
	], function ($, channel) {

		/**
		 * Starts pinging the server until connexion is up
		 * 
		 * @method start
		 * @return {String} Returns timer id (usefull to kill it)
		 */
		var start = function (token)
		{
			return window.setInterval(function() {
				$.ajax({
					cache: false,
					type: 'GET',
					url: '/api/notes',
					timeout: 500,
					success: function(data, textStatus, request) {
						console.log('alive / server reached successfully');
					}
				})
			}, 2000);
		};

		/**
		 * Stops pinging the server
		 * 
		 * @method stop
		 * @param {String} timerId The id of the timer to kill
		 */
		var stop = function (timerId)
		{
			clearInterval(timerId);
		};

		return {
			start :start,
			stop  :stop,
		};
	}
);