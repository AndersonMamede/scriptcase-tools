"use strict";

(function(){
	if(window.location.href.indexOf("/devel/iface/publishwizard.php") == -1){
		return;
	}
	
	function controlDeploy(projectName){
		if(typeof window.setStep != "function"){
			return;
		}
		
		var deploySettings = {};
		var $step = $("input[name='step']");
		var $form = $step.closest("form");
		
		var fn = {
			init : function(){
				fn.loadDeploySettings();
				fn.overwriteFnSetStep();
				fn.loadLastSettings();
			},
			
			saveDeploySettings : function(){
				localStorage.setItem("sctDeploySettings", JSON.stringify(deploySettings));
			},
			
			loadDeploySettings : function(){
				deploySettings = JSON.parse(localStorage.getItem("sctDeploySettings") || "{}");
			},
			
			getStepFields : function(stepId){
				var fieldsMapping = {
					"type" : ["pub_type"],
					"esquema" : ["pub_esquema"],
					"dir_dados" : ["pub_with_prod", "pub_with_lib", "pub_create_index_file"],
					"opcoes_de_pub" : [
						"pub_zip_flag", "pub_dir_flag", "pub_dir", "pub_ftp_flag",
						"pub_ftp_server", "pub_ftp_user", "pub_ftp_dir", "pub_sftp_flag",
						"pub_sftp_server", "pub_sftp_user", "pub_sftp_dir"
					]
				};
				
				return fieldsMapping[stepId] || [];
			},
			
			overwriteFnSetStep : function(){
				var originalSetStep = window.setStep;
				window.setStep = function(str_step, str_myaction){
					var stepId = $step.val();
					var fields = fn.getStepFields(stepId);
					var stepSettings = {};
					
					if(!deploySettings[projectName]){
						deploySettings[projectName] = {};
					}
					
					for(var x = 0; x < fields.length; x++){
						var field = fields[x];
						var $field = $form.find("[name='"+field+"']");
						var value = "";
						
						if($field.prop("tagName") == "INPUT" && $field.prop("type") == "radio"){
							value = $field.filter(":checked").val();
						}else if($field.prop("tagName") == "INPUT" && $field.prop("type") == "checkbox"){
							value = $field.is(":checked");
						}else{
							value = $field.val();
						}
						
						stepSettings[field] = value;
					}
					
					if(Object.keys(stepSettings).length){
						deploySettings[projectName]["step-" + stepId] = stepSettings;
						fn.saveDeploySettings();
					}
					
					originalSetStep(str_step, str_myaction);
				};
			},
			
			loadLastSettings : function(){
				var stepId = $step.val();
				var fields = fn.getStepFields(stepId);
				
				if(!fields || !deploySettings[projectName]){
					return;
				}
				
				for(var x = 0; x < fields.length; x++){
					var field = fields[x];
					var $field = $form.find("[name='"+field+"']");
					
					var stepSettings = deploySettings[projectName]["step-" + stepId];
					if(!stepSettings || !Object.keys(stepSettings).length){
						return;
					}
					
					var value = stepSettings[field];
					
					if($field.prop("tagName") == "INPUT" && $field.prop("type") == "radio"){
						$field.filter("[value='"+value+"']").prop("checked", true);
					}else if($field.prop("tagName") == "INPUT" && $field.prop("type") == "checkbox"){
						$field.prop("checked", value);
						if($.inArray(field, ["pub_dir_flag", "pub_ftp_flag", "pub_sftp_flag"]) != -1){
							window.checkboxChange && window.checkboxChange(field);
						}
					}else{
						$field.val(value);
					}
				}
			}
		};
		
		fn.init();
	};
	
	window.loadSettingsFromBackgroundPage(function(sctSettings){
		if(!sctSettings || !sctSettings.extEnabled || !sctSettings.restoreDeploySettings){
			return;
		}
		
		if(!sctSettings.isExtensionNecessary){
			return;
		}
		
		var projectName = window.getProjectName();
		if(projectName){
			window.appendScript(document, controlDeploy, projectName);
		}
	});
})();