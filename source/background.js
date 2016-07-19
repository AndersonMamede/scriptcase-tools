"use strict";

(function(){
	var defaultSettings = {
		"extEnabled" : true,
		"disableHoverOnMainMenu" : true,
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
			
			// loads stored settings (from localStorage);
			try{
				settings = JSON.parse(localStorage.getItem("sctSettings"));
			}catch(ex){}
			
			// if no settings were found, then it should be created (using defaultSettings)
			if(!settings){
				// makes a COPY of defaultSettings (defaultSettings should not be changed,
				// otherwise any change would be reflected to the original object)
				localStorage.setItem("sctSettings", JSON.stringify(sctHelper.getDefaultSettings()));
			}
		},
		
		// returns a COPY of defaultSettings
		getDefaultSettings : function(){
			var _settings = {};
			for(var key in defaultSettings){
				_settings[key] = defaultSettings[key];
			}
			return _settings;
		}
	};
	
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
		switch(request.command){
			case "getSettings":
				sendResponse(JSON.parse(localStorage.getItem("sctSettings")));
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