define ([
		'jquery',
	], function ($) {


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
		 * Store the token into the localStorage
		 * 
		 * @method tokenSet
		 */
		var tokenSet = function (token)
		{
			if(!(typeof localStorage)) { return false; }
			localStorage.setItem('accessToken', token);
			return true;
		};

		return {
			tokenSet :tokenSet,
			tokenGet :tokenGet,
		};
	}
);
