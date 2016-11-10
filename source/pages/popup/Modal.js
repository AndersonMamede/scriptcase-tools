"use strict";

window.Modal = new (function(){
	var modalData = {};
	
	var fn = {
		prepare : function(modalId, options){
			if(typeof modalData[modalId] != "undefined" && modalData[modalId]){
				return;
			}
			
			modalData[modalId] = {
				modalId : modalId,
				options : options,
				$elements : {}
			};
			
			var zIndex = fn.getNextZIndex();
			
			modalData[modalId].$elements.modal = $('<div class="modal"></div>').css("z-index", zIndex);
			modalData[modalId].$elements.modalBody = $('<div class="modal-body"></div>').css("z-index", zIndex);
			modalData[modalId].$elements.modalTitle = $('<div class="modal-title"></div>');
			modalData[modalId].$elements.modalContent = $('<div class="modal-content"></div>');
			modalData[modalId].$elements.modalToolbar = $('<div class="modal-toolbar"></div>');
			modalData[modalId].$elements.defaultButton = $('<button class="bt-modal-ok button">OK</button>');
			
			modalData[modalId].$elements.modal.prependTo($("body"));
			modalData[modalId].$elements.modalBody.appendTo(modalData[modalId].$elements.modal);
			modalData[modalId].$elements.modalTitle.appendTo(modalData[modalId].$elements.modalBody);
			modalData[modalId].$elements.modalContent.appendTo(modalData[modalId].$elements.modalBody);
			modalData[modalId].$elements.modalToolbar.appendTo(modalData[modalId].$elements.modalBody);
			modalData[modalId].$elements.defaultButton.appendTo(modalData[modalId].$elements.modalToolbar);
			
			modalData[modalId].$elements.defaultButton.click(function(){
				fn.close(modalId);
			});
		},
		
		getNextZIndex : function(){
			return Object.keys(modalData).length + 1;
		},
		
		show : function(modalId, options){
			fn.reset(modalId);
			fn.prepare(modalId, options);
			
			if(options.title){
				modalData[modalId].$elements.modalTitle.html(options.title);
			}
			
			if(options.content){
				modalData[modalId].$elements.modalContent.html(options.content);
			}
			
			if(options.textAlign){
				modalData[modalId].$elements.modalContent.css("text-align", options.textAlign);
			}
			
			if(options.defaultButtonClass){
				modalData[modalId].$elements.defaultButton.addClass(options.defaultButtonClass)
			}
			
			if(options.defaultButtonText){
				modalData[modalId].$elements.defaultButton.text(options.defaultButtonText);
			}
			
			fn.parseExtraButtons(modalId, options.extraButton);
			
			modalData[modalId].$elements.modal.addClass("active");
			
			fn.center(modalId);
			
			if(modalData[modalId].$elements.defaultButton && modalData[modalId].$elements.defaultButton.is(":visible")){
				modalData[modalId].$elements.defaultButton.focus();
			}
		},
		
		parseExtraButtons : function(modalId, extraButton){
			if(!$.isPlainObject(extraButton)){
				return;
			}
			
			for(var text in extraButton){
				var callback = extraButton[text];
				var $button = $("<button class='button extraButton'>" + text + "</button>").click(callback);
				modalData[modalId].$elements.modalToolbar.prepend($button);
			}
		},
		
		center : function(modalId){
			var topPosition = ($("body").outerHeight() - modalData[modalId].$elements.modalBody.outerHeight()) / 2
			var fixedMargin = 10;
			modalData[modalId].$elements.modalBody.css("margin-top", topPosition - fixedMargin);
		},
		
		close : function(modalId){
			if(typeof modalData[modalId] == "undefined" || !modalData[modalId]){
				return;
			}
			
			modalData[modalId].$elements.modal.removeClass("active").remove();
			delete modalData[modalId];
			fn.reset();
		},
		
		reset : function(modalId){
			if(typeof modalData[modalId] == "undefined" || !modalData[modalId]){
				return;
			}
			
			modalData[modalId].$elements.modalTitle.html("");
			modalData[modalId].$elements.modalContent.html("");
			modalData[modalId].$elements.defaultButton.prop("class", "button").text("OK");
			modalData[modalId].$elements.modalToolbar.find(".extraButton").remove();
		}
	};
	
	return {
		show : fn.show,
		close : fn.close
	};
});