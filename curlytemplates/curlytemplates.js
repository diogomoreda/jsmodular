//	TITLE:	CurlyTemplates					AUTHOR: Diogo Moreda 	DATE: 
//
//	DEPENDENCIES:	
//		none
//
//	DESCRIPTION:
//
//	Used to parse strings of HTML written in Curly Templates format and outputs regular HTML;
//	The Curly Templates format has 2 types of possible data that the parser will search and replace:
//	
//	{{variable}} -		a variable is a string written inside a pair of curly brackets 
//						using alphanumeric and underscore characters like: {{some_name}}
//						It can be written anywhere inside the template's HTML: 
//						...<div id="mydiv" class="{{mydiv_class}}">{{mydiv_content}}</div>...
//						The variable replacement value will be either: 
//						-	a property with the same name as the one inside the curly brackets 
//							defined inside the object passed as the argument 'modelData' to the .parse method.
//						-	the markup of a subtemplate that was defined prior to this parsing point.
//
//	{subtemplate{}} -	a subtemplate is a piece of HTML or plain text written inside a pair of curly brackets.
//						Each subtemplate must be defined by a unique name written using alphanumeric and underscore 
//						characters, in between the 1st and 2nd opening curly brackets.
//						The subtemplate content is defined only after the 2nd opening curly bracket like:  
//						...</div>{subtemplate_name{subtemplate HTML content}}<span>some stuff</span>...
//						The subtemplate markup will be added to the output markup at the same point it is parsed,
//						and will also be held in memory to later replace any {{variable}} found ahead in the template.
//						subtemplates may be defined inside other subtemplates to replace parts of the parent subtemplate.
//	
//	PUBLIC METHODS:
//	
//		CurlyTemplates.parse(template,modelData[optional])	-> 	parses a CurlyTemplates formatted string and outputs
//																its raw HTML.
//				template	-	Curly Template Formatted string;
//				modelData	-	object with property values with names to match those inside the template {{variable}} blocks
//
//		
//
// CODE:
var CurlyTemplates = (function()
{
	// set to true to log the whole process
	var debug = false;
	
	// alias method to console.log
	var p = function(str){if(console&&console.log&&debug)console.log(str)};
	
	// hold number to route the parsed character through a series of possible actions
	var route = 0;
	
	// used to set the current template being written in the templates array
	var index = 0;
	
	// holds a list of template objects like:{name:'some string with a unique name', markup:'some string with markup that makes the template'} 
	var templates = [];
	
	// create a stack array to keep track of the parent template indexes that the current template is related to.
	var stack = [];
	
	// string to collect variableId characters
	var variableId = '';
	
	
	// PUBLIC ALIASED METHOD - used to parse the template and return the raw html string
	var parse = function(template, modelData)
	{
		// reset every module variable
		route = 0;
		index = 0;
		templates = [];
		stack = [];
		variableId = '';
		
		// create the first template object for the base markup(markup outside template brackets) 
		templates[index] = {name:'root', markup:''};
		
		var model = modelData || {};
		
		return parseTemplate(template, model);
	};
	
	
	// PRIVATE METHOD - actual parser, iterates through every template string character
	// 				    and acts accordingly to action branch
	var parseTemplate = function(template, modelData)
	{
		for(var i=0; i<template.length; i++)
		{
			// get and evaluate current iteration instance template character
			var c = template.charAt(i);
			
			// switch actions according to route value
			switch(route)
			{
//	route 0 : initial idle state. expecting:
//			- a '{' char to start the parsing process. set route to 1
//			- a '}' char to stop the template parsing process;. set route to 5, or 0 if stack is empty
//			- any other chars are added to the current index markup string in the templates array;

				case 0:
					if(c === '{')
					{
						p('route '+route+' - '+c+' found. Parsing process started.');
						
						route = 1;
					}else
					if(c === '}')
					{
						p('route '+route+' - '+c+' found. Data parsing stopped.');
						
						route = (stack.length>0)? 5 : 0;
					}else{
						p('route '+route+' - '+c+' was appended to index '+index+' data and its '+stack.length+ ' parent templates');
						
						// write character to current index template data..
						templates[index].markup += c;
						
						// ..and its parent templates also
						for(var e=0; e<stack.length; e++){
							templates[stack[e]].markup += c;
						}
					}
					break;
//	route 1 : Parsing process running. Is it a variable ID or a subtemplate?. expecting:
//			- a '{' char. Start parsing a variable ID ; set route to 2
//			- an alphanumeric or underscore char. Start parsing subtemplate ID; set route to 3
//			- any other chars are discarded;

				case 1:
					if(c === '{')
					{
						p('route '+route+' - '+c+' found. Variable ID parsing started.');
						
						//templates[index] = {id:''};
						
						route = 2;
					}else 
					if(c.search(/^[a-zA-Z0-9_]+$/g) != -1)
					{
						p('route '+route+' - '+c+' found. Subtemplate ID parsing started. '+index+' was added to stack. index was updated to '+templates.length);
						
						// insert the current index value in the stack array position 0
						stack.unshift(index);
						
						// set the index value to the current templates list size
						index = templates.length;
						
						// create new template array object and insert character to object name
						templates[index] = {name:c, markup:'' };
						
						// handling subtemplate ID aquisition, set route to 4
						route = 4; 
					}
					break;
					
//	route 2 : Parsing a variable ID. expecting:
//			- an alphanumeric or underscore char. append to the variable ID; route does not change 
//			- a '}' char. Stop parsing the variable ID ; set route to 4
//			- any other chars are discarded;

				case 2:
					if(c.search(/^[a-zA-Z0-9_]+$/g) != -1)
					{
						p('route '+route+' - '+c+' found. Variable ID updated.');
						
						variableId += c
					}else
					if(c === '}')
					{
						p('route '+route+' - '+c+' found. Variable ID parsing stopped.');
						
						route = 3;
					}
					break;

//	route 3 : variable ID parsing stopped. expecting:
//			- a '}' char. Terminate parsing the variable ID. reset route to 0
//			- any other chars are discarded;

				case 3:
					if(c === '}')
					{
						p('route '+route+' - '+c+' found. Variable ID parsing Terminated.');
						
						// replace variable for its value in markup
						if(variableId in modelData)
						{
							p('route '+route+' - '+c+'. variableId '+variableId+' was found in modelData. adding to markup: '+modelData[variableId]);
							// write value to current index template markup..
							templates[index].markup += modelData[variableId];
						
							// ..and its parent templates also
							for(var e=0; e<stack.length; e++)
							{
								templates[stack[e]].markup += modelData[variableId];
							}
							// reset variable ID string
							variableId = '';
									
						}else{
							for(var a=0; a<templates.length; a++)
							{
								if(variableId == templates[a].name)
								{
									p('route '+route+' - '+c+'. variableId '+variableId+' was found in templates. adding to markup: '+templates[a].markup);
									
									// write value to current index template markup..
									templates[index].markup += templates[a].markup;
						
									// ..and its parent templates also
									for(var e=0; e<stack.length; e++)
									{
										templates[stack[e]].markup += templates[a].markup;
									}
									
									// reset variable ID string
									variableId = '';
								}
							}
						}
						route = 0;
					}
					break;		

//	route 4 : Parsing a subtemplate NAME. expecting:
//			- an alphanumeric or underscore char. append to the subtemplate name; route does not change 
//			- a '{' char. Stop parsing the subtemplate name. start parsing the subtemplate data ; set route to 0
//			- any other chars are discarded;

				case 4:
					if(c.search(/^[a-zA-Z0-9_]+$/g) != -1)
					{
						p('route '+route+' - '+c+' found. Subtemplate name updated.');
						
						templates[index].name += c;
					}else
					if(c === '{')
					{
						p('route '+route+' - '+c+' found. Subtemplate name parsing stopped. parsing the subtemplate data started');
						
						route = 0;
					}
					break;
					
//	route 5 : subtemplate MARKUP parsing stopped. expecting:
//			- a '}' char. Terminate parsing the subtemplate data. set index to the template parent index. reset route to 0
//			- any other chars are discarded;

				case 5:
					if(c === '}')
					{
						// set index to the template parent 
						index = stack.shift();
						
						p('route '+route+' - '+c+' found. Subtemplate markup parsing Terminated. Stack shifted. Index set to '+index);
						
						route = 0;
					}
					break;									
			}// end of switch(route)
		}// end of for loop
		
		if(!debug)
		{
			for(var i=0; i<templates.length; i++)
			{
				console.log(templates[i].name, templates[i].markup);
			}
		}
		
		return templates[0].markup;
		
	};// end of parseString function
	
	
	// Public stuff 
	return{
		parse : parse
	}
	
})()



//	RegExp:
//	{		- look for and include {
//	[^}]	- next, look for any chars that are not }
//	*		- 0 or more characters are included
//	?		- lazy, dont look too far
//	}		- include next } char
//	[^{]	- next, look for any chars that are not {
//	*		- 0 or more characters are included
//	?		- lazy, dont look too far
//	}		- finish by including last } char
//var result = /{[^}]*?}[^{]*?}/g.exec(rawStr);
//			var regexResult = rawStr.match(/{[^}]*?}[^{]*?}/g);
//			
//			for(var i=0; i < regexResult.length; i++) 
//			{
//				console.log(i, regexResult[i]);
//			}