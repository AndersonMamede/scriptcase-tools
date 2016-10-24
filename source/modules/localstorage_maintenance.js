// clear localStorage before it reachs its maximum storage size
// keep localStorage short
(function(){
	var sctEditorConfig = localStorage.getItem("sctEditorConfig") || "";
	var sctNewEditorState = localStorage.getItem("sctNewEditorState") || "";
	var sctDeploySettings = localStorage.getItem("sctDeploySettings") || "";
	
	// 5MB is the limit for localStorage in latest Chrome/Firefox, but it should
	// be kept way less than its limit (avoid high memory usage and better performance)
	var maxCharLength = 1.5 * (1024 * 1024); // 1.5MB
	
	var currentLength = sctEditorConfig.length + sctNewEditorState.length + sctDeploySettings.length;
	
	if(currentLength < maxCharLength){
		return;
	}
	
	localStorage.removeItem("sctEditorConfig");
	localStorage.removeItem("sctNewEditorState");
	localStorage.removeItem("sctDeploySettings");
})();