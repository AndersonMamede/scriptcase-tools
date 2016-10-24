"use strict";

(function(){
	// Chrome uses "chrome";
	// although Firefox can also use "chrome", we should
	// be better of using the generic "browser"
	var browser = browser || chrome;
	
	var defaultSettings = {
		"extEnabled" : true,
		"restoreDeploySettings" : false,
		"preventSessionTimeout" : false,
		"preventSessionTimeoutMinutes" : 15,
		"useNewEditor" : false,
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
		"changeEditorFullscreen" : true,
		"currentVersion" : null
	};
	
	var settings = null;
	
	var sctHelper = {
		createInitialSettings : function(){
			if(settings){
				return;
			}
			
			try{
				settings = JSON.parse(localStorage.getItem("sctSettings")) || null;
			}catch(ex){}
			
			if(!settings){
				settings = {};
			}
			
			settings = sctHelper.mergeObjects(sctHelper.getDefaultSettings(), settings);
			
			sctHelper.saveCurrentSettings();
		},
		
		getDefaultSettings : function(){
			return sctHelper.cloneObject(defaultSettings);
		},
		
		saveCurrentSettings : function(){
			localStorage.setItem("sctSettings", JSON.stringify(settings));
		},
		
		getCurrentSettings : function(){
			var currentSettings = JSON.parse(localStorage.getItem("sctSettings"));
			return sctHelper.mergeObjects(sctHelper.getDefaultSettings(), currentSettings);
		},
		
		openHtmlPage : function(path){
			browser.tabs.create({
				url : browser.extension.getURL(path)
			}, function(){
				settings.currentVersion = browser.runtime.getManifest().version;
				sctHelper.saveCurrentSettings();
			});
		},
		
		justInstalledExt : function(){
			return settings.currentVersion === null;
		},
		
		justUpdatedExt : function(){
			return settings.currentVersion != browser.runtime.getManifest().version;
		},
		
		cloneObject : function(obj){
			var newObj = {};
			
			for(var key in obj){
				newObj[key] = obj[key];
			}
			
			return newObj;
		},
		
		mergeObjects : function(obj1, obj2){
			var newObj = sctHelper.cloneObject(obj1);
			
			for(var key in obj2){
				newObj[key] = obj2[key];
			}
			
			return newObj;
		}
	};
	
	browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
		switch(request.command){
			case "getSettings":
				sendResponse(sctHelper.getCurrentSettings());
			break;
			case "getDefaultSettings":
				sendResponse(sctHelper.getDefaultSettings());
			break;
			case "setSettings":
				settings = sctHelper.mergeObjects(sctHelper.getCurrentSettings(), request.newSettings);
				sctHelper.saveCurrentSettings();
				sendResponse();
			break;
		}
	});
	
	sctHelper.createInitialSettings();
	
	if(sctHelper.justInstalledExt()){
		sctHelper.openHtmlPage("pages/welcome/index.html");
	}else if(sctHelper.justUpdatedExt()){
		sctHelper.openHtmlPage("pages/welcome/index.html#just-updated");
	}
})();