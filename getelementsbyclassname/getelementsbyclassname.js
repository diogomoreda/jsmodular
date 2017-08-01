/***********************************************************************************************************************************	
**	TITLE:		custom GetElementsByClassName()
**	VERSION:	1.0 19-Nov-2016
**
**	AUTHOR:		Diogo Moreda(mindthefrequency.com)
**
**	DESCRIPTION: 	custom function to replace the getElementsByClassName native DOM method when
**					not available;
**
**	EXAMPLES:
**	To use just include this script using a script tag in the page header: 
		<script src="../js/getelementsbyclassname/getelementsbyclassname.js"></script>
**
**	And use it like:
		(document.getElementsByClassName)? document.getElementsByClassName('myclass')[0] : GetElementsByClassName('myclass')[0];
**
**********************************************************************************************************************************/
var GetElementsByClassName = document.getElementsByClassName || function(value,target)
{
	var root	= target || document.body || document.documentElement;
	var value	= value;
	var output	= [];
	
	(function parseElementClassName(target)
	{
		if(target.className.indexOf(value) !== -1){output.push(target);};
		
		var children = target.children;
		
		//console.log('getElementsByClassName.target.children = ' + children);	
		for(var i=0; i<children.length; i++)
		{
			parseElementClassName(children[i]);
		}
		
	})(root);
	
	return output;
}