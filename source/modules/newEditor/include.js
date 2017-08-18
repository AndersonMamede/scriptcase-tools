"use strict";

(function(){
	// Chrome uses "chrome";
	// although Firefox can also use "chrome", we should
	// be better of using the generic "browser"
	var browser = browser || chrome;
	
	var editorIdentifier = null;
	var newEditorPath = browser.extension.getURL("modules/newEditor");
	
	var includeNewEditor = function(sctSettings, content){
		window.appendScript(document, function(
			sctSettings, editorIdentifier, newEditorPath, content, isPageStr,
			findElementStr, getScriptCaseVersionStr, getTopWindowStr, getDocumentListStr
		){
			if(typeof editor == "undefined"){
				return;
			}
			
			eval([
				"var fn = {",
					"isPage : (" + isPageStr + "),",
					"getTopWindow : (" + getTopWindowStr + "),",
					"getDocumentList : (" + getDocumentListStr + "),",
					"findElement : (" + findElementStr + "),",
					"getScriptCaseVersion : (" + getScriptCaseVersionStr + ")",
				"};",
			].join("\n"));
			
			// "throttle" technique
			// used to limit how many times a function can run in an interval
			window.throttleTimeout = {};
			var _throttle = function(id, time, fn){
				clearTimeout(window.throttleTimeout[id]);
				window.throttleTimeout[id] = setTimeout(fn, time);
			};
			
			var getEditorIdentifier = function(){
				if(fn.isPage("app_template.php")){
					var tplName = fn.findElement(".tpl_name.vista");
					return tplName ? tplName.id : "";
				}else{
					return editorIdentifier;
				}
			};
			
			var _bindSyncEvent = function(currentEditor, newEditor){
				var syncNewEditorWithCurrentEditor = syncCurrentEditorWithNewEditor = true;
				
				if(typeof currentEditor.on == "function"){
					currentEditor.on("focus", function(){
						if(syncNewEditorWithCurrentEditor){
							var cursor = currentEditor.getCursor();
							newEditor.setCursor(cursor.line, cursor.ch);
							newEditor.focus();
						}
					});
					
					currentEditor.on("cursorActivity", function(){
						if(syncNewEditorWithCurrentEditor){
							var cursor = currentEditor.getCursor();
							newEditor.setCursor(cursor.line, cursor.ch);
						}
					});
					
					currentEditor.on("change", function(){
						syncCurrentEditorWithNewEditor = false;
						if(syncNewEditorWithCurrentEditor){
							newEditor.setValue(currentEditor.getValue());
							setTimeout(function(){
								newEditor.refresh();
							}, 10);
						}
						syncCurrentEditorWithNewEditor = true;
					});
				}else{
					// old versions of CodeMirror use "setOption" to bind events and
					// accept only 1 callback for each instance
					
					var originalOnFocus = currentEditor.getOption("onFocus");
					currentEditor.setOption("onFocus", function(){
						originalOnFocus && originalOnFocus();
						if(syncNewEditorWithCurrentEditor){
							var cursor = currentEditor.getCursor();
							newEditor.setCursor(cursor.line, cursor.ch);
							newEditor.focus();
							newEditor.refresh();
						}
					});
					
					var originalOnCursorActivity = currentEditor.getOption("onCursorActivity");
					currentEditor.setOption("onCursorActivity", function(){
						originalOnCursorActivity && originalOnCursorActivity();
						if(syncNewEditorWithCurrentEditor){
							var cursor = currentEditor.getCursor();
							newEditor.setCursor(cursor.line, cursor.ch);
							newEditor.refresh();
						}
					});
					
					var originalOnChange = currentEditor.getOption("onChange");
					currentEditor.setOption("onChange", function(){
						syncCurrentEditorWithNewEditor = false;
						originalOnChange && originalOnChange();
						if(syncNewEditorWithCurrentEditor){
							newEditor.setValue(currentEditor.getValue());
							setTimeout(function(){
								newEditor.refresh();
							}, 10);
						}
						syncCurrentEditorWithNewEditor = true;
					});
				}
				
				newEditor.on("change", function(cm, changeObj){
					_throttle("newEditor-syncChanges", 50, function(){
						var marks = cm.getAllSublimeBookmarks();
						
						marks.forEach(function(mark){
							var pos = mark.find();
							
							if(!pos.to){
								pos.to = pos.from;
							}
							
							for(var lineNo = pos.from.line; lineNo <= pos.to.line; lineNo++){
								var gutterMarkers = newEditor.lineInfo(lineNo).gutterMarkers;
								if(gutterMarkers && gutterMarkers.breakpoints){
									continue;
								}
								cm.addBreakpoint(lineNo);
							}
						});
						
						newEditor.getCodeMirrorPlugin().signal(newEditor, "editorStateChanged");
					});
				});
				
				newEditor.on("cursorActivity", function(){
					syncNewEditorWithCurrentEditor = false;
					var cursor = newEditor.getCursor();
					currentEditor.setCursor(cursor.line, cursor.ch);
					syncNewEditorWithCurrentEditor = true;
				});
				
				newEditor.on("scroll", function(){
					var scrollInfo = newEditor.getScrollInfo();
					currentEditor.scrollTo(
						scrollInfo.x || scrollInfo.left || 0,
						scrollInfo.y || scrollInfo.top || 0
					);
					
					var editorTextarea = window.$(".CodeMirror textarea").get(0);
					_throttle("requestSaveCursor", 50, function(){
						editorTextarea.dispatchEvent(new CustomEvent("requestSaveCursor"));
					});
				});
				
				newEditor.on("change", function(editor, change){
					syncNewEditorWithCurrentEditor = false;
					if(syncCurrentEditorWithNewEditor){
						var textIsArray = change.text != "string" && change.text.length && typeof change.text.join != "undefined";
						var text = textIsArray ? change.text.join("\n") : change.text;
						currentEditor.replaceRange(text, change.from, change.to);
					}
					syncNewEditorWithCurrentEditor = true;
				});
				
				(function(){
					var saveNewEditorState = function(event){
						var _saveState = function(type, data){
							try{
								var savedEditorState = JSON.parse(localStorage.getItem("sctNewEditorState") || "{}");
								
								if(typeof savedEditorState[type] == "undefined"){
									savedEditorState[type] = {};
								}
								
								if(data && data.length){
									savedEditorState[type][getEditorIdentifier()] = data;
								}else{
									delete savedEditorState[type][getEditorIdentifier()];
								}
								
								localStorage.setItem("sctNewEditorState", JSON.stringify(savedEditorState));
							}catch(ex){
								// reset sctNewEditorState to start saving again
								localStorage.setItem("sctNewEditorState", "{}");
							}
						};
						
						var _saveSublimeBookmarks = function(){
							_throttle("saveSublimeBookmarks", 100, function(){
								var data = [];
								newEditor.getAllSublimeBookmarks().forEach(function(mark){
									data.push(mark.find());
								});
								_saveState("sublimeBookmarks", data);
							});
						};
						
						var _saveFold = function(){
							_throttle("saveFold", 100, function(){
								var data = [];
								newEditor.getAllFoldMarks().forEach(function(mark){
									data.push(mark.find());
								});
								_saveState("fold", data);
							});
						};
						
						switch(event){
							case "sublimeBookmarksChanged":
								_saveSublimeBookmarks();
							break;
							case "fold":
							case "unfold":
								_saveFold();
							break;
							case "editorStateChanged":
								_saveSublimeBookmarks();
								_saveFold();
							break;
						}
					};
					
					newEditor.on("loadNewEditorState", function(){
						_loadNewEditorState(newEditor);
					});
					
					var events = ["editorStateChanged", "sublimeBookmarksChanged", "fold", "unfold"];
					events.forEach(function(event){
						newEditor.on(event, function(){
							saveNewEditorState(event);
						});
					});
				})();
			};
			
			var _loadNewEditorState = function(newEditor){
				var editorState = JSON.parse(localStorage.getItem("sctNewEditorState") || "{}");
				
				var sublimeBookmarks = editorState.sublimeBookmarks && editorState.sublimeBookmarks[getEditorIdentifier()];
				if(sublimeBookmarks && sublimeBookmarks.length){
					sublimeBookmarks.forEach(function(pos){
						if(!pos.to){
							pos.to = pos.from;
						}
						
						newEditor.markText(pos.from, pos.to, {
							sublimeBookmark : true,
							clearWhenEmpty : false
						}, true);
						
						for(var lineNo = pos.from.line; lineNo <= pos.to.line; lineNo++){
							newEditor.addBreakpoint(lineNo);
						}
					});
				}
				
				var fold = editorState.fold && editorState.fold[getEditorIdentifier()];
				if(fold && fold.length){
					fold.forEach(function(pos){
						newEditor.foldCode(pos.from.line);
					});
				}
			};
			
			var _addEditor = function(){
				var $frameContainer = $("#id_div_code");
				
				var isAjaxEventsPage = fn.isPage("event.php") && $("[name='str_campos_param_list'").length;
				
				if(fn.isPage("app_template.php")){
					$frameContainer = $("#tab-1");
				}
				
				// toggleEditor is a function (native in ScriptCase) used to show/hide the menu on the right side
				if(typeof window.toggleEditor == "function"){
					var _toggleEditor = window.toggleEditor;
					window.toggleEditor = function(str_option){
						document.body.style.overflow = str_option == "close" ? "hidden" : "";
						_toggleEditor(str_option);
					};
					
					if($("#id_precodes").is(":visible")){
						document.body.style.overflow = "";
					}else{
						if(isAjaxEventsPage && fn.getScriptCaseVersion() == 7){ // "Ajax Events"
							// in "Ajax Events" for ScriptCase 7 there must be a vertical scroll
							// because it has 2 blocks and the second one has to be visible all
							// the time (it's the "Parameters (Fields)"" block) but there's a bug:
							// when user collapses one of the blocks, both blocks are collapsed so
							// the only way to see the second block is scrolling down
							document.body.style.overflowX = "hidden";
						}else if(!fn.isPage(["app_template.php", "button.php"])){
							// app_template.php => menu Layout -> Templates HTML
							// the height of 'Templates HTML' page defined by ScriptCase is wrong, so
							// it requires the scrollbar to show a full visible page of code
							document.body.style.overflow = "hidden";
						}
					}
				}
				
				// the "Ajax Events" page is divided into 2 blocks: one for code editor and another one for
				// "Parameters (Fields)" so the new editor can't cover the entire body, otherwise the
				// "Parameters (Fields)" would be hidden
				if(isAjaxEventsPage){
					var _nm_toggle_table = window.nm_toggle_table;
					window.nm_toggle_table = function(t, id){
						// the id "_form_tab_block" is used more than one time but only the first "#_form_tab_block"
						// should be intercepted
						if($(t).closest("#_form_tab_block").get(0) == $("[id='_form_tab_block']").get(0)){
							if($(t).hasClass("expand")){
								$(editorFrame).show();
							}else{
								$(editorFrame).hide();
							}
						}
						
						_nm_toggle_table(t, id);
					};
				}
				
				var editorFrame = document.createElement("iframe");
				editorFrame.id = "newEditorFrame";
				editorFrame.frameBorder = 0;
				editorFrame.style.boxSizing = "border-box";
				editorFrame.style.position = "absolute";
				editorFrame.style.top = 0;
				editorFrame.style.marginTop = "26px";
				editorFrame.style.paddingBottom = isAjaxEventsPage ? "50px" : "26px";
				editorFrame.style.left = 0;
				editorFrame.style.height = "100%";
				editorFrame.style.opacity = 0.1;
				
				// z-index can't be too high, otherwise it'll be in front of some
				// modal boxes (e.g., the modal to create a new template in
				// Templates HTML)
				editorFrame.style.zIndex = 2000;
				
				if(fn.isPage(["nm_edit_php_edit.php", "app_template.php"])){
					editorFrame.style.marginTop = "51px";
					editorFrame.style.paddingBottom = "51px";
				}else if(fn.isPage("button.php")){
					var tdCode = document.getElementById("id_td_code");
					var tableTdCode = tdCode.parentElement.parentElement.parentElement; // table > tbody > tr
					var firstTr = tableTdCode.querySelector("tr");
					editorFrame.style.marginTop = tableTdCode.offsetTop + "px";
				}
				
				editorFrame.style.width = $frameContainer.width() + "px";
				setInterval(function syncEditorWidth(){
					editorFrame.style.width = $frameContainer.width() + "px";
				}, 50);
				
				if(fn.isPage("app_template.php")){
					editorFrame.style.marginLeft = "19px";
					editorFrame.style.paddingBottom = "66px";
					$frameContainer.append(editorFrame);
				}else{
					document.body.appendChild(editorFrame);
				}
				
				// append the newEditorPath in src, so the appended script can access it
				var script = editorFrame.contentWindow.document.createElement("script");
				script.src = newEditorPath + "/index.js#" + newEditorPath;
				script.onload = function(){
					editorFrame.contentWindow.whenEditorLoaded(function(newEditor){
						if(sctSettings.NE_enableLineWrapping){
							newEditor.setOption("lineWrapping", true);
						}else{
							newEditor.setOption("lineWrapping", false);
						}
						
						// set value, load editor's state and clear history to
						// prevent ctrl+z resetting the initial code
						newEditor.setValue(window.editor.getValue());
						
						_loadNewEditorState(newEditor);
						
						newEditor.clearHistory();
						newEditor.refresh();
						newEditor.focus();
						
						var cursor = window.editor.getCursor();
						newEditor.setCursor(cursor.line, cursor.ch);
						
						var scrollInfo = window.editor.getScrollInfo();
						newEditor.scrollTo(
							scrollInfo.x || scrollInfo.left || 0,
							scrollInfo.y || scrollInfo.top || 0
						);
						
						_bindSyncEvent(window.editor, newEditor);
					});
				};
				
				// "index.html" is an empty html document inside SC;
				// it's being used as editorFrame's src, so editorFrame
				// can use page_tools.js (and its shortcut keys)
				editorFrame.src = "index.html";
				
				editorFrame.onload = function(){
					editorFrame.contentWindow.document.body.innerHTML = content;
					editorFrame.contentWindow.document.body.appendChild(script);
					editorFrame.style.opacity = 1;
					setTimeout(function(){
						editorFrame.contentWindow.document.body.classList.add("ready");
					}, 300);
				};
			};
			
			_addEditor();
		},
		sctSettings, editorIdentifier, newEditorPath, content, window.isPage,
		window.findElement, window.getScriptCaseVersion, window.getTopWindow, window.getDocumentList);
	};
	
	window.loadSettingsFromBackgroundPage(function(sctSettings){
		if(!sctSettings || !sctSettings.extEnabled || !sctSettings.useNewEditor){
			window.appendScript(document, function(newEditorPath, content){
				$("html,body").addClass("useOriginalEditor");
			});
			return;
		}
		
		editorIdentifier = window.getEditorIdentifier();
		
		fetch(newEditorPath + "/index.html").then(function(response){
			response.text().then(function(content){
				content = content.replace(/__NEW_EDITOR_PATH__/g, newEditorPath);
				includeNewEditor(sctSettings, content);
			});
		});
	});
})();