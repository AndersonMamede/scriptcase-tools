"use strict";

(function(){
	var defaultSettings = {
		"extEnabled" : true,
		"disableHoverOnMainMenu" : true,
		"disableEditorLineWrapping" : true,
		"useShortcutKeys" : true,
		"keyMacroDoc" : "F1",
		"keySaveApp" : "F2",
		"keyFocusEditor" : "F7",
		"keyGenerateSource" : "F8",
		"keyRunApp" : "F9",
		"keyToggleEditorFullscreen" : "F11",
		"loadCursorBack" : true,
		"changeEditorFullscreen" : true
	};
	
	var settings = null;
	
	var sctHelper = {
		createInitialSettings : function(){
			if(settings){
				return;
			}
			
			try{
				settings = JSON.parse(localStorage.getItem("sctSettings"));
			}catch(ex){}
			
			if(!settings){
				// make a copy of defaultSettings (defaultSettings should not be changed,
				// otherwise any change would be reflected to the original object)
				localStorage.setItem("sctSettings", JSON.stringify(sctHelper.getDefaultSettings()));
			}
		},
		
		getDefaultSettings : function(){
			var _settings = {};
			for(var key in defaultSettings){
				_settings[key] = defaultSettings[key];
			}
			return _settings;
		},
		
		getCurrentSettings : function(){
			var defaultSettings = sctHelper.getDefaultSettings();
			var currentSettings = JSON.parse(localStorage.getItem("sctSettings"));
			
			for(var key in defaultSettings){
				if(typeof currentSettings[key] == "undefined"){
					currentSettings[key] = defaultSettings[key];
				}
			}
			
			return currentSettings;
		}
	};
	
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
		switch(request.command){
			case "getSettings":
				sendResponse(sctHelper.getCurrentSettings());
			break;
			case "getDefaultSettings":
				sendResponse(sctHelper.getDefaultSettings());
			break;
			case "setSettings":
				settings = request.newSettings;
				localStorage.setItem("sctSettings", JSON.stringify(request.newSettings));
				sendResponse();
			break;
		}
	});
	
	sctHelper.createInitialSettings();
	
	chrome.runtime.onInstalled.addListener(function(details){
		if(details.reason == "install"){
			chrome.tabs.create({
				url : chrome.extension.getURL("welcome/index.html")
			});
		}
	});
})();