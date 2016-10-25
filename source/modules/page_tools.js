"use strict";

(function(){
	// Chrome uses "chrome";
	// although Firefox can also use "chrome", we should
	// be better of using the generic "browser"
	var browser = browser || chrome;
	
	// user settings (set in extension's popup)
	var settings = null;
	
	var fn = {
		init : function(){
			fn.loadSettingsFromBackgroundPage(function(){
				if(!settings || !settings.extEnabled){
					return;
				}
				
				fn.bindEvents();
				
				if(settings.disableHoverOnMainMenu){
					fn.disableHoverOnMainMenu();
				}
				
				if(settings.disableEditorLineWrapping){
					fn.disableEditorLineWrapping();
				}
				
				if(settings.loadCursorBack){
					fn.controlEditorCursor();
				}
				
				if(settings.changeEditorFullscreen){
					fn.addToggleFullScreenEditor();
				}
				
				if(settings.useShortcutKeys){
					fn.enableShortcutKeys();
				}
				
				if(fn.isPage("iface/index.php")){
					fn.addGetScriptCaseVersion();
				}
				
				fn.focusFirstField();
			});
		},
		
		loadSettingsFromBackgroundPage : function(callback){
			browser.runtime.sendMessage({
				command : "getSettings"
			}, function(_settings){
				settings = _settings || null;
				callback && callback(settings);
			});
		},
		
		bindEvents : function(){
			browser.runtime.connect();
			
			window.addEventListener("message", function(event){
				var command = event && event.data && event.data.command;
				
				switch(event.data.command){
					case "saveCursorPosition":
						window.sctEditorCursorPosition.save(event.data);
					break;
					case "loadCursorPosition":
						window.sctEditorCursorPosition.load();
					break;
				}
			});
		},
		
		getScActiveTab : function(){
			return fn.findElement(".nmAbaAppOn");
		},
		
		getScActiveTabName : function(){
			var activeTab = fn.getScActiveTab();
			var element = activeTab && activeTab.querySelector(".nmAbaAppText,.nmAbaAppTextNoClose");
			return element && element.innerText.trim() || null;
		},
		
		getActiveDivCode : function(){
			var visibleFrmBot = fn.getVisibleFrmBot();
			
			if(!visibleFrmBot){
				return null;
			}
			
			return fn.findElement(
				"#id_div_code", true,
				fn.getDocumentList(visibleFrmBot.children[0].contentWindow)
			);
		},
		
		getProjectName : function(){
			var element = fn.findElement("#id_toolbar_codgrp");
			return element && element.innerText.trim() || null;
		},
		
		getCurrentEditorName : function(){
			var activeTab = fn.getScActiveTab() || {};
			if(activeTab.id == "sys_aba_home"){
				var nmFrmBotSys = fn.findElement("[name='nmFrmBotSys']");
				var isTemplateTab = nmFrmBotSys.contentWindow.location.href.indexOf("app_template.php") != -1;
				if(isTemplateTab){
					var tplName = fn.findElement(".tpl_name.vista");
					if(tplName && tplName.id){
						return tplName.id;
					}
				}
			}
			
			var fieldEventNome = document.querySelector("[name='event_nome']");
			if(fieldEventNome && fieldEventNome.value){
				return fieldEventNome.value;
			}
			
			var fieldEventTitle = document.querySelector("[name='event_title']");
			if(fieldEventTitle && fieldEventTitle.value){
				return fieldEventTitle.value;
			}
			
			// custom button
			if(fn.isPage("devel/iface/button.php")){
				var fieldButtonName = document.querySelector("[name='button_name']");
				if(fieldButtonName && fieldButtonName.value){
					return fieldButtonName.value;
				}
			}
			
			// internal libraries
			if(fn.isPage("devel/compat/nm_edit_php_edit.php")){
				var libType = (document.querySelector("form[name='nm_form_edit_php_list'] input[name='field_file']")||{}).value || "";
				var file = (document.querySelector("form[name='nm_form'] input[name='field_file']")||{}).value || "";
				return libType + "-" + file;
			}
			
			var visibleFrmBot = fn.getVisibleFrmBot();
			if(visibleFrmBot){
				var divCodeTitle = fn.findElement(
					"#id_div_code #span_tit_", true,
					fn.getDocumentList(visibleFrmBot.children[0].contentWindow)
				);
				if(divCodeTitle && divCodeTitle.innerText.trim()){
					return divCodeTitle.innerText.trim();
				}
			}
			
			return null;
		},
		
		createHashFromString : function(str){
			var hash = 0;
			
			if(str.length === 0){
				return hash;
			}
			
			var chr, len;
			for(var i = 0, len = str.length; i < len; i++){
				chr = str.charCodeAt(i);
				hash = ((hash << 5) - hash) + chr;
				hash |= 0; // Convert to 32bit integer
			}
			return hash;
		},
		
		// append a script with javascript code in a DOCUMENT
		// ps: doing this, the code's context changes (it runs
		// in the content script's context/sandbox);
		// arguments should be passed after the fnCode argument, e.g.:
		// appendScript(document, function(){...}, "A", "B")
		appendScript : function(_document, fnCode){
			var plainArgs = arguments;
			var fnArgsNormalized = "";
			
			if(typeof fnCode != "function"){
				throw "fnCode must be a function";
			}
			
			// copies variable 'plainArgs' as an array to be used in fnCode
			(function(){
				var fnArgs = [];
				
				// starts from key 2 because 0=_document and 1=fnCode (and
				// they're not necessary for the script content)
				for(var x = 2; x < plainArgs.length; x++){
					var arg = typeof plainArgs[x] == "function" ? plainArgs[x].toString() : plainArgs[x];
					fnArgs.push(arg);
				}
				
				if(fnArgs.length){
					fnArgsNormalized = JSON.stringify(fnArgs);
				}else{
					fnArgsNormalized = undefined;
				}
			})();
			
			var script = _document.createElement("script");
			script.innerHTML = "(" + fnCode.toString() + ").apply(window, " + fnArgsNormalized + ")";
			_document && _document.body && _document.body.appendChild(script);
		},
		
		disableHoverOnMainMenu : function(){
			fn.appendScript(document, function(){
				if(typeof $ != "function" || !$("#topnav").length){
					return;
				}
				
				var $topnav = $("#topnav");
				var $head = $("head");
				
				// the simplest way found to disable the default behavior (open menu when hover) is:
				// 1 - overwrite original ScriptCase's CSS to always hide the menu (made by $style)
				// 2 - and when user clicks in topnav, remove that piece of CSS code that was hiding the
				// menu, so menu is visible again (because of the hover on the topnav)
				// 3 - and when user leaves the topnav>li, add again the CSS to hide the menu (on hover)
				var $style = $([
					"<style type='text/css'>",
						"ul.topnav{display:none!important}",
						"li.active > ul.topnav{display:block!important}",
					"</style>"
				].join("")).appendTo($head);
				
				$topnav.on("click", "> li", function(){
					$style.remove();
				});
				
				$topnav.on("mouseleave", "> li", function(e){
					e.stopPropagation();
					$style.appendTo($head);
				});
			});
		},
		
		disableEditorLineWrapping : function(){
			fn.appendScript(document, function(){
				if(typeof editor == "undefined" || !editor.setOption){
					return;
				}
				
				editor.setOption("lineWrapping", false);
			});
		},
		
		addToggleFullScreenEditor : function(){
			fn.appendScript(document, function(){
				if(typeof toggleFullscreenEditing != "function"){
					return;
				}
				
				var $fullScreenButton = $(".toolbar_editor img[onclick^='toggleFullscreenEditing']");
				$fullScreenButton.prop("title", "Fullscreen (F11)");
				
				// wrapps the original function to add extra functionality
				toggleFullscreenEditing = (function(){
					var _original_toggleFullscreenEditing = toggleFullscreenEditing;
					
					return function(){
						var result = _original_toggleFullscreenEditing();
						var useFullScreen = $(".CodeMirror-scroll").hasClass("fullscreen");
						
						if(typeof window.parent.nm_toggle_left_layout == "function"){
							window.parent.nm_toggle_left_layout();
						}else{
							window.parent.$(".ui-layout-west")[useFullScreen ? "hide" : "show"]();
							
							// fix editor's scroll, as (for some reason) it was being hidden
							$(".CodeMirror-scroll").css("right", useFullScreen ? 10 : 0);
							$(".CodeMirror-scrollbar").css({
								position : useFullScreen ? "absolute" : "relative",
								right : 0,
								zIndex : 1
							});
						}
						
						return result;
					}
				})();
			});
		},
		
		prepareToControlEditorCursor : function(){
			// change ScriptCase's native ajax_set_show_app, so when an
			// application tab is clicked (or ajax_set_show_app is called),
			// the cursor/scroll is loaded
			if(fn.isPage("devel/iface/main.php")){
				fn.appendScript(document, function(){
					if(typeof ajax_set_show_app != "function"){
						return;
					}
					
					// wrapps the original function to add extra functionality
					ajax_set_show_app = (function(){
						var _original_ajax_set_show_app = ajax_set_show_app;
						
						return function(str_retorno){
							var result = _original_ajax_set_show_app(str_retorno);
							window.postMessage({command : "loadCursorPosition"}, "*");
							return result;
						};
					})();
				});
			}
			
			// change ScriptCase's native updatePreview, so when a
			// lib (Templates/Templates HTML) is loaded (or updatePreview is called),
			// the cursor/scroll is loaded
			if(fn.isPage("devel/iface/app_template.php")){
				var simulateSc8 = document.querySelector(".tpl_name.vista") === null;
				
				fn.appendScript(document, function(simulateSc8){
					if(typeof updatePreview != "function"){
						return;
					}
					
					updatePreview = (function(){
						var _original_updatePreview = updatePreview;
						return function(tpl){
							// SC7 must simulate SC8, otherwise it would need a very different code
							if(simulateSc8){
								$(".tpl_name.vista").removeClass("tpl_name vista");
								$("#" + window.template_now).addClass("tpl_name vista");
							}
							
							if($("#newEditorFrame").length){
								var newEditor = $("#newEditorFrame").get(0).contentWindow.newEditor;
								if(newEditor){
									newEditor.getCodeMirrorPlugin().signal(newEditor, "loadNewEditorState");
								}
							}
							
							var result = _original_updatePreview();
							window.postMessage({command : "loadCursorPosition"}, "*");
							return result;
						};
					})();
				}, simulateSc8);
			}
			
			fn.appendScript(document, function(){
				var _fnSendMessage = function(){
					var cursor = editor.getCursor();
					var scrollInfo = editor.getScrollInfo();
					window.postMessage({
						command : "saveCursorPosition",
						cursor : {
							ch : cursor.ch,
							line : cursor.line
						},
						scroll : {
							// depending on CodeMirror's version, it's x/y or left/top
							x : scrollInfo.x || scrollInfo.left || 0,
							y : scrollInfo.y || scrollInfo.top || 0
						}
					}, "*");
				};
				
				window.sendSaveCursorPositionMessage = function(useThrottle){
					useThrottle = typeof useThrottle === false ? false : true;
					
					if(!useThrottle){
						_fnSendMessage();
						return;
					}
					
					// js "throttle" technique
					// used to limit how many times the save message can be send in an interval
					if(window.sendSaveCursorPositionMessageTimeout){
						clearTimeout(window.sendSaveCursorPositionMessageTimeout);
						window.sendSaveCursorPositionMessageTimeout = null;
					}
					window.sendSaveCursorPositionMessageTimeout = setTimeout(_fnSendMessage, 100);
				};
			});
			
			// ps: 'sctEditorCursorPosition' was added in window because
			// it's also used by background.js
			window.sctEditorCursorPosition = {
				// make a request to save cursor position (communication made
				// between content script and web page)
				requestSave : function(){
					fn.appendScript(document, function(){
						window.sendSaveCursorPositionMessage();
					});
				},
				
				// store the current application's cursor position in localStorage
				save : function(info){
					var identifier = fn.getEditorIdentifier();
					
					var _store = function(identifier, data){
						var editorConfig = JSON.parse(localStorage.getItem("sctEditorConfig")) || {};
						editorConfig[identifier] = data;
						localStorage.setItem("sctEditorConfig", JSON.stringify(editorConfig));
					};
					
					try{
						_store(identifier, {
							cursor : info.cursor,
							scroll : info.scroll
						});
					}catch(ex){
						// reset sctEditorConfig to start saving again
						localStorage.setItem("sctEditorConfig", JSON.stringify({}));
						_store(identifier, {
							cursor : info.cursor,
							scroll : info.scroll
						});
					}
				},
				
				// load current application's cursor and scroll position
				// (from localStorage to editor)
				load : function(){
					var identifier = fn.getEditorIdentifier();
					var editorConfig = JSON.parse(localStorage.getItem("sctEditorConfig"));
					var divCode = fn.getActiveDivCode();
					
					if(!divCode){
						return;
					}
					
					fn.appendScript(divCode.ownerDocument, function(config, identifier){
						var $newEditorFrame = $("#newEditorFrame");
						var _editor = editor;
						
						// wait untill the iframe/editor is ready
						var maxLoop = 200;
						var currentLoop = 0;
						var intervalFindEditor = setInterval(function(){
							if($newEditorFrame.length){
								_editor = $newEditorFrame.get(0).contentWindow.newEditor;
							}
							
							if(_editor){
								clearInterval(intervalFindEditor);
								var _config = $.extend({
									cursor : {line : 0, ch : 0},
									scroll : {x : 0, y : 0}
								}, config || {});
								
								_editor.focus();
								_editor.setCursor(_config.cursor.line, _config.cursor.ch);
								_editor.scrollTo(_config.scroll.x, _config.scroll.y);
							}
							
							if(currentLoop >= maxLoop){
								clearInterval(intervalFindEditor);
							}
							
							currentLoop++;
						}, 50);
					}, (editorConfig && identifier !== null) ? editorConfig[identifier] : {}, identifier);
				}
			};
		},
		
		controlEditorCursor : function(){
			fn.prepareToControlEditorCursor();
			
			var editorContainer = document.querySelector(".CodeMirror");
			var editorTextarea = editorContainer && editorContainer.querySelector("textarea") || null;
			
			if(!editorContainer || !editorTextarea){
				return;
			}
			
			window.onbeforeunload = function(){
				window.sctEditorCursorPosition.requestSave();
			};
			
			editorTextarea.addEventListener("requestSaveCursor", function(){
				window.sctEditorCursorPosition.requestSave();
			});
			
			fn.appendScript(document, function(){
				if(editor.on){ // codemirror 3+
					editor.on("cursorActivity", window.sendSaveCursorPositionMessage);
					editor.on("scroll", window.sendSaveCursorPositionMessage);
				}else if(editor.setOption){ // codemirror 2...
					editor.setOption("onCursorActivity", window.sendSaveCursorPositionMessage);
					editor.setOption("onScroll", window.sendSaveCursorPositionMessage);
				}
			});
			
			// load cursor/scroll position on editor when DOCUMENT is loaded
			window.sctEditorCursorPosition.load();
		},
		
		enableShortcutKeys : function(){
			fn.prepareToUseShortcutKeys();
			
			// _getCommandKeys must return an object with this structure:
			// {KEY_CODE:"COMMAND_NAME", KEY_CODE:"COMMAND_NAME", ...}
			// ps: 'COMMAND_NAME' is the command that will be sent to background.js
			var commandKeys = (function _getCommandKeys(){
				var keyCodeList = {
					"F1" : 112, "F2" : 113, "F3" : 114, "F4" : 115, "F5" : 116,
					"F6" : 117, "F7" : 118, "F8" : 119, "F9" : 120, "F10" : 121,
					"F11" : 122, "F12" : 123
				};
				
				var keys = {};
				var commands = {
					macroDoc : "keyMacroDoc",
					saveApp : "keySaveApp",
					focusEditor : "keyFocusEditor",
					generateApp : "keyGenerateSource",
					runApp : "keyRunApp"
				};
				
				for(var command in commands){
					var key = settings[commands[command]];
					var keyCode = keyCodeList[key];
					
					if(key && keyCode){
						keys[keyCode] = command;
					}
				}
				
				return keys;
			}());
			
			var hasSpecialKeyPressed = function(evt){
				return evt.ctrlKey || evt.shiftKey || evt.altKey;
			};
			
			// specialKeyTimeout adds a delay after a special key is pressed, otherwise
			// the shotcut command would be fired because it all happens too fast
			var specialKeyTimeout = null;
			var specialKeyDelay = 300;
			
			document.addEventListener("keydown", function(evt){
				if(hasSpecialKeyPressed(evt)){
					specialKeyTimeout && clearTimeout(specialKeyTimeout);
					specialKeyTimeout = setTimeout(function(){
						specialKeyTimeout = null;
					}, specialKeyDelay);
					return;
				}
				
				if(commandKeys[evt.keyCode]){
					evt.preventDefault();
					evt.stopPropagation();
					return false;
				}
			});
			
			document.addEventListener("keyup", function(evt){
				if(hasSpecialKeyPressed(evt) || !commandKeys[evt.keyCode] || specialKeyTimeout){
					return;
				}
				
				fn.executeShortcutCommand(commandKeys[evt.keyCode]);
				
				evt.preventDefault();
				evt.stopPropagation();
				return false;
			});
		},
		
		executeShortcutCommand : function(command){
			switch(command){
				case "saveApp":
				case "generateApp":
				case "runApp":
					var buttonSelector = {
						saveApp : "#id_toolbar_app_save",
						generateApp : "#id_toolbar_app_generate",
						runApp : "#id_toolbar_app_run"
					};
					
					var button = fn.findElement(buttonSelector[command]);
					
					if(!button || button.getAttribute("disabled")){
						return;
					}
					
					// blur the active element to trigger its events (input, editor, etc)
					document.activeElement && document.activeElement.blur();
					
					button.click();
				break;
				case "focusEditor":
					sctEditorCursorPosition.load();
				break;
				case "macroDoc":
					var newEditorFrame = fn.findElement("#newEditorFrame");
					var editorDocument = newEditorFrame ? newEditorFrame.contentDocument : document;
					
					fn.appendScript(editorDocument, function(){
						var _editor = window.newEditor || window.editor;
						var text = (_editor && _editor.getSelection() || "").split("\n")[0];
						localStorage.setItem("sctEditorSelectedText", text);
					});
					
					var selectedText = localStorage.getItem("sctEditorSelectedText") || "";
					localStorage.removeItem("sctEditorSelectedText");
					fn.openMacroDoc(prompt("Macro:", selectedText));
				break;
			}
			
			if(command == "runApp"){
				// wait for the end of the process to focus editor
				var interval = setInterval(function(){
					if(button.getAttribute("processRunning") == "0"){
						clearInterval(interval);
						sctEditorCursorPosition.load();
					}
				}, 300);
			}
		},
		
		// return the top window object (usually 'scriptcase/devel/iface/index.php?rand=*')
		getTopWindow : function(){
			var topWindow = window;
			
			while(topWindow != topWindow.parent){
				topWindow = topWindow.parent;
			}
			
			return topWindow;
		},
		
		// return an array containing all document objects (recursively)
		getDocumentList : function(topWindow){
			var _getDocuments = function(_window){
				var _documents = [_window.document];
				
				for(var x = 0; x < _window.frames.length; x++){
					_documents = _documents.concat(_getDocuments(_window.frames[x]));
				}
				
				return _documents;
			};
			
			return _getDocuments(topWindow || fn.getTopWindow());
		},
		
		// return the visible div_frm_bot_* (the div element containing the application
		// options that is currently active)
		getVisibleFrmBot : function(){
			var frmBotList = fn.findElement("[id^=div_frm_bot_]", false) || [];
			var visibleFrmBot = null;
			
			frmBotList.some(function(_frmBot){
				if(_frmBot.style.display == ""){
					visibleFrmBot = _frmBot;
					return true;
				}
			});
			
			return visibleFrmBot && visibleFrmBot.children.length ? visibleFrmBot : null;
		},
		
		// search for elements in every document found within the (browser) tab
		findElement : function(selector, returnFirstElement, documentList){
			returnFirstElement = typeof returnFirstElement != "undefined" ? returnFirstElement : true;
			documentList = typeof documentList != "undefined" ? documentList : fn.getDocumentList();
			
			var elements = [];
			
			var done = documentList.some(function(_document){
				var elementsFound = _document.querySelectorAll(selector);
				
				for(var x = 0; x < elementsFound.length; x++){
					elements.push(elementsFound.item(x));
				}
				
				if(returnFirstElement && elementsFound.length){
					return true;
				}
			});
			
			return elements.length ? (returnFirstElement ? elements[0] : elements) : null;
		},
		
		prepareToUseShortcutKeys : function(){
			fn.appendScript(document, function(){
				// skip if the function 'nm_app_run' doesn't
				// exist (because this is the function where the changes are made)
				if(typeof nm_app_run != "function"){
					return;
				}
				
				// wrapp the original function to add extra functionality
				nm_app_run = (function(){
					var _original_nm_app_run = nm_app_run;
					
					return function(){
						var result = _original_nm_app_run();
						
						var $button = $("#id_toolbar_app_run");
						if($button.length){
							$button.get(0).setAttribute("processRunning", "1");
						}
						
						var $generateIndicator = $("#ul_generate_code");
						var interval = setInterval(function(){
							if($generateIndicator.get(0).style.display == "none"){
								clearInterval(interval);
								$button.get(0).setAttribute("processRunning", "0");
							}
						}, 50);
						
						// returns whatever the original function used to return
						return result;
					}
				})();
			});
		},
		
		openMacroDoc : function(macroName){
			if(!macroName || !macroName.length){
				return;
			}
			
			var topWindowUrl = fn.getTopWindow().location.href;
			var docUrl = topWindowUrl.replace(/devel\/iface\/.*/i, "");
			docUrl += "doc/manual_mp/28-Macros/00-macros_sc.htm#" + macroName;
			window.open(docUrl);
		},
		
		addGetScriptCaseVersion : function(){
			fn.appendScript(document, function(){
				var _returnVersion = function(detailedVersion){
					if(detailedVersion){
						return window.ScriptCaseVersion;
					}else{
						var version = window.ScriptCaseVersion.split(".");
						return version[0];
					}
				};
				
				window.getScriptCaseVersion = function(detailedVersion){
					if(window.ScriptCaseVersion){
						return _returnVersion(detailedVersion);
					}
					
					$("<div></div>").load("about.php", function(){
						var version = $(this).find(".nmText").eq(3).text();
						window.ScriptCaseVersion = version;
						return _returnVersion(detailedVersion);
					});
				};
				window.getScriptCaseVersion();
			});
		},
		
		getEditorIdentifier : function(){
			var projectName = fn.getProjectName();
			var activeTabName = fn.getScActiveTabName();
			var editorName = fn.getCurrentEditorName() || "";
			var identifier = [projectName, activeTabName, editorName].join("-")
			return fn.createHashFromString(identifier);
		},
		
		focusFirstField : function(){
			var _shouldFocusFirstFieldInThisPage = function(){
				return fn.isPage([
					"iface/app_add_field.php", // New field, New master/detail, (grid) Nested grid -> New Link
					"iface/app_add_block.php", // Create new block (layout)
					"iface/methods.php", // New PHP/JavaScript method
					"iface/button.php", // New button
					"iface/wiz_tab_lig.php", // New N-N relations
					"iface/app.php?field_app_section=attribute", // Programming -> Attributes
					"iface/rule_order.php", // (grid) New sorting rule
					"iface/rule_group.php" // (grid) New group by
				]);
			};
			
			if(!_shouldFocusFirstFieldInThisPage()){
				return
			}
			
			fn.appendScript(document, function(){
				$("input[type='text']:visible").first().focus();
			});
		},
		
		isPage : function(page){
			if(Array.isArray(page)){
				page = page.filter(function(value){
					return fn.isPage(value);
				});
				return page.length > 0;
			}
			
			if(typeof page == "string"){
				var currentUrl = window.location.href;
				return currentUrl.toLowerCase().indexOf(page.toLowerCase()) != -1;
			}
			
			return false;
		},
		
		exportFn : function(fnList){
			fnList.forEach(function(fnName){
				window[fnName] = fn[fnName];
			});
		}
	};
	
	fn.init();
	fn.exportFn([
		"appendScript", "loadSettingsFromBackgroundPage",
		"isPage", "findElement", "getEditorIdentifier",
		"getTopWindow", "getDocumentList"
	]);
})();