//	TITLE:	ImageLoadBuffer					AUTHOR: Diogo Moreda 	DATE: 
//
//	DEPENDENCIES:	
//		none
//
//	DESCRIPTION:
//
//		Loads images into HTML elements(either <img> or not) by adding custom 
//		formatted image data objects to a list using the .add method. This method 
//		initiates the loading process(if not running already), ensuring that
//		files are loaded one after the other and never simultaneously. 
//		
//		Every time a file from the list is loaded, it is immediately placed
//		in the respective HTML element, either as a 'src' attribute for <img> 
//		elements, or as a background-image css rule that is added to the content 
//		of a style tag created and appended to the document head when
//		the onload method is called.
//
//		If provided, a classname string will be added to the elements class
//		attribute.
//
//		This creates the possibility of generating dynamic file loading 
//		queues that are loaded in a progressive fashion saving system resources.
//
//	PUBLIC METHODS:
//	
//		ImageLoadBuffer.add(Object)		-> 	adds an image data object to the list and starts the loading process.
//		
//		The ImageObject content should follow the structure:					  
//			- id 	: string 			-> one HTML element id used for the style rule reference
//			- ref 	: DOM reference		-> the HTML DOM reference from the respective element
//			- src 	: string 			-> one image file path
//			- class	: string			-> optionally a className string to add to the 
//									   	   element when the image loads
//
//		ImageLoadBuffer.progress()		->  returns the current queue loading progress in a percentage
//
//
// CODE:
var ImageLoadBuffer = (function()
{
	var debug = true;
	
	// console.log alias
	var p = function(msg){ if(console){if(console.log){console.log(msg)}} };
	
	//
	var error = function(error){ if(console){if(console.log){console.log(error)}} };
	
	// at var declaration, nothing is loaded yet
	var loaded = false;
	
	// load buffer styletag id
	var styletagId = 'image-load-buffer';
	
	// styletag element reference
	var styletag;
	
	// when styletag is successfully created, set to true
	var styletagExists = false;
	
	// image list is an array of image objects to be loaded sequentially
	var imageList = [];
	
	// image loading process status
	var loadingStatus = false;
	
	// loading progress percentage
	var loadProgress = 0;
	
	// holds loaded image objects 
	var output = [];
	
	// create one image object to load images
	var imageLoader = new Image();
		
		
		// assign a callback method to the imageLoader Object 
		imageLoader.onload = function()
		{
			// to be called every time an image is successfully loaded
			imageLoadSuccess();	
		};

		
		// assign a callback method to the imageLoader Object 
		imageLoader.onerror = function()
		{
			// to be called every time an image loading process fails
			imageLoadError();
		};
	
	
	
	// private callback method - called when an image file loads successfully
	var imageLoadSuccess = function()
	{
		if (imageList[0].ref)
		{
			// is target element an <image> ?
			if (imageList[0].ref.tagName.toLowerCase() == 'img')
			{
				// if is <image> element set its src attribute to the image file path
				imageList[0].ref.src = imageList[0].src;
			} else {
			// target element in NOT an <image>. image will be displayed in element using 'background-image' CSS rule
				if (styletagExists)
				{
					// not an <image> element. check if element has ID attribute set. if not create and assign a unique ID attribute to the element
					if (!imageList[0].ref.id)
					{
						imageList[0].ref.id = 'image-object-'+Math.floor(Date.now() / 1000);	
					}
					// add a css background rule to the head style tag
					addTostyleTag('#'+imageList[0].ref.id+'{background-image:url(\''+imageList[0].src+'\')}'+"\n");
				}else{
					// no style tag is available, add inline style to the element
					imageList[0].ref.style.backgroundImage = 'url('+imageList[0].src+')';
				}
			}
			if (imageList[0].loadClass)
			{
				if (imageList[0].ref.className.indexOf(imageList[0].loadClass) === -1)
				{
					imageList[0].ref.className += (imageList[0].ref.className.length==0)? imageList[0].loadClass : ' '+imageList[0].loadClass;
				}
			}
		}
		// push loaded image object to the output array
		output.push(imageList[0]);
		
		// load next image in the list
		loadNext();
	};
	
	
	// private callback method - called when an image file load fails
	var imageLoadError = function()
	{
		if (imageList[0].ref)
		{
			if (imageList[0].errorClass)
			{
				if (imageList[0].ref.className.indexOf(imageList[0].errorClass) === -1)
				{
					imageList[0].ref.className += (imageList[0].ref.className.length==0)? imageList[0].errorClass : ' '+imageList[0].errorClass;
				}
			}
		}
		// load next image in the list
		loadNext();
	};
	
	
	//Returns true if it is a DOM node
	var isNode = function(o)
	{
	  return (typeof Node === "object" ? o instanceof Node : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string");
	};

	
	//Returns true if it is a DOM element    
	var isElement = function(o)
	{
	  return (typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string");
	};
	
	
	// public aliased method - 
	// pushes an image to the loading queue either by passing:
	// - image object arguments:  
	//		[0] src			:	'string with image file path' 
	// 		[1] ref			:	'HTML DOM element reference [optional]'
	//		[2] loadClass	:	'string with class to append on load[optional]'
	//		[3] errorClass	:	'string with class to append on error[optional]'
	// - Array of strings containing image file paths
	// - Array of image objects following the above structure
	// - Array of arrays with indexes matching the above structure
	// when an HTML DOM reference is provided, the image is displayed in the element when loaded;
	var addToList = function ()
	{
		// make sure some sort of argument was passed to the function
		if(arguments)
		{
			// only 1 argument was passed to the function - it should be either a string, an array of objects, or an array of arrays, 
			if (arguments.length == 1)
			{
				// make sure passed argument is string or array, when string, it should contain the image file source path
				if (typeof arguments[0] == 'string')
				{
					// assemble and pass the imageObject to the queue
					var imageObj = {src:arguments[0]};
					putImage(imageObj);
				} else
				// make sure this 1 argument is an array
				if (Object.prototype.toString.call(arguments[0]) == '[object Array]')
				{
					// iterate through array
					for (var i=0; i<arguments[0].length; i++)
					{
						// check if the current index of the array being iterated contains an OBJECT
						if (Object.prototype.toString.call(arguments[0][i]) == '[object Object]')
						{
							// make sure that required object properties exist
							if(arguments[0][i].src)
							{
								// validate data by type matching 
								if(typeof arguments[0][i].src == 'string')
								{
									// assemble and pass the imageObject to the queue
									var imageObj = {};
										imageObj.src = arguments[0][i].src;
									if(arguments[0][i].ref){ if(isElement(arguments[0][i].ref)){ imageObj.ref = arguments[0][i].ref; } }
									if(arguments[0][i].loadClass){ if(typeof arguments[0][i].loadClass == 'string'){ imageObj.loadClass = arguments[0][i].loadClass; } } 
									if(arguments[0][i].errorClass){ if(typeof arguments[0][i].errorClass == 'string'){ imageObj.errorClass = arguments[0][i].errorClass; } } 
									putImage(imageObj);
									p('type of argument in array is an OBJECT with a src property defined. Added '+imageObj+'to queue.');
									continue;
								}
							}
						}
						
						// check if the current index of the array being iterated contains an ARRAY
						if (Object.prototype.toString.call(arguments[0][i]) === '[object Array]')
						{
							// make sure that required object properties exist
							if(arguments[0][i][0])
							{
								// validate data by type matching 
								if(typeof arguments[0][i][0] == 'string')
								{
									// assemble and pass the imageObject to the queue
									var imageObj = {};
										imageObj.src = arguments[0][i][0];
									if (arguments[0][i][1]){ if (isElement(arguments[0][i][1])){ imageObj.ref = arguments[0][i][1]; } }
									if (arguments[0][i][2]){ if (typeof arguments[0][i][2] == 'string'){ imageObj.loadClass = arguments[0][i][2]; } }
									if (arguments[0][i][3]){ if (typeof arguments[0][i][3] == 'string'){ imageObj.errorClass = arguments[0][i][3]; } }
									putImage(imageObj);
									p('type of argument in array is an ARRAY with a src property defined. Added '+imageObj+'to queue.');
									continue;
								}
							}
						}
						
						// check if the current index of the array being iterated contains a STRING
						if (typeof arguments[0][i] == 'string')
						{
							// assemble and pass the imageObject to the queue
							var imageObj = {};
								imageObj.src = arguments[0][i];
							putImage(imageObj);
							p('type of argument in array is a STRING with a src property defined. Added '+imageObj+'to queue.');
							continue;
						}
						
					}// end of for() loop
				} 
				
			// more then 1 argument was passed to the function
			} else {
				// validate argument data by type matching 
				if(typeof arguments[0] == 'string')
				{
					// assemble and pass the imageObject to the queue
					var imageObj = {};
						imageObj.src = arguments[0];
					if(arguments[1]){ if(isElement(arguments[1])){ imageObj.ref = arguments[1]; } } 
					if(arguments[2]){ if(typeof arguments[2] == 'string'){ imageObj.loadClass = arguments[2]; } }
					if(arguments[3]){ if(typeof arguments[3] == 'string'){ imageObj.errorClass = arguments[3]; } }
					putImage(imageObj);
				}
			}
			
			// start loading images
			loadQueue();
			
		}else{
			// no arguments? no good.
			return false;
		}
	};
	
	
	// private method - add an image object to the image array
	// image objects follow the structure: {ref:"elementDomRef",src:"imageFilePath",loadClass[optional]:"classNameToAddOnLoad",errorClass[optional]:"classNameToAddOnError"}
	var putImage = function(imageObj)
	{
		// push the parsed image object to the image array
		imageList.push(imageObj);
		
		// update loadProgress value
		loadProgress = parseInt(100/(imageList.length+1));
		
		// if not loading already...
		if(!loadingStatus)
		{
			// ...then start loading image files
			loadQueue();
		}		
	};
	
	
	// private method - start loading image Array
	var loadQueue = function()
	{
		// if image file array is empty, terminate the loading process
		if(imageList.length == 0)
		{	
			// set loadingStatus to false
			loadingStatus = false;
			
			// call process finished callback
			finishCallback();
			
			// and break the function here
			return false;	
		}
		// if image file array not empty, set loading status to true
		loadingStatus = true;
		
		// start loading the first image in the image array
		imageLoader.src = imageList[0].src;
	};
	
	
	// private method - load the next image in the image list
	var loadNext = function()
	{
		// remove the last loaded image object from the image array
		imageList.shift();
		
		// update loadProgress value
		loadProgress = parseInt(100/(imageList.length+1));
		
		// call update custom method
		updateCallback();
		
		// start loading image files
		loadQueue();
	};
	
	
	// publicly aliased method - return the current load progress in a percentage
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
	
	
	// private method - create and add a <style> tag to the page <head>
	var createStyleTag = function()
	{
		styletag = document.createElement('style');
		
		styletag.id = styletagId;
			
		styletag.type = 'text/css';//old school support
			
		var head = document.head || document.getElementsByTagName('head')[0];
		
		var referenceNode = head.getElementsByTagName('style')[head.getElementsByTagName('style').length-1] || head.getElementsByTagName('script')[head.getElementsByTagName('script').length-1] || head.lastChild;
		
		referenceNode.parentNode.insertBefore(styletag, referenceNode.nextSibling);	
	};
	
	
	// private method - add unparsed CSS strings to the module styleTag
	var addTostyleTag = function(str)
	{
		// reality check, is there an actual created style tag?
		if (styletag)
		{
			// yes, one of the following methods will add the string to the style
			if (styletag.styleSheet)
			{
				styletag.styleSheet.cssText = str;
			}else 
			{
				styletag.appendChild(document.createTextNode(str));
			}
		}else{
			// no style tag? return false
			return false;
		}
	};
	
	
	// CALLBACKS - process is finished
	
	// function reference to be called inside the finishCallback() method 
	var customFinishCallback = function(){};
	
	// private method - called every time the list finishes loading
	var finishCallback = function()
	{
		var output = getOutput();
		
		customFinishCallback(output);	
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
	
	// private method - to be called after page loads
	var onload = function()
	{
		// make sure the module is loaded only once
		if(loaded){return true;}
		
		loaded = true;
		
		p("imageLoadBuffer.onload()");
		
		// run the method to create a style tag
		createStyleTag();
		
		// make sure the style tag is created
		if(typeof styletag !== null) styletagExists = true;
	};
	
	p("Image Load Buffer Module Running...");
	
	
	// attach the onload private method to the js load event using addEventListener
	window.addEventListener('load',onload);
	
	
	// PUBLIC STUFF
	return{
		load 				: addToList,
		get					: getOutput,
		progress 			: getProgress,
		reset				: resetOutput,
		setFinishCallback	: setFinishCallback,
		setUpdateCallback	: setUpdateCallback
	}
	
})();