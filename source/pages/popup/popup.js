"use strict";

$(document).ready(function(){
	// Chrome uses "chrome";
	// although Firefox can also use "chrome", we should
	// be better of using the generic "browser"
	var browser = browser || chrome;
	
	var settings = {};
	
	var availableShortcutKeys = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"];
	
	var infoContent = {
		"restoreDeploySettings" : [
			"When this option is enabled, the last settings used to deploy an application will be automatically ",
			"restored when deploying another application of the same project (you can still change them ",
			"before clicking the Next button).<br><br>",
			"Password (e.g., FTP, SFTP) will <b>NOT</b> be saved/restored."
		].join(""),
		"preventSessionTimeout" : [
			"When you stay idle for sometime (usually 20/30 minutes), ScriptCase session will timeout and ",
			"you will be logged out from its enviroment, which will cause you to lose all unsaved code/work.<br><br>",
			"Although you can define the session timeout in ScriptCase settings, it may not work if you ",
			"are running ScriptCase in a server that overrides this setting and sets it back to ",
			"the default value and you're not able to change the <i>php.ini</i> file.<br><br>",
			"If this option is <strong>enabled and as long as ScriptCase is open</strong>, SCT will periodically send requests ",
			"(<i>\"ping\"</i>) to the <i>about.php</i> page, which renews the session duration, therefore ",
			"preventing session from timing out (even if you are idle).<br><br>",
			"<strong>In short words</strong>, you should only use this option if you can't change <i>php.ini</i> and the option ",
			"provided in ScriptCase to change session timeout is not working (menu <i>Option</i> -> <i>System Settings</i> -> ",
			"<i>ScriptCase Session Timeout (min)</i>).<br><br>",
			"But keep in mind that holding the session alive <strong>may be a security risk</strong> because if you are away ",
			"someone else could use your computer and access ScriptCase IDE environment using your credentials (because unless ",
			"you had logged out before, your session would still be active)."
		].join(""),
		"useNewEditor" : [
			"Switch default code editor to a <u>newer</u> and <u>more complete</u> editor:<br><br>",
			"<p><b>*</b> Sublime Text-based <u>key bindings</u> (e.g., jump to line, selext next/all occurrences, duplicate line, etc). ",
			"<a href='/pages/key_bindings/index.html' target='_blank'>Complete list here</a>;</p>",
			"<p><b>*</b> New <u>special theme</u> \"Sublime Text (Detailed)\" which shows invisible characters (tab and white spaces);</p>",
			"<p><b>*</b> <u>Highlight</u> on editor and scrollbar <u>all occurrences</u> of a selected word/text;</p>",
			"<p><b>*</b> Possibility to add <u>bookmarks in your code</u> (Ctrl+F1/Alt+F1);</p>",
			"<p><b>*</b> Possibility to <u>fold/unfold code blocks</u> (Ctrl+Q);</p>",
			"<p><b>*</b> Autocomplete for <u>PHP functions</u>;</p>",
			"<p><b>*</b> Autocomplete for <u>any words</u> found in the current editor;</p>",
			"<p><b>*</b> Highlight the <u>starting and ending brackets</u> (), {} and [] when cursor touches it;</p>"
		].join(""),
		"keySaveApp" : ["Perform the same action as the <u>save button</u> in the top toolbar."].join(""),
		"keyGenerateSource" : ["Perform the same action as the <u>generate source code button</u> in the top toolbar."].join(""),
		"keyRunApp" : [
			"Perform the same action as the <u>run app button</u> in the top toolbar: ",
			"save, generate and then run."
		].join("")
	};
	
	var fields = {
		text : [
			"preventSessionTimeoutMinutes", "keyMacroDoc", "keySaveApp",
			"keyFocusEditor", "keyGenerateSource", "keyRunApp",
			"keyToggleEditorFullscreen"
		],
		checkbox : [
			"extEnabled", "restoreDeploySettings", "preventSessionTimeout",
			"useNewEditor", "disableHoverOnMainMenu", "disableEditorLineWrapping",
			"useShortcutKeys", "loadCursorBack", "changeEditorFullscreen"
		]
	};
	
	var fn = {
		init : function(){
			fn.loadSettings();
			fn.bindEvents();
		},
		
		loadSettings : function(){
			browser.runtime.sendMessage({command:"getSettings"}, function(_settings){
				settings = _settings;
				fn.loadSettingsToFields(_settings);
			});
		},
		
		loadSettingsToFields : function(data){
			fields.checkbox.forEach(id => {
				$("#" + id).prop("checked", data[id]);
			});
			
			fields.text.forEach(id => {
				$("#" + id).val(data[id]);
			});
			
			document.getElementById("preventSessionTimeout").dispatchEvent(new Event("change"));
			document.getElementById("useShortcutKeys").dispatchEvent(new Event("change"));
		},
		
		getSettingsFromFields : function(){
			var newSettings = {};
			
			fields.checkbox.forEach(id => {
				newSettings[id] = $("#" + id).prop("checked");
			});
			
			fields.text.forEach(id => {
				newSettings[id] = $.trim($("#" + id).val());
			});
			
			return newSettings;
		},
		
		validateNewSettings : function(newSettings){
			var invalidFields = [];
			
			(function validateNewShortcutKeys(){
				var $field = $("#preventSessionTimeoutMinutes");
				var preventSessionTimeoutMinutes = Number($.trim($field.val()));
				
				if(isNaN(preventSessionTimeoutMinutes)){
					$field.val(15);
					invalidFields.push("Invalid configuration for session timeout ping. Value must be a number between 5 and 999 (minutes).");
				}else if(preventSessionTimeoutMinutes < 5){
					invalidFields.push("Invalid configuration for session timeout ping. Value must be equal or greater than 5 (minutes).");
				}else if(preventSessionTimeoutMinutes > 999){
					invalidFields.push("Invalid configuration for session timeout ping. Value must be equal or less than 999 (minutes).");
				}
			})();
			
			(function validateNewShortcutKeys(){
				var requestedShortcutKeys = {};
				requestedShortcutKeys[newSettings.keyMacroDoc] = $("#keyMacroDoc + label").text();
				requestedShortcutKeys[newSettings.keySaveApp] = $("#keySaveApp + label").text();
				requestedShortcutKeys[newSettings.keyFocusEditor] = $("#keyFocusEditor + label").text();
				requestedShortcutKeys[newSettings.keyGenerateSource] = $("#keyGenerateSource + label").text();
				requestedShortcutKeys[newSettings.keyRunApp] = $("#keyRunApp + label").text();
				
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
			$(".info").click(function(){
				window.Modal.show({
					title : "Info",
					content : infoContent[this.getAttribute("data-info")]
				});
			});
			
			$("#send-message").click(function(){
				window.Modal.show({
					title : "Let us know what you think",
					content : $("#feedback-container").html(),
					defaultButtonText : "Cancel",
					defaultButtonClass : "opaque",
					extraButton : {
						"Send message" : function(){
							var $button = $(this).blur();
							var message = $.trim($("#feedback-message").val());
							
							if($button.hasClass("busy")){
								return false;
							}
							
							if(!message.length){
								alert("You must type a message to send!");
								$("#feedback-message").focus();
								return false;
							}
							
							var _sendMessage = function(message){
								var data = {
									userAgent : window.navigator.userAgent,
									language : window.navigator.language,
									date : {".sv" : "timestamp"},
									sctVersion : settings.currentVersion,
									message : message
								};
								
								$.post(
									"https://scriptcase-tools.firebaseio.com/feedback.json",
									JSON.stringify(data)
								).always(function(response){
									if(!response || !response.name){
										var errorMessage = "Error while sending message:\n";
										if(response.status && response.responseJSON){
											errorMessage += response.status + " - " + response.responseJSON.error;
										}else{
											errorMessage += "Unknown error";
										}
										
										return fn.releaseButton($button, "fail", function(){
											alert(errorMessage);
										});
									}
									
									return fn.releaseButton($button, "done", function(){
										window.Modal.close();
										setTimeout(function(){
											alert("We appreciate your feedback and we'll use it to create a better tool.\nThank you!");
										}, 100);
									});
								});
							};
							
							$button.addClass("busy");
							_sendMessage(message);
							
							return false;
						}
					}
				});
				
				$("#feedback-message").focus();
			});
			
			$("#form-field").on("click", "#save-settings:not(.busy)", function(){
				var $button = $(this).blur();
				var newSettings = fn.getSettingsFromFields();
				
				if(!fn.validateNewSettings(newSettings)){
					return;
				}
				
				$button.addClass("busy");
				
				browser.runtime.sendMessage({
					command : "setSettings",
					newSettings : newSettings
				}, function(){
					fn.releaseButton($button, "done", function(){
						alert("Reload ScriptCase to apply the changes.");
					});
				});
			});
			
			$("#form-field").on("click", "#load-default-settings:not(.busy)", function(){
				var $button = $(this).blur().addClass("busy");
				
				browser.runtime.sendMessage({command:"getDefaultSettings"}, function(defaultSettings){
					fn.loadSettingsToFields(defaultSettings);
					
					// delay to give feedback to user
					setTimeout(() => { $button.removeClass("busy") }, 500);
				});
			});
			
			$("#preventSessionTimeout").change(function togglePreventSessionTimeout(){
				$("#preventSessionTimeoutMinutes").prop("disabled", !this.checked);
			});
			
			$("#useShortcutKeys").change(function toggleShortcutKeys(){
				var active = this.checked;
				$(".shortcut-keys-container")
					[active ? "addClass" : "removeClass"]("active")
					.find("input").each(function(){
						this.disabled = !active;
					});
			});
			
			$("label").click(function handleLabelClick(){
				var $label = $(this);
				var $input = $(this).closest(".field-container").find("input").first();
				var inputType = $input.prop("type");
				
				if(!inputType || !$input.length || $input.prop("readonly") || $input.prop("disabled")){
					return;
				}
				
				switch(inputType){
					case "text":
						// because extension popup doesn't focus the field when clicked on its label,
						// it had to be done manually
						$input.focus();
					break;
					case "checkbox":
						$input.prop("checked", !$input.prop("checked"));
						// fire the change event, so container ".shortcut-keys-container" can be updated
						$input.trigger("change");
					break;
				}
			});
		},
		
		releaseButton : function($button, toggleClass, callback){
			// delay to give feedback to user
			setTimeout(() => {
				$button.addClass(toggleClass);
				setTimeout(() => {
					$button.removeClass(toggleClass).removeClass("busy");
					callback && callback();
				}, 800);
			}, 500);
		}
	};
	
	fn.init();
});