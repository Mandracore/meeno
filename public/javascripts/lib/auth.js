define ([
		'jquery',
	], function ($) {

		/**
		 * Updates the headers to always send the provided JSON Web Token
		 * 
		 * @method headersUpdate
		 */
		var headersUpdate = function (token)
		{
			$( document ).ajaxSend(function( event, request, settings ) {
				request.setRequestHeader("x-access-token", localStorage.getItem('accessToken'));
			});
		};

		// When this module is loaded, it should update the headers automatically
		// if a token exists in the localStorage
		if(!!(typeof localStorage) && localStorage.getItem('accessToken')) {
			headersUpdate(localStorage.getItem('accessToken'));
		}

		/**
		 * Look for the token in the localStorage
		 * 
		 * @method tokenGet
		 */
		var tokenGet = function ()
		{
			if(!(typeof localStorage) || !localStorage.getItem('accessToken')) { return false; }
			return localStorage.getItem('accessToken');
		};

		/**
		 * Store the token into the localStorage and updates the headers
		 * 
		 * @method tokenSet
		 */
		var tokenSet = function (token)
		{
			if(!(typeof localStorage)) { return false; }
			localStorage.setItem('accessToken', token);
			headersUpdate(token);

			return true;
		};

		return {
			tokenSet :tokenSet,
			tokenGet :tokenGet,
		};
	}
);
