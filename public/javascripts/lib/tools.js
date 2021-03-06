define ([
		'jquery',
	], function ($) {

		var makeid = function ()
		{
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for( var i=0; i < 10; i++ ) {
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			};

			return text;
		};

		var getCaretsNode = function ()
		{
			var target=null;
			if(window.getSelection)
			{
				target=window.getSelection().getRangeAt(0).commonAncestorContainer;
				return((target.nodeType===1)?target:target.parentNode);
			}
			else if(document.selection)
			{
				var target=document.selection.createRange().parentElement();
			}
			return target;
		};

		var pasteHtmlAtCaret = function (html) {
			var sel, range;
			if (window.getSelection) {
				// IE9 and non-IE
				sel = window.getSelection();
				if (sel.getRangeAt && sel.rangeCount) {
					range = sel.getRangeAt(0);
					range.deleteContents();

					// Range.createContextualFragment() would be useful here but is
					// non-standard and not supported in all browsers (IE9, for one)
					var el = document.createElement("div");
					el.innerHTML = html;
					var frag = document.createDocumentFragment(), node, lastNode;
					while ( (node = el.firstChild) ) {
						lastNode = frag.appendChild(node);
					}
					range.insertNode(frag);

					// Preserve the selection
					if (lastNode) {
						range = range.cloneRange();
						range.setStartAfter(lastNode);
						range.collapse(true);
						sel.removeAllRanges();
						sel.addRange(range);
					}
				}
			} else if (document.selection && document.selection.type != "Control") {
				// IE < 9
				document.selection.createRange().pasteHTML(html);
			}
		};

		var moveCaret = function (node, index) {
			var range = document.createRange();
			range.setStart(node,index);
			range.collapse(true);
			var selection = window.getSelection();//get the selection object (allows you to change selection)
			selection.removeAllRanges();//remove any selections already made
			selection.addRange(range);//make the range you have just created the visible selection
		};

		return {
			makeid          :makeid,
			getCaretsNode   :getCaretsNode,
			pasteHtmlAtCaret:pasteHtmlAtCaret,
			moveCaret       :moveCaret,
		};
	}
);
