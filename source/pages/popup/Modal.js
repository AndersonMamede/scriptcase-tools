"use strict";

window.Modal = new (function(){
	var elements = {
		$modal : $("#modal"),
		$modalTitle : $("#modal-title"),
		$modalContent : $("#modal-content"),
		$modalToolbar : $("#modal-toolbar"),
		$defaultButton : $("#bt-modal-ok")
	};
	
	elements.$defaultButton.click(function(){
		fn.close();
	});
	
	var fn = {
		reset : function(){
			elements.$modalTitle.html("");
			elements.$modalContent.html("");
			elements.$defaultButton.prop("class", "button").text("OK");
			elements.$modalToolbar.find(".extraButton").remove();
		},
		
		close : function(){
			elements.$modal.removeClass("active");
			fn.reset();
		},
		
		show : function(options){
			fn.reset();
			
			options.title && elements.$modalTitle.html(options.title);
			options.content && elements.$modalContent.html(options.content);
			options.defaultButtonClass && elements.$defaultButton.addClass(options.defaultButtonClass);
			options.defaultButtonText && elements.$defaultButton.text(options.defaultButtonText);
			
			fn.parseExtraButtons(options.extraButton);
			
			elements.$modal.addClass("active");
		},
		
		parseExtraButtons : function(extraButton){
			if(!$.isPlainObject(extraButton)){
				return;
			}
			
			for(var text in extraButton){
				var callback = extraButton[text];
				var $button = $("<button class='button extraButton'>" + text + "</button>").click(callback);
				elements.$modalToolbar.prepend($button);
			}
		}
	};
	
	return fn;
});