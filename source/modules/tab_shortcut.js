"use strict";

(function(){
	return; // módulo desabilitado temporariamente para usar normalmente o SC9
	
	// firefox continua com problema...
	
	var fn = {
		addTabShortcut : function(){
			window.appendScript(document, function(){
				$("head").append([
					"<style type='text/css'>",
						"#id_div_scroll .nmAbaAppOn span{color:#E2F300!important;}",
						".nmAbaApp .nmAbaAppOn span{color:#005DEC!important;}",
						".tabShortcut{vertical-align:top!important;}",
					"</style>"
				].join(""));
			});
			
			// "#id_div_scroll > ul" for SC8;
			// "ol.nmAbaApp" for SC7
			var nmTabContainer = window.document.querySelector("#id_div_scroll > ul, ol.nmAbaApp");
			
			var _syncTabShortcuts = function(){
				var tabs = nmTabContainer.querySelectorAll(":scope > [id^='sys_aba_']");
				try{
					for(var x = 0; x < tabs.length && x < 9; x++){
						var tab = tabs[x];
						var tabShortcutNumber = x+1;
						
						var shortcutText = tab.querySelector(".tabShortcut");
						
						if(!shortcutText){
							shortcutText = document.createElement("span");
							shortcutText.classList.add("tabShortcut");
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
					if(window.isGeneratingApp()){
						return;
					}
					
					if(inputToFocus){
						inputToFocus.value = "";
						inputToFocus.focus();
					}
					
					clearInterval(sessionStorage.getItem("sctIntervalInputToFocus"));
				}, 100);
				sessionStorage.setItem("sctIntervalInputToFocus", sctIntervalInputToFocus);
			};
			
			// this hidden input is used to receive the focus after a tab shortcut is
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
				inputToFocus.style.width = "0px";
				inputToFocus.style.height = "0px";
				documentForInputToFocus.body.appendChild(inputToFocus);
			})();
			
			if(window.fireTabShortcutTimeout){
				return;
			}
			
			// ensure _fireTabShortcut doesn't run multiple times in a small interval
			window.fireTabShortcutTimeout = true;
			_fireTabShortcut();
			setTimeout(function(){
				window.fireTabShortcutTimeout = false;
			}, 300);
		}
	};
	
	// keydown event should be added in all documents
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
})();