"use strict";

(function(){
	window.newEditor = null;
	
	var whenEditorLoadedCallback = [];
	
	var newEditorConfig = {};
	var newEditorDefaultConfig = {
		theme : "default"
	};
	
	window.whenEditorLoaded = function(fn){
		whenEditorLoadedCallback = fn;
	};
	
	// gets the current path from this script's url (it's passed by page_tools.js)
	function getNewEditorPath(){
		var scripts = document.querySelectorAll("script");
		
		for(var x = 0; x < scripts.length; x++){
			var src = scripts.item(x).src;
			if(src.search(/#/) != -1){
				return src.split("#")[1];
			}
		}
		
		return null;
	}
	
	function loadScripts(callback){
		var newEditorPath = getNewEditorPath();
		var scriptQueue = [
			"../../assets/jquery.js", "cm/lib/codemirror.js", "cm/mode/xml/xml.js",
			"cm/mode/javascript/javascript.js", "cm/mode/css/css.js",
			"cm/mode/clike/clike.js", "cm/mode/php/php.js", "cm/mode/htmlmixed/htmlmixed.js",
			"keymap.sublime.js", "cm/addon/dialog/dialog.js", "cm/addon/search/search.js",
			"cm/addon/hint/show-hint.js", "cm/addon/hint/php-hint.js",
			"cm/addon/hint/php-sc7-hint.js", "cm/addon/hint/php-sc8-hint.js",
			"cm/addon/hint/anyword-hint.js", "cm/addon/selection/active-line.js",
			"cm/addon/edit/closebrackets.js", "cm/addon/fold/foldcode.js",
			"cm/addon/fold/foldgutter.js", "cm/addon/fold/brace-fold.js",
			"cm/addon/fold/xml-fold.js", "cm/addon/fold/comment-fold.js",
			"cm/addon/scroll/annotatescrollbar.js", "cm/addon/search/matchesonscrollbar.js",
			"cm/addon/search/searchcursor.js", "cm/addon/search/match-highlighter.js",
			"cm/addon/fold/indent-fold.js", "cm/addon/show-invisibles.js",
			"cm/addon/search/jump-to-line.js", "cm/addon/edit/matchbrackets.js",
			"cm/addon/comment/comment.js"
		];
		
		var processQueue = function(){
			var path = scriptQueue.shift();
			
			if(!path){
				callback && callback();
				return;
			}
			
			var script = document.createElement("script");
			
			script.onload = function(){
				setTimeout(processQueue, 10);
			};
			script.src = newEditorPath + "/" + path;
			
			document.body.appendChild(script);
		};
		
		processQueue();
	}
	
	function mountNewEditor(){
		newEditor = CodeMirror.fromTextArea($("#new-editor").get(0), {
			mode : "application/x-httpd-php-open",
			styleActiveLine: true,
			lineNumbers : true,
			indentUnit : 4,
			tabMode : "shift",
			autoCloseBrackets : true,
			enterMode : "keep",
			indentWithTabs : true,
			autofocus : true,
			foldGutter : true,
			gutters : ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "breakpoints"],
			highlightSelectionMatches : {
				annotateScrollbar : true
			},
			extraKeys : {
				"F11" : function(){
					$("#bt-fullscreen").trigger("click");
				},
				"Ctrl-Space" : "autocomplete",
				"Ctrl-Q": function(cm){
					cm.foldCode(cm.getCursor());
				}
			}
		});
		
		setTheme(newEditorConfig.theme);
		
		newEditor.addKeyMap(CodeMirror.keyMap.sublime);
		
		newEditor.on("gutterClick", function(cm, line, type, event){
			var isBreakpoint = event.target.classList.contains("breakpoints");
			isBreakpoint = isBreakpoint || event.target.classList.contains("breakpoint");
			
			if(isBreakpoint){
				newEditor.setCursor({line:line, ch:0});
				CodeMirror.commands.toggleBookmark(newEditor);
			}
		});
		
		$("#field-theme").val(newEditorConfig.theme);
	};
	
	function bindEvents(){
		(function(){
			var $btAttributesOriginal = window.parent.$(".toolbar_editor [onclick='nm_event_new_param()']");
			var $btAttributes = $("#bt-attributes");
			
			if(!$btAttributesOriginal.length){
				return;
			}
			
			$btAttributes
				.removeClass("display-none")
				.prop("title", $btAttributesOriginal.prop("title"))
				.click(function(){
					window.parent.nm_event_new_param && window.parent.nm_event_new_param();
				});
		})();
		
		$("#bt-fullscreen").click(function(){
			window.parent.toggleFullscreenEditing && window.parent.toggleFullscreenEditing();
		});
		
		$("#bt-search").click(function(){
			CodeMirror.commands.find(newEditor);
		});
		
		$("#bt-replace").click(function(){
			CodeMirror.commands.replaceAll(newEditor);
		});
		
		$("#bt-help, #bt-key-bindings").click(function(){
			var helpWindow = window.open();
			fetch(getNewEditorPath() + "../../../pages/key_bindings/index.html").then(function(response){
				response.text().then(function(content){
					helpWindow.document.write(content);
				});
			});
		});
		
		$("#field-theme").change(function(){
			setTheme(this.value);
		});
	};
	
	function setTheme(theme){
		newEditor.setOption("theme", theme);
		
		newEditorConfig.theme = theme;
		saveNewEditorConfig();
		
		var showInvisibles = theme == "sublime-text-detailed";
		newEditor.setOption("showInvisibles", showInvisibles);
		
		var isSublimeTextTheme = theme.match(/^sublime-text/i);
		newEditor.setOption("matchBrackets", isSublimeTextTheme);
	}
	
	function saveNewEditorConfig(){
		var config = JSON.stringify(newEditorConfig);
		localStorage.setItem("sctNewEditorConfig", config);
	}
	
	function loadNewEditorConfig(){
		var savedConfig = JSON.parse(localStorage.getItem("sctNewEditorConfig") || "{}");
		newEditorConfig = $.extend(newEditorDefaultConfig, savedConfig);
	}
	
	function execWhenEditorLoadedCallback(){
		whenEditorLoadedCallback(newEditor);
	}
	
	loadScripts(function(){
		loadNewEditorConfig();
		mountNewEditor();
		bindEvents();
		execWhenEditorLoadedCallback();
	});
})();