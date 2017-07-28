// 	Gets the content from any file or list of files located in the local server.
//
//
//
//CODE:
var GetLocalFilesContent = (function()
{
	// set true to log every step into console
	var debug = true;
	
	// console.log alias
	var p = function(str){if(console && console.log && debug){console.log(str);}};
	
	// at var declaration, nothing is loaded yet
	var loaded = false;
	
	// file list is an array of local file paths
	var list = [];
	
	// keeps a list of the loaded files and its contents {name:'parsed file path', content:'file content in a string'}
	var output = [];
	
	// loading process status
	var loadingStatus = false;
	
	// loading progress percentage
	var loadProgress = 0;
	
	// reference to document body
	var b;
	
	
	// iframe element that will load and fetch the file content
	var fileLoader = document.createElement('iframe');
		fileLoader.style = "display:none;";
		fileLoader.onload = function()
		{
			// for name: extract the filename from the url and exclude its extension
			// for content: remove every line break and whitespace characters
			output.push(
				{	name 	: 	this.src.match(/([^\/]+)(?=\.\w+$)/)[0].replace(/[^\w]+/g, '_'), 
					content	:	this.contentWindow.document.body.innerHTML.replace(/\r?\n|\r|\t/g,'')
				});
			loadNext();
		};
		fileLoader.onerror = function()
		{
			loadError();
		};
		fileLoader.onabort = function()
		{
			loadError();
		};
	
	
	// file load error handler
	var loadError = function()
	{
		loadNext();
	};
	
	
	// load next available item in list when available
	var loadNext = function()
	{
		// remove first entry from the list
		list.shift();
		
		// update current load progress
		loadProgress = parseInt(100/(list.length+1));
		
		// call loading update callback
		updateCallback();
		
		// load queue
		loadQueue();
	};
	
	
	// start loading file list Array
	var loadQueue = function()
	{
		if(list.length == 0)
		{	
			// set loadingStatus to false
			loadingStatus = false;
			
			// call loading finished callback
			finishCallback();
			
			// and break the function here
			return false;	
		}
		// set loading status to true
		loadingStatus = true;
		
		// start loading first image in array
		fileLoader.src = list[0];
	};
	
	
	// publicly aliased method - add files to the list:
	// filePath -> can be either a file path string or an array of filepath strings
	var addToList = function(filePath)
	{
		if(Object.prototype.toString.call( filePath ) === '[object Array]')
		{	
			for(var i=0; i<filePath.length; i++)
			{
				if (filePath[i].length>0){ list.push(filePath[i]); p(filePath[i]+' added to list'); }
			}
		}else{
			if (filePath.length>0){ list.push(filePath); p(filePath+' added to list'); }
		}
		if(loaded) loadQueue();
	};
	
	
	// publicly aliased method - returns current list state load progress
	var getProgress = function()
	{
		return loadProgress;
	};
	
	
	// publicly aliased method - returns output array with a list of objects{name:'',content:''}
	var getOutput = function()
	{
		return output;
	};
	
	
	// publicly aliased method - reinitialize the output array
	var resetOutput = function()
	{
		output = [];
	};
	
	// CALLBACKS - process is finished
	
	// function reference to be called inside the finishCallback() method 
	var customFinishCallback = function(){};
	
	// private method - called every time the list finishes loading
	var finishCallback = function(output)
	{
		var progress = getProgress();
		
		customFinishCallback(progress);	
	};
	
	// publicly aliased method - set a function to be called every time the list finishes loading
	var setFinishCallback = function(fn)
	{
		customFinishCallback = fn;
	};
	
	
	// CALLBACKS - process is updated
	
	// function reference to be called inside the updateCallback() method 
	var customUpdateCallback = function(){};
	
	// private method - called every time the list is updated when loading
	var updateCallback = function()
	{
		var progress = getProgress();
		
		customUpdateCallback(progress);
	};
	
	// publicly aliased method - set a function to be called every time the list is updated
	var setUpdateCallback = function(fn)
	{
		customUpdateCallback = fn;
	};
	
	
	// WINDOW.ONLOAD
	
	// private method - to be called on window load
	var onload = function()
	{
		// make sure the module is loaded only once
		if(loaded){return true;}
		
		loaded = true;
		
		b = document.body || document.getElementsByTagName('body')[0];
		
		b.appendChild(fileLoader);
		
		p("GetServerFiles.onload()");
		
		if(list.length > 0) loadQueue();	
	};
	
	
	p("GET SERVER FILES Module Running...");
	
	// attach the onload private method to the js load event using addEventListener
	window.addEventListener('load',onload);
	
	
	// PUBLIC STUFF
	
	return{
		add 				: addToList,
		get 				: getOutput,
		reset				: resetOutput,
		progress 			: getProgress,
		setFinishCallback	: setFinishCallback,
		setUpdateCallback	: setUpdateCallback
	}
})();