"use strict";

(function(){
	// 'funcao=' is a parameter in the URL whe generating an app
	if(!window.location.href.toLowerCase().indexOf("funcao=compile")){
		return;
	}
	
	window.isGeneratingApp(true);
	
	var endProcessElement = null;
	
	var interval = setInterval(function(){
		if(!endProcessElement){
			endProcessElement = document.getElementById("tr_end_process");
		}
		
		if(!endProcessElement){
			return;
		}
		
		var displayStatus = endProcessElement.style.display;
		
		if(displayStatus === "" || displayStatus === "block"){
			clearInterval(interval);
			setTimeout(function(){
				window.isGeneratingApp(false);
			}, 150);
		}
	}, 300);
})();