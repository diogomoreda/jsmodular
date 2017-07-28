var Codebox = (function()
{
	// set to true to log every step to the console
	var debug = true;
	
	// console.log alias method
	var p = function(str){if(console && console.log && debug){console.log(str);}};
	
	
	var convertString = function(content)
	{
		if(typeof content !== 'string')return false;
		
		return '<pre class="converted-code"><code>'+parseCode(content)+'</code></pre>';
	};
	
	
	var convertContent = function(sourceElement,targetElement)
	{
		var content = sourceElement.innerHTML || sourceElement.value;
		
		var target = (targetElement)? targetElement : sourceElement;
		
		var output = '<pre class="converted-code"><code>'+parseCode(content)+'</code></pre>';
		
		if(target.tagName.toLowerCase() == "textarea")
		{ 
			target.value = output;
		}else{
			target.innerHTML = output;
		}
	};
	
	
	var parseCode = function(code)
	{
		var mode = 0;
	
		var codeArray = code.split('');
		var output = [];
		var content = []; 
		var quote = '';
		var lines = '';
		var linectr = 1;
		var locked = true;
		
		
		function flushContent()
		{
			
		}
		
		// loop through every character in the codeArray
		for(var i=0; i<codeArray.length; i++)
		{
			// if char in codeArray[i] is either a return a tab or a newline
			if(/\r|\n|\t/.test(codeArray[i]))
			{
				// if char in codeArray[i] is either a return or a newline
				if(/\r|\n/.test(codeArray[i]))
				{
					// if relevant data was already found and the lock is true
					if(!locked)
					{
						// add new lines
						lines += '<span>'+linectr+'</span>';
						linectr++;
						content.push(codeArray[i]);
					}
				}else{
					// if char in codeArray[i] is a tab
					//content.push(codeArray[i]);
				}
				
				if(/\r/.test(codeArray[i])){p( '\\r found');}
				if(/\n/.test(codeArray[i])){p( '\\n found');}
				if(/\t/.test(codeArray[i])){p( '\\t found');}
				
			}else{
				locked = false;
				switch (mode)
				{
					// mode 0 - expecting a '<' character any other are appended to content array
					case 0:
					
						switch(codeArray[i])
						{
							case '<':
								type = 'html';
								output.push('<span class="content">'+content.join('')+'</span>');
								content = [];
								output.push('<span class="bracket">'+codeArray[i]+'</span>');
								mode++;
								p('mode 0 - ' + codeArray[i]+' found - mode = ' + mode );
								break;
								
							case '[':
								type = 'shortcode';
								output.push('<span class="content">'+content.join('')+'</span>');
								content = [];
								output.push('<span class="sq-bracket">'+codeArray[i]+'</span>');
								mode=10;
								p('mode 0 - ' + codeArray[i]+' found - mode = ' + mode );
								break;
							
							case '>':
								output.push('<span class="content">'+content.join('')+'</span>');
								content = [];
								output.push('<span class="bracket">'+codeArray[i]+'</span>');
								p('mode 0 - ' + codeArray[i]+' found - mode = ' + mode );
								break;
								
							case ']':
								output.push('<span class="content">'+content.join('')+'</span>');
								content = [];
								output.push('<span class="sq-bracket">'+codeArray[i]+'</span>');
								p('mode 0 - ' + codeArray[i]+' found - mode = ' + mode );
								break;
								
							default:
								content.push(codeArray[i]);
								p('mode 0 - ' + codeArray[i]+' found - mode = ' + mode );
								break;
						}
						break;
					
					
					// mode 1 - expecting first alphabetic char for tag name. white spaces and other chars are discarded	
					case 1:
					
						if(codeArray[i].match(/^[a-z]+$/i))
						{
							content.push(codeArray[i]);
							mode++;
							p('mode 1 - ' + codeArray[i]+' found - mode = ' + mode );
						}else{
							switch(codeArray[i])
							{
								case '/':
									output.push('<span class="tagname">'+content.join('')+'</span>');
									content = [];
									output.push('<span class="slash">'+codeArray[i]+'</span>');
									mode=7;
									p('mode 1 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
									
								case '>':
									output.push('<span class="tagname">'+content.join('')+'</span>');
									content = [];
									output.push('<span class="bracket">'+codeArray[i]+'</span>');
									mode=0;
									p('mode 1 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
							}
						}
						break;
					
					
					// mode 2 - expecting alphabetic char for tag name. 
					// whitespace or > terminates tag name parsing
					case 2:
					
						if(codeArray[i].match(/^[a-z]+$/i))
						{
							content.push(codeArray[i]);
							p('mode 2 - ' + codeArray[i]+' found - mode = ' + mode );
						}else{
							switch(codeArray[i])
							{
								case ' ':
									output.push('<span class="tagname">'+content.join('')+'</span>');
									content = [];
									output.push('<span class="space">'+codeArray[i]+'</span>');
									mode++;
									p('mode 2 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
									
								case '>':
									output.push('<span class="tagname">'+content.join('')+'</span>');
									content = [];
									output.push('<span class="bracket">'+codeArray[i]+'</span>');
									mode=0;
									p('mode 2 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
							}
						}
						break;
						
						
					// mode 3 - expecting first alphabetic or '-' or ' ' character for ATTRIBUTE NAME. 
					//			'>' terminates tag
					
					case 3:
					
						if(codeArray[i].match(/^[a-z_-]+$/i))
						{
							content.push(codeArray[i]);
							mode++;
							p('mode 3 - ' + codeArray[i]+' found - mode = ' + mode );
						}else{
							switch(codeArray[i])
							{
								case ' ':
									if(output[output.length-1] != ' ')
									{
										output.push('<span class="space">'+codeArray[i]+'</span>');
									};
									p('mode 3 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
									
								case '>':
									output.push('<span class="bracket">'+codeArray[i]+'</span>');
									mode=0;
									p('mode 3 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
							}
						}
						break;
					
					
					// mode 4 - expecting alphabetic or '_' or '-' characters for ATTRIBUTE NAME. 
					//			'=' or ' ' terminates attribute name parsing. 
					//			'>' ends tag	
					case 4:
					
						if(codeArray[i].match(/^[a-z_-]+$/i))
						{
							content.push(codeArray[i]);
							p('mode 4 - ' + codeArray[i]+' found - mode = ' + mode );
						}else{ 
							switch(codeArray[i])
							{
								case '=':
									output.push('<span class="attribute">'+content.join('')+'</span>');
									content = [];
									output.push('<span class="equal">'+codeArray[i]+'</span>');
									quote = '';
									mode++;
									p('mode 4 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
								case ' ':
									output.push('<span class="attribute">'+content.join('')+'</span>');
									content = [];
									quote = '';
									mode++;
									p('mode 4 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
								case '>':
									output.push('<span class="attribute">'+content.join('')+'</span>');
									content = [];
									output.push('<span class="bracket">'+codeArray[i]+'</span>');
									mode=0;
									p('mode 4 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
							}
						}
						break;
						
						
					// mode 5 - expecting " or ' for ATTRIBUTE VALUE enclosure.
					//			alphanumeric, '-' and '_' get appended to content array. 
					//			'>' terminates tag.	
					case 5:
					
						if(codeArray[i].match(/^[a-z0-9_-]+$/i))
						{
							content.push(codeArray[i]);
							p('mode 5 - ' + codeArray[i]+' found - mode = ' + mode );
						}else{ 
							switch(codeArray[i])
							{
								case '"':
								case "'":
									quote = codeArray[i];
									output.push('<span class="quote">'+codeArray[i]+'</span>');
									mode++;
									p('mode 5 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
								case '>':
									output.push('<span class="bracket">'+codeArray[i]+'</span>');
									mode=0;
									p('mode 5 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
							}
						}
						break;
						
						
					// mode 6 - expecting any character for ATTRIBUTE VALUE. 
					//			''' or '"' terminates attribute name parsing. 
					//			'>' terminates attribute name parsing and closes tag 
					case 6:
						
						switch(codeArray[i])
						{
							case quote:
								output.push('<span class="value">'+content.join('')+'</span>');
								content = [];
								output.push('<span class="quote">'+codeArray[i]+'</span>');
								mode=3;
								p('mode 6 - ' + codeArray[i]+' found - mode = ' + mode );
								break;
								
							case '>':
								output.push('<span class="value">'+content.join('')+'</span>');
								content = [];
								output.push('<span class="quote">'+quote+'</span>');
								output.push('<span class="bracket">'+codeArray[i]+'</span>');
								mode=0;
								p('mode 6 - ' + codeArray[i]+' found - mode = ' + mode );
								break;
							
							default:
								content.push(codeArray[i]);
								break;
						}
						break;
					
					
					// mode 7 - expecting alphabetic char or '>' char because '/' was found before 
					//			'<' terminates the tag 
					case 7:
					
						if(codeArray[i].match(/^[a-z]+$/i))
						{
							content.push(codeArray[i]);
							p('mode 7 - ' + codeArray[i]+' found - mode = ' + mode );
						}else{ 
							switch(codeArray[i])
							{
								case '>':
									output.push('<span class="tagname">'+content.join('')+'</span>');
									content = [];
									output.push('<span class="bracket">'+codeArray[i]+'</span>');
									mode=0;
									p('mode 7 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
									
								case '<':
									output.push('<span class="content">'+content.join('')+'</span>');
									content = [];
									output.push('<span class="bracket">></span>');
									output.push('<span class="bracket">'+codeArray[i]+'</span>');
									mode=1;
									p('mode 7 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
							}
						}
						break;
						
						
						
					// mode 10 - expecting first alphabetic char for shortcode name. 
					// white spaces and other chars are discarded	
					case 10:
					
						if(codeArray[i].match(/^[a-z]+$/i))
						{
							content.push(codeArray[i]);
							mode++;
							p('mode 10 - ' + codeArray[i]+' found - mode = ' + mode );
						}else{
							switch(codeArray[i])
							{
								case '/':
									output.push('<span class="tagname">'+content.join('')+'</span>');
									content = [];
									output.push('<span class="slash">'+codeArray[i]+'</span>');
									mode=7;
									p('mode 1 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
									
								case ']':
									output.push('<span class="tagname">'+content.join('')+'</span>');
									content = [];
									output.push('<span class="sqbracket">'+codeArray[i]+'</span>');
									mode=0;
									p('mode 1 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
							}
						}
						break;
						
					// mode 11 - expecting alphanumeric char or any other for shortcode name. 
					// white spaces break cycle	
					case 11:		
						switch(codeArray[i])
						{
							case ' ':
								output.push('<span class="short-name">'+content.join('')+'</span>');
								content = [];
								output.push('<span class="space">'+codeArray[i]+'</span>');
								mode++;
								p('mode 1 - ' + codeArray[i]+' found - mode = ' + mode );
								break;
								
							case ']':
								output.push('<span class="short-name">'+content.join('')+'</span>');
								content = [];
								output.push('<span class="sqbracket">'+codeArray[i]+'</span>');
								mode=0;
								p('mode 1 - ' + codeArray[i]+' found - mode = ' + mode );
								break;
							default:
								content.push(codeArray[i]);
								break;
						}
						break;
						
					// mode 12 - expecting alphanumeric char or any other for shortcode attribute name start 
					// 
					case 12:
						if(codeArray[i].match(/^[a-z]+$/i))
						{
							
						}else{
							
							switch(codeArray[i])
							{
								case ']':
									output.push('<span class="tagname">'+content.join('')+'</span>');
									content = [];
									output.push('<span class="sqbracket">'+codeArray[i]+'</span>');
									mode=0;
									p('mode 1 - ' + codeArray[i]+' found - mode = ' + mode );
									break;
		
							}
						}
						break;
					
						
				}
			}
		}
		output.push('<span class="content">'+content.join('')+'</span>');
		content = [];	
		
		if(debug)
		{
			for(var i=0; i<codeArray.length;i++){ 
				p('output['+i+'] = ' + output[i]);
			}
		}
		
		//p('mode ' + codeArray);
		return output.join('')+'<span class="lines">'+lines+'</span>';//+'<textarea>'+output.join('')+'</textarea>';
	};
	
	// Return public methods
	return{
		convertString : convertString,
		convertContent : convertContent
	};
})()