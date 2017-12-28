"use strict";

(function(){
	var fn = {
		addTabShortcut : function(){
			var scriptCaseVersion = window.getScriptCaseVersion();
			
			window.appendScript(document, function(scriptCaseVersion){
				var style = [
					".sctTabShortcut{",
						"vertical-align:top!important;display:inline-block!important;",
						"padding:0!important;margin-left:5px!important;",
					"}"
				];
				
				if(scriptCaseVersion == 9){
					style.push([
						".nmScroll ul li.nmAbaAppOn, .nmScroll ul li.nmAbaAppOn:hover{",
							"background:#FFF9C5!important;border-top:2px solid #007EFF;",
						"}"
					].join(""));
				}else if(scriptCaseVersion == 8){
					style.push("#id_div_scroll .nmAbaAppOn span{color:#E2F300!important;}");
				}else if(scriptCaseVersion == 7){
					style.push(".nmAbaApp .nmAbaAppOn span{color:#005DEC!important;}");
				}
				
				$("head").append("<style type='text/css'>" + style.join("") + "</style>");
			}, scriptCaseVersion);
			
			var selector = scriptCaseVersion == 7 ? "ol.nmAbaApp" : "#id_div_scroll > ul";
			var nmTabContainer = window.document.querySelector(selector);
			
			var _syncTabShortcuts = function(){
				var tabs = nmTabContainer.querySelectorAll(":scope > [id^='sys_aba_']");
				try{
					for(var x = 0; x < tabs.length && x < 9; x++){
						var tab = tabs[x];
						var tabShortcutNumber = x+1;
						
						var shortcutText = tab.querySelector(".sctTabShortcut");
						
						if(!shortcutText){
							shortcutText = document.createElement("span");
							shortcutText.classList.add("sctTabShortcut");
						}
						
						var dataTabShortcutNumber = tab.getAttribute("data-tabshortcutnumber");
						if(dataTabShortcutNumber){
							tabShortcutNumber = dataTabShortcutNumber;
						}else{
							var tabTitle = "[ScriptCase Tools] Press ALT+" + tabShortcutNumber + " to switch to this tab";
							tab.setAttribute("title", tabTitle);
							tab.setAttribute("data-tabshortcutnumber", tabShortcutNumber);
						}
						
						shortcutText.innerText = " [" + tabShortcutNumber + "]";
						
						var tabText = tab.querySelector(".nmAbaAppText,.nmAbaAppTextNoClose");
						tabText && tabText.append(shortcutText);
					}
				}catch(ex){
					console.warn(ex);
				}
				
				setTimeout(_syncTabShortcuts, 300);
			};
			
			_syncTabShortcuts();
		},
		
		fireTabShortcut : function(shortcutNumber){
			var homeTab = window.findElement("#sys_aba_home_title");
			var inputToFocus;
			
			if(!homeTab){
				return;
			}
			
			var _fireTabShortcut = function(){
				var selectedTab = homeTab.ownerDocument
					.querySelector("[data-tabshortcutnumber='" + shortcutNumber + "']");
				
				if(!selectedTab || selectedTab.style.display == "none"){
					return;
				}
				
				if(selectedTab.classList.contains("nmAbaAppOn")){
					return;
				}
				
				var clickableElement = selectedTab.querySelector(".nmAbaAppText");
				
				if(selectedTab.id == "sys_aba_home"){
					clickableElement = selectedTab;
				}
				
				clickableElement.getAttribute("onclick") && clickableElement.click();
				
				clearInterval(sessionStorage.getItem("sctIntervalInputToFocus"));
				var sctIntervalInputToFocus = setInterval(function(){
					if(inputToFocus){
						inputToFocus.value = "";
						inputToFocus.focus();
					}
					
					clearInterval(sessionStorage.getItem("sctIntervalInputToFocus"));
				}, 100);
				sessionStorage.setItem("sctIntervalInputToFocus", sctIntervalInputToFocus);
			};
			
			// this hidden input is used to put focus after a tab shortcut is
			// pressed, otherwise Firefox would stop firing the keydown event until an
			// element is clicked (WHY???????)
			(function addHiddenInputToFocus(){
				var documentForInputToFocus = window.findElement("#nmFrmScase").ownerDocument;
				inputToFocus = documentForInputToFocus.querySelector("#inputToFocusTabShortcut");
				
				if(inputToFocus){
					return;
				}
				
				inputToFocus = documentForInputToFocus.createElement("input");
				inputToFocus.setAttribute("id", "inputToFocusTabShortcut");
				inputToFocus.setAttribute("type", "text");
				inputToFocus.style.position = "absolute";
				inputToFocus.style.top = "-999px";
				inputToFocus.style.left = "-999px";
				inputToFocus.style.width = "1px";
				inputToFocus.style.height = "1px";
				inputToFocus.style.opacity = "0";
				documentForInputToFocus.body.appendChild(inputToFocus);
			})();
			
			// ensure _fireTabShortcut doesn't run multiple times in a small interval
			if(window.fireTabShortcutTimeout){
				return;
			}
			
			window.fireTabShortcutTimeout = true;
			_fireTabShortcut();
			setTimeout(function(){
				window.fireTabShortcutTimeout = false;
			}, 300);
		}
	};
	
	window.loadSettingsFromBackgroundPage(function(sctSettings){
		if(!sctSettings || !sctSettings.extEnabled || !sctSettings.enableTabShortcuts){
			return;
		}
		
		// keydown event should be added in all documents so shortcut can work anywhere
		document.addEventListener("keydown", function(evt){
			if(evt.altKey && !evt.ctrlKey && !evt.shiftKey && window.getNumericKeyFromKeyCode(evt.keyCode)){
				fn.fireTabShortcut(window.getNumericKeyFromKeyCode(evt.keyCode));
				evt.preventDefault();
				evt.stopPropagation();
				return false;
			}
		}, true);
		
		if(window.isPage("devel/iface/main.php")){
			fn.addTabShortcut();
		}
	});
})();