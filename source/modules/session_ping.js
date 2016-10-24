"use strict";

(function(){
	if(window.location.href.indexOf("/devel/iface/main.php") == -1){
		return;
	}
	
	function addPingInterval(preventSessionTimeoutMinutes){
		var convertToMilliseconds = function(minutes){
			return (minutes * 60) * 1000;
		};
		
		setInterval(function(){
			$.get("about.php");
		}, convertToMilliseconds(preventSessionTimeoutMinutes));
	}
	
	window.loadSettingsFromBackgroundPage(function(sctSettings){
		if(!sctSettings || !sctSettings.preventSessionTimeout || !sctSettings.preventSessionTimeoutMinutes){
			return;
		}
		
		window.appendScript(document, addPingInterval, sctSettings.preventSessionTimeoutMinutes);
	});
})();