"use strict";

var sctVersion = chrome.runtime.getManifest().version;
document.querySelector("#sct-version").innerText = "v" + sctVersion;

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
		"disableEditorLineWrapping" : [
			"If this option is enabled, lines <b>will never be splitted</b> to fit in the available width.",
			"<br><br>This option affects only the <b>old/native editor</b>.",
			"<br>To change settings for the <b>new editor</b> click on <a href='#' class='btn-editor-preferences'>Preferences</a>."
		].join(""),
		"keySaveApp" : ["Perform the same action as the <u>save button</u> in the top toolbar."].join(""),
		"keyGenerateSource" : ["Perform the same action as the <u>generate source code button</u> in the top toolbar."].join(""),
		"keyRunApp" : [
			"Perform the same action as the <u>run app button</u> in the top toolbar: ",
			"save, generate and then run."
		].join(""),
		
		"NE_enableLineWrapping" : [
			"If this option is enabled, lines <b>will be splitted</b> to fit in the available width."
		].join("")
	};
	
	var modalContent = {
		"editorPreferences" : [
			"<div class='field-container'>",
				"<input type='checkbox' id='NE_enableLineWrapping'/>",
				"&nbsp;<label>Enable line/word wrapping</label>",
				"<img src='/assets/img/icon-info.svg' class='info' data-info='NE_enableLineWrapping' width='16'/>",
			"</div>"
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
			"useShortcutKeys", "loadCursorBack", "changeEditorFullscreen",
			"NE_enableLineWrapping"
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
		
		loadSettingsToFields : function(data, specificFields){
			fields.checkbox.forEach(id => {
				if(typeof specificFields != "undefined" && specificFields.indexOf(id) == -1){
					return;
				}
				
				$("#" + id).prop("checked", data[id]);
			});
			
			fields.text.forEach(id => {
				if(typeof specificFields != "undefined" && specificFields.indexOf(id) == -1){
					return;
				}
				
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
					invalidFields.push("Invalid configuration for session timeout ping. Value must be a number between 5 and 999 (minutes)");
				}else if(preventSessionTimeoutMinutes < 5){
					invalidFields.push("Invalid configuration for session timeout ping. Value must be equal or greater than 5 (minutes)");
				}else if(preventSessionTimeoutMinutes > 999){
					invalidFields.push("Invalid configuration for session timeout ping. Value must be equal or less than 999 (minutes)");
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
						invalidShortcutKeysMsg.push("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* " + key + " -> " + requestedShortcutKeys[key]);
					}
				}
				
				if(invalidShortcutKeysMsg.length){
					invalidFields.push("Invalid shortcuts keys:<br>" + invalidShortcutKeysMsg.join("<br>"));
				}
			})();
			
			if(invalidFields.length){
				Modal.show("invalid_fields", {
					title : "Invalid field(s)",
					content : "- " + invalidFields.join(";<br>- ") + ";"
				});
				return false;
			}
			
			return true;
		},
		
		saveSettings : function($button, callback){
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
					fn.loadSettings();
					
					callback && callback();
					
					Modal.show("settings_saved", {
						content : "Reload ScriptCase/editor to apply the changes.",
						textAlign : "center"
					});
				});
			});
		},
		
		sendMessage : function($button, message, email){
			if($button.hasClass("busy")){
				return false;
			}
			
			if(!email.length){
				Modal.show("invalid_fields", {
					title : "Invalid field(s)",
					content : "You must inform your email address!",
					textAlign : "center"
				});
				return false;
			}
			
			if(!message.length){
				Modal.show("invalid_fields", {
					title : "Invalid field(s)",
					content : "You must type a message to send!",
					textAlign : "center"
				});
				return false;
			}
			
			var _send = function(message){
				var data = {
					userAgent : window.navigator.userAgent,
					language : window.navigator.language,
					date : {".sv" : "timestamp"},
					sctVersion : settings.currentVersion,
					email : email,
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
							Modal.show("fail", {
								content : errorMessage
							});
						});
					}
					
					return fn.releaseButton($button, "done", function(){
						Modal.close("feedback");
						setTimeout(function(){
							Modal.show("feedback_sent", {
								title : "Thank you!",
								content : [
									"We appreciate your feedback and we'll use it to create a better tool.<br>",
									"Thank you!"
								].join("")
							});
						}, 100);
					});
				});
			};
			
			$button.addClass("busy");
			_send(message);
			
			return false;
		},
		
		bindEvents : function(){
			$("body").on("click", ".info", function(){
				Modal.show("info", {
					title : "Info",
					content : infoContent[this.getAttribute("data-info")]
				});
			});
			
			$("#send-message").click(function(){
				Modal.show("feedback", {
					title : "Let us know what you think",
					content : $("#feedback-container").html(),
					defaultButtonText : "Cancel",
					defaultButtonClass : "opaque",
					extraButton : {
						"Send message" : function(){
							var $button = $(this).blur();
							var message = $.trim($("#feedback-message").val());
							var email = $.trim($("#feedback-email").val());
							return fn.sendMessage($button, message, email);
						}
					}
				});
				
				$("#feedback-email").focus();
			});
			
			$("#form-field").on("click", "#save-settings:not(.busy)", function(){
				fn.saveSettings($(this).blur());
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
			
			$("body").on("click", "label", function handleLabelClick(){
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
			
			$("body").on("click", ".btn-editor-preferences", function editorPreferences(evt){
				Modal.close("info");
				
				Modal.show("editor_preferences", {
					title : "Preferences (for new editor)",
					content : modalContent.editorPreferences,
					defaultButtonText : "Close",
					extraButton : {
						"Save settings" : function(){
							fn.saveSettings($(this).blur(), function(){
								Modal.close("editor_preferences");
							});
						}
					}
				});
				
				fn.loadSettingsToFields(settings, ["NE_enableLineWrapping"]);
				
				evt.preventDefault();
				return false;
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