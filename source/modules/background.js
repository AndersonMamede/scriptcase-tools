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
		"enableAppSelection" : true,
		"enableTabShortcuts" : true,
		"useNewEditor" : true,
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
		"currentVersion" : null,
		"installationId" : null,
		
		/* NE_* = New Editor */
		"NE_enableLineWrapping" : false
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
		
		checkCurrentInstallInfo : function(callback){
			var url = "https://scriptcase-tools.firebaseio.com/installs/" + settings.installationId + ".json"
			fetch(url)
				.then(function(response){
					return response.json();
				}).then(function(data){
					callback(data);
				}).catch(function(){
					callback(null);
				});
		},
		
		saveInstallInfo : function(callback){
			if(typeof fetch != "function"){
				return;
			}
			
			// because this extension is "unlisted" in Firefox's webstore, there would
			// be no way to know how many Firefox users installed it;
			// so, to keep track of the amount of SCT users using Firefox, this information is
			// send to Firebase when extension is installed;
			// all the information will be public available at:
			// http://blog.andersonmamede.com.br/scriptcase-tools-installs/
			var url = "https://scriptcase-tools.firebaseio.com/installs.json";
			fetch(url, {
				method : "POST",
				body : JSON.stringify({
					userAgent : window.navigator.userAgent,
					language : window.navigator.language,
					date : {".sv" : "timestamp"},
					sctVersion : browser.runtime.getManifest().version
				})
			}).then(function(response){
				if(response.status == 200){
					return response.json();
				}
			}).then(function(data){
				settings.installationId = data.name;
				sctHelper.saveCurrentSettings();
				
				if(callback){
					callback();
				}
			});
		},
		
		updateInstallInfo : function(){
			sctHelper.checkCurrentInstallInfo(function(data){
				if(data !== null){
					if(data.sctVersion == browser.runtime.getManifest().version){
						return;
					}
					
					var url = "https://scriptcase-tools.firebaseio.com/installs/" + settings.installationId + ".json"
					fetch(url, {
						method : "PATCH",
						body : JSON.stringify({
							sctVersion : browser.runtime.getManifest().version
						})
					});
				}else{
					sctHelper.saveInstallInfo();
				}
			});
		},
		
		setUninstallURL : function(){
			if(typeof browser.runtime != "undefined" && typeof browser.runtime.setUninstallURL == "function"){
				var uninstallUrl = "http://blog.andersonmamede.com.br/scriptcase-tools-data/uninstall-survey/index.html";
				browser.runtime.setUninstallURL(uninstallUrl + "#" + JSON.stringify({
					installId : settings.installationId,
					sctVersion : browser.runtime.getManifest().version
				}));
			}
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
	
	if(settings.installationId){
		sctHelper.setUninstallURL();
	}else{
		sctHelper.saveInstallInfo(sctHelper.setUninstallURL);
	}
	
	if(sctHelper.justInstalledExt()){
		sctHelper.openHtmlPage("pages/welcome/index.html");
	}else if(sctHelper.justUpdatedExt()){
		var manifestVersion = browser.runtime.getManifest().version;
		if(manifestVersion != "1.6.1" && manifestVersion != "1.6.2"){
			sctHelper.openHtmlPage("pages/welcome/index.html#just-updated");
		}
		sctHelper.updateInstallInfo();
	}
})();