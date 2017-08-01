var CurlyTemplates = (function()
{
	// hold number to route the parsed character through a series of possible actions
	var route,index,templates,stack,variableId;
	
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
		templates[index] = {n:'root', m:''};
		
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
						route = 1;
					}else
					if(c === '}')
					{
						route = (stack.length>0)? 5 : 0;
					}else{
						// write character to current index template data..
						templates[index].m += c;
						
						// ..and its parent templates also
						for(var e=0; e<stack.length; e++){
							templates[stack[e]].m += c;
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
						route = 2;
					}else 
					if(c.search(/^[a-zA-Z0-9_]+$/g) != -1)
					{
						// insert the current index value in the stack array position 0
						stack.unshift(index);
						
						// set the index value to the current templates list size
						index = templates.length;
						
						// create new template array object and insert character to object name
						templates[index] = {n:c, m:'' };
						
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
						variableId += c
					}else
					if(c === '}')
					{
						route = 3;
					}
					break;

//	route 3 : variable ID parsing stopped. expecting:
//			- a '}' char. Terminate parsing the variable ID. reset route to 0
//			- any other chars are discarded;

				case 3:
					if(c === '}')
					{
						// replace variable for its value in markup
						if(variableId in modelData)
						{
							// write value to current index template markup..
							templates[index].m += modelData[variableId];
						
							// ..and its parent templates also
							for(var e=0; e<stack.length; e++)
							{
								templates[stack[e]].m += modelData[variableId];
							}
							// reset variable ID string
							variableId = '';
									
						}else{
							for(var a=0; a<templates.length; a++)
							{
								if(variableId == templates[a].n)
								{
									// write value to current index template markup..
									templates[index].m += templates[a].m;
						
									// ..and its parent templates also
									for(var e=0; e<stack.length; e++)
									{
										templates[stack[e]].m += templates[a].m;
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
						templates[index].n += c;
					}else
					if(c === '{')
					{
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
						route = 0;
					}
					break;									
			}// end of switch(route)
		}// end of for loop
		
		return templates[0].m;
		
	};// end of parseString function
	
	
	// Public stuff 
	return{
		parse : parse
	}
	
})()