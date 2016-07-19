"use strict";

(function(){
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
				
				if(settings.loadCursorBack){
					fn.controlEditorCursor();
				}
				
				if(settings.changeEditorFullscreen){
					fn.addToggleFullScreenEditor();
				}
				
				if(settings.useShortcutKeys){
					fn.enableShortcutKeys();
				}
			});
		},
		
		// checks if current url matches the given address
		urlMatchesSc : function(address){
			return window.location.href.search(address) != -1;
		},
		
		loadSettingsFromBackgroundPage : function(callback){
			chrome.runtime.sendMessage({
				command : "getSettings"
			}, function(_settings){
				settings = _settings || null;
				callback && callback();
			});
		},
		
		bindEvents : function(){
			var port = chrome.runtime.connect();
			
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
		
		// returns the active tab in ScriptCase (like "Home" or an application)
		getActiveTab : function(){
			return fn.findElement(".nmAbaAppOn");
		},
		
		// returns the active/visible "#id_div_code" element
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
		
		// returns the name of the active tab in ScriptCase (like "Home" or an application)
		getActiveTabName : function(){
			var activeTab = fn.getActiveTab();
			var element = activeTab && activeTab.querySelector(".nmAbaAppText");
			return element && element.innerText.trim() || null;
		},
		
		// returns the name of the event currently being edited
		getCurrentEditorEventName : function(){
			var visibleFrmBot = fn.getVisibleFrmBot();
			
			if(!visibleFrmBot){
				return null;
			}
			
			var element = fn.findElement(
				"#id_div_code #span_tit_", true,
				fn.getDocumentList(visibleFrmBot.children[0].contentWindow)
			);
			
			return element && element.innerText.trim() || null;
		},
		
		// creates and appends a script with a js code in a DOCUMENT
		// ps: doing this, the code's context changes (it runs
		// in the content script's context/sandbox)
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
					fnArgs.push(plainArgs[x]);
				}
				
				if(fnArgs.length){
					fnArgsNormalized = JSON.stringify(fnArgs);
				}else{
					fnArgsNormalized = undefined;
				}
			})();
			
			var script = _document.createElement("script");
			script.innerHTML = "(" + fnCode.toString() + ").apply(window, " + fnArgsNormalized + ")";
			_document.body.appendChild(script);
		},
		
		// changes ScriptCase's main menu default behavior 'open when hover' to 'open when click'
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
		
		// changes the editor's default fullscreen option so it can collapses both left and right columns
		addToggleFullScreenEditor : function(){
			fn.appendScript(document, function(){
				// skip if the function 'toggleFullscreenEditing' doesn't
				// exist (because this is the function where the changes are made)
				if(typeof toggleFullscreenEditing != "function"){
					return;
				}
				
				// finds the editor's 'fullscreen toggle button'
				var $fullScreenButton = $(".toolbar_editor img[onclick^='toggleFullscreenEditing']");
				$fullScreenButton.prop("title", "Fullscreen (F11)");
				
				// wrapps the original function to add extra functionality
				toggleFullscreenEditing = (function(){
					var _original_toggleFullscreenEditing = toggleFullscreenEditing;
					
					return function(){
						var result = _original_toggleFullscreenEditing();
						var useFullScreen = $(".CodeMirror-scroll").hasClass("fullscreen");
						
						// hides the column in the left side of the editor
						window.parent.$(".ui-layout-west")[useFullScreen ? "hide" : "show"]();
						
						// fix editor's scroll, as (for some reason) it was being hidden
						$(".CodeMirror-scroll").css("right", useFullScreen ? 10 : 0);
						$(".CodeMirror-scrollbar").css({
							position : useFullScreen ? "absolute" : "relative",
							right : 0,
							zIndex : 1
						});
						
						// returns whatever the original function used to return
						return result;
					}
				})();
			});
		},
		
		// makes some changes on the page so cursor/scroll can be controlled when needed
		prepareToControlEditorCursor : function(){
			// changes ScriptCase's native ajax_set_show_app, so when user
			// clicks on an application tab (or ajax_set_show_app is called),
			// the cursor/scroll is loaded
			if(fn.urlMatchesSc("devel/iface/main.php")){
				fn.appendScript(document, function(){
					if(!ajax_set_show_app){
						return;
					}
					
					// wrapps the original function to add extra functionality
					ajax_set_show_app = (function(){
						var _original_ajax_set_show_app = ajax_set_show_app;
						
						return function(str_retorno){
							var result = _original_ajax_set_show_app(str_retorno);
							
							window.postMessage({command : "loadCursorPosition"}, "*");
							
							// returns whatever the original function used to return
							return result;
						};
					})();
				});
			}
			
			// ps: 'sctEditorCursorPosition' was added in window because
			// it's also used by background.js
			window.sctEditorCursorPosition = {
				// makes a request to save cursor position (communication made
				// between content script and web page)
				requestSave : function(){
					fn.appendScript(document, function(){
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
					});
				},
				
				// stores the current application's cursor position in localStorage
				save : function(info){
					var applicationName = fn.getActiveTabName();
					var editorEventName = fn.getCurrentEditorEventName() || "";
					var identifier = applicationName + "-" + editorEventName;
					
					if(!applicationName){
						return;
					}
					
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
						// resets localstorage if any error occurs
						// and starts saving again
						localStorage.setItem("sctEditorConfig", JSON.stringify({}));
						_store(identifier, {
							cursor : info.cursor,
							scroll : info.scroll
						});
					}
				},
				
				// loads current application's cursor and scroll position
				// (from localStorage to editor)
				load : function(){
					var applicationName = fn.getActiveTabName();
					var editorEventName = fn.getCurrentEditorEventName() || "";
					var identifier = applicationName + "-" + editorEventName;
					var editorConfig = JSON.parse(localStorage.getItem("sctEditorConfig"));
					
					var divCode = fn.getActiveDivCode();
					
					if(!divCode){
						return;
					}
					
					fn.appendScript(divCode.ownerDocument, function(config){
						if(!editor){
							return;
						}
						
						var _config = $.extend({
							cursor : {line : 0, ch : 0},
							scroll : {x : 0, y : 0}
						}, config || {});
						
						editor.setCursor(_config.cursor.line, _config.cursor.ch);
						editor.scrollTo(_config.scroll.x, _config.scroll.y);
						editor.focus();
					}, editorConfig ? editorConfig[identifier] : {});
				}
			};
		},
		
		// saves cursor position in editor and loads it back when a page is loaded
		controlEditorCursor : function(){
			fn.prepareToControlEditorCursor();
			
			var editorContainer = document.querySelector(".CodeMirror");
			var editorTextarea = editorContainer && editorContainer.querySelector("textarea") || null;
			
			if(!editorContainer || !editorTextarea){
				return;
			}
			
			// saves the cursor/scroll position before closing a DOCUMENT/page
			window.onbeforeunload = function(){
				window.sctEditorCursorPosition.requestSave();
			};
			
			// saves the cursor/scroll position when user leaves editor's field
			editorTextarea.addEventListener("blur", function(){
				window.sctEditorCursorPosition.requestSave();
			});
			
			// delays execution, so it runs after the settings were loaded
			setTimeout(function(){
				// loads the cursor/scroll position on the editor when DOCUMENT is loaded
				window.sctEditorCursorPosition.load();
			}, 10);
		},
		
		enableShortcutKeys : function(){
			fn.prepareToUseShortcutKeys();
			
			// _getCommandKeys must return an object with this structure:
			// {KEY_CODE:"COMMAND_NAME", KEY_CODE:"COMMAND_NAME", ...}
			// ps: 'COMMAND_NAME' is the command that will be sent to background.js
			var _getCommandKeys = function(){
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
			};
			
			var commandKeys = _getCommandKeys();
			
			// prevents browser's default behavior (if key is a shortcut key)
			document.addEventListener("keydown", function(evt){
				if(commandKeys[evt.keyCode]){
					evt.preventDefault();
					evt.stopPropagation();
					return false;
				}
			});
			
			// sends a message to background.js when user presses a
			// shortcut key (actually when user releases the shortcut key)
			document.addEventListener("keyup", function(evt){
				if(!commandKeys[evt.keyCode]){
					return;
				}
				
				fn.executeShortcutCommand(commandKeys[evt.keyCode]);
				
				evt.preventDefault();
				evt.stopPropagation();
				return false;
			});
		},
		
		// executes a shortcut command
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
					
					// blurs the active element to trigger its events (input, editor, etc)
					document.activeElement && document.activeElement.blur();
					
					button.click();
				break;
				case "focusEditor":
					sctEditorCursorPosition.load();
				break;
				case "macroDoc":
					fn.openMacroDoc(prompt("Inform the macro's name:"));
				break;
			}
			
			if(command == "runApp"){
				// waits the end of the process to focus editor
				var interval = setInterval(function(){
					if(button.getAttribute("processRunning") == "0"){
						clearInterval(interval);
						sctEditorCursorPosition.load();
					}
				}, 300);
			}
		},
		
		// returns the (global) top window (usually 'scriptcase/devel/iface/index.php?rand=*')
		getTopWindow : function(){
			var topWindow = window;
			
			while(topWindow != topWindow.parent){
				topWindow = topWindow.parent;
			}
			
			return topWindow;
		},
		
		// returns an array containing all DOCUMENT elements in a chrome tab (recursive)
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
		
		// returns the visible div_frm_bot_* (the div element containing the application
		// options that is currently active)
		getVisibleFrmBot : function(){
			var frmBotList = fn.findElement("[id^=div_frm_bot_]", false);
			var visibleFrmBot = null;
			
			frmBotList.some(function(_frmBot){
				if(_frmBot.style.display == ""){
					visibleFrmBot = _frmBot;
					return true;
				}
			});
			
			return visibleFrmBot && visibleFrmBot.children.length ? visibleFrmBot : null;
		},
		
		// searches for elements in every DOCUMENT found within the (chrome) tab (including iframes);
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
		
		// makes some changes on the page to use shortcut keys
		prepareToUseShortcutKeys : function(){
			fn.appendScript(document, function(){
				// skip if the function 'nm_app_run' doesn't
				// exist (because this is the function where the changes are made)
				if(typeof nm_app_run != "function"){
					return;
				}
				
				// wrapps the original function to add extra functionality
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
		
		// opens macro's documentation page
		openMacroDoc : function(macroName){
			if(!macroName || !macroName.length){
				return;
			}
			
			var topWindowUrl = fn.getTopWindow().location.href;
			var docUrl = topWindowUrl.replace(/devel\/iface\/.*/i, "");
			docUrl += "doc/manual_mp/28-Macros/00-macros_sc.htm#" + macroName;
			window.open(docUrl);
		}
	};
	
	fn.init();
})();