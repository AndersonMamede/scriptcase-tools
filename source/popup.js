"use strict";

document.addEventListener("DOMContentLoaded", function(){
	var availableShortcutKeys = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"];
	
	var fn = {
		init : function(){
			fn.loadSettings();
			fn.bindEvents();
		},
		
		// load saved settings to popup fields
		loadSettings : function(){
			chrome.runtime.sendMessage({command:"getSettings"}, function(settings){
				fn.loadSettingsToFields(settings);
			});
		},
		
		loadSettingsToFields : function(data){
			document.querySelector("#extEnabled").checked = data.extEnabled;
			document.querySelector("#disableHoverOnMainMenu").checked = data.disableHoverOnMainMenu;
			document.querySelector("#useShortcutKeys").checked = data.useShortcutKeys;
			document.querySelector("#keyMacroDoc").value = data.keyMacroDoc;
			document.querySelector("#keySaveApp").value = data.keySaveApp;
			document.querySelector("#keyFocusEditor").value = data.keyFocusEditor;
			document.querySelector("#keyGenerateSource").value = data.keyGenerateSource;
			document.querySelector("#keyRunApp").value = data.keyRunApp;
			document.querySelector("#keyToggleEditorFullscreen").value = data.keyToggleEditorFullscreen;
			document.querySelector("#loadCursorBack").checked = data.loadCursorBack;
			document.querySelector("#changeEditorFullscreen").checked = data.changeEditorFullscreen;
			document.querySelector("#useShortcutKeys").dispatchEvent(new Event("change"));
		},
		
		getSettingsFromFields : function(){
			var newSettings = {
				extEnabled : document.querySelector("#extEnabled").checked,
				disableHoverOnMainMenu : document.querySelector("#disableHoverOnMainMenu").checked,
				useShortcutKeys : document.querySelector("#useShortcutKeys").checked,
				keyMacroDoc : document.querySelector("#keyMacroDoc").value.trim(),
				keySaveApp : document.querySelector("#keySaveApp").value.trim(),
				keyFocusEditor : document.querySelector("#keyFocusEditor").value.trim(),
				keyGenerateSource : document.querySelector("#keyGenerateSource").value.trim(),
				keyRunApp : document.querySelector("#keyRunApp").value.trim(),
				keyToggleEditorFullscreen : document.querySelector("#keyToggleEditorFullscreen").value.trim(),
				loadCursorBack : document.querySelector("#loadCursorBack").checked,
				changeEditorFullscreen : document.querySelector("#changeEditorFullscreen").checked
			};
			
			return newSettings;
		},
		
		validateNewSettings : function(newSettings){
			var invalidFields = [];
			
			(function validateNewShortcutKeys(){
				var requestedShortcutKeys = {};
				requestedShortcutKeys[newSettings.keyMacroDoc] = document.querySelector("#keyMacroDoc + label").innerText;
				requestedShortcutKeys[newSettings.keySaveApp] = document.querySelector("#keySaveApp + label").innerText;
				requestedShortcutKeys[newSettings.keyFocusEditor] = document.querySelector("#keyFocusEditor + label").innerText;
				requestedShortcutKeys[newSettings.keyGenerateSource] = document.querySelector("#keyGenerateSource + label").innerText;
				requestedShortcutKeys[newSettings.keyRunApp] = document.querySelector("#keyRunApp + label").innerText;
				
				// object 'requestedShortcutKeys' should have one key for each
				// shortcut key input (minus toggle editor's fullscreen key because
				// its not changeable);
				var shortcutKeysLength = document.querySelectorAll(".shortcut-key").length - 1;
				var requestedShortcutKeysLength = Object.keys(requestedShortcutKeys).length;
				if(requestedShortcutKeysLength < (shortcutKeysLength)){
					// if it has less keys, than some of the shortcut keys are duplicated
					invalidFields.push("Duplicated shortcut key");
					return false;
				}else if(requestedShortcutKeysLength > (shortcutKeysLength)){
					invalidFields.push("Invalid shortcut keys");
					return false;
				}
				
				var invalidShortcutKeysMsg = [];
				for(var key in requestedShortcutKeys){
					if(key && availableShortcutKeys.indexOf(key) == -1){
						invalidShortcutKeysMsg.push("     * " + key + " -> " + requestedShortcutKeys[key]);
					}
				}
				
				if(invalidShortcutKeysMsg.length){
					invalidFields.push("Invalid shortcuts keys:\n" + invalidShortcutKeysMsg.join("\n"));
				}
			})();
			
			if(invalidFields.length){
				alert("Invalid field(s):\n\n- " + invalidFields.join(";\n- ") + ";");
				return false;
			}
			
			return true;
		},
		
		bindEvents : function(){
			Array.prototype.forEach.call(document.getElementsByClassName("help"), function(element){
				element.addEventListener("click", function(){
					var help = this.getAttribute("data-help").replace(/\\n/g, "\n");
					alert("[INFO]\n" + help);
				});
			});
			
			document.querySelector("#save-settings").addEventListener("click", function(){
				var button = this;
				
				button.blur();
				
				if(button.classList.contains("busy")){
					return;
				}
				
				var newSettings = fn.getSettingsFromFields();
				
				if(!fn.validateNewSettings(newSettings)){
					return;
				}
				
				button.classList.add("busy");
				
				chrome.runtime.sendMessage({
					command : "setSettings",
					newSettings : newSettings
				}, function(){
					// delay to give feedback to user
					setTimeout(function(){
						button.classList.add("done");
						setTimeout(function(){
							button.classList.remove("done", "busy");
							alert("Refresh the page or reload ScriptCase to apply new settings.");
						}, 800);
					}, 500);
				});
			});
			
			document.querySelector("#load-default-settings").addEventListener("click", function(){
				var button = this;
				
				button.blur();
				
				if(button.classList.contains("busy")){
					return;
				}
				
				button.classList.add("busy");
				
				chrome.runtime.sendMessage({command:"getDefaultSettings"}, function(defaultSettings){
					fn.loadSettingsToFields(defaultSettings);
					
					// delay to give feedback to user
					setTimeout(function(){
						button.classList.remove("busy");
					}, 300);
				});
			});
			
			(function toggleShortcutKeys(){
				var useShortcutKeys = document.querySelector("#useShortcutKeys");
				useShortcutKeys.addEventListener("change", function(){
					var active = this.checked;
					var container = document.querySelector(".shortcut-keys-container");
					
					if(active){
						container.classList.add("active");
					}else{
						container.classList.remove("active");
					}
					
					Array.prototype.forEach.call(container.getElementsByTagName("input"), function(input){
						input.disabled = !active;
					});
				});
			})();
			
			(function handleLabelClick(){
				Array.prototype.forEach.call(document.getElementsByTagName("label"), function(label){
					label.addEventListener("click", function(){
						var fieldContainer = this.closest(".field-container");
						var input = fieldContainer.getElementsByTagName("input")[0] || null;
						
						if(!input || !input.type || input.readOnly || input.disabled){
							return;
						}
						
						switch(input.type){
							case "text":
								// because extension popup doesn't focus the field when clicked on its label,
								// it had to be done manually
								input.focus();
							break;
							case "checkbox":
								input.checked = !input.checked;
								// fires the change event, so container ".shortcut-keys-container" can be updated
								input.dispatchEvent(new Event("change"));
							break;
						}
					});
				});
			})();
		}
	};
	
	fn.init();
});