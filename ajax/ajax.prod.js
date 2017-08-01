var Ajax = (function()
{
	// error handler method
	var error = function(str){if(console&&console.log)console.log(str)};
	
	// define the XMLhttpRequest object using a self invoking function to try every
	// creation pattern in the ajax factory array.
	var ajax = (function(ajaxFactory)
	{
		var xhr = false;
		for (var i=0; i<ajaxFactory.length; i++) 
		{
			try { xhr = ajaxFactory[i](); }
			catch(e) { continue; }
			break;
		}
		return xhr;
	})([
		function () {return new XMLHttpRequest()},
		function () {return new ActiveXObject("Msxml3.XMLHTTP")},
		function () {return new ActiveXObject("Msxml2.XMLHTTP.6.0")},
		function () {return new ActiveXObject("Msxml2.XMLHTTP.3.0")},
		function () {return new ActiveXObject("Msxml2.XMLHTTP")},
		function () {return new ActiveXObject("Microsoft.XMLHTTP")}
	]);
	
	
	// AJAX wrapper function
	// requires: 
	//	- script file path, 
	//	- parameters object || {}
	//	- success callback method || null
	//	- fail callback method || null
	//	- request method (either 'GET'[default] or 'POST')
	//	- option to parse the server result as json(default=false)
	//
	var request = function (url, vars, success_callback, fail_callback, method, parseJson)
	{
		// perform some argument sanitation
		
		// lazy check url string
		if (url.length < 5)
		{ 
			error('Ajax.request() -> ERROR invalid script url was provided!');
			return false;
		}
		
		// if vars not set, default to an empty object
		var vars = vars || {};
		
		// if success_callback not set, default to empty function
		var success_callback = success_callback || function(){p('Ajax.success_callback();');};
		
		// if fail_callback not set, default to empty function
		var fail_callback = fail_callback || function(){p('Ajax.fail_callback();');};
		
		// if method not set, default to 'GET'
		var method = (method == 'POST')? 'POST' : 'GET';
		
		// if parseJson not set, default to false
		var parseJson = parseJson || false;
		
		
		// assemble the url request string with the required arguments
		var parameters = '';
		
		for (var key in vars)
		{
			parameters += key+'='+encodeURIComponent(vars[key])+'&';
		};
		parameters += 'r='+Math.floor(Math.random()*1000000); 
		
		
		// AJAX onreadystatechange handler
		ajax.onreadystatechange = function()
		{
			
			try
			{
				if (ajax.status	== 200)
				{
					if (ajax.readyState == 4) 
					{
						if(!parseJson)
						{
							return success_callback(ajax.responseText);
						}else{
							try
							{
								var results = JSON.parse(ajax.responseText);
							}
							catch(e)
							{
								return fail_callback('Sorry, Json Parsing failed '+e+' '+ ajax.responseText);
							}
							return success_callback(results);
						}
					}
				}else{
					
					if (ajax.readyState	== 4 ) 
					{
						return fail_callback('Sorry, a server error[2] was found '+ajax.status);
					}	
				}
			}
			catch(e)
			{
				return fail_callback('Sorry, a server error[1] was found '+e);
			}
		};

		// set type of request according to specified method
		switch(method)
		{
			case 'POST':
				ajax.open('POST', url, true);
				ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				//ajax.setRequestHeader("Content-length", parameters.length);
				//ajax.setRequestHeader("Connection", "close");
				ajax.send(parameters);
				break;
			
			case 'GET': default:
				ajax.open('GET', url+'?'+parameters, true);
				ajax.send(null);
				break;
		}
			
	}; // end of request private method
	
	return{
		request : request
	}
})();	