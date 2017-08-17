"use strict";

(function(){
	function controller(projectName, createHashFromStringStr){
		var $elements = {
			stage : $(null),
			toggleMenu : $(null),
			currentSelectionCounter : $(null),
			saveSelection : $(null),
			selectionList : $(null),
			selectionListCounter : $(null),
			clearSavedSelection : $(null),
			countAllApps : $(null),
			countOutdatedApps : $(null),
			selectAllApps : $(null),
			unselectAllApps : $(null),
			selectAllOutdatedApps : $(null),
			unselectAllOutdatedApps : $(null)
		};
		
		var fn = {
			init : function(){
				appSelection.createControllers();
				appSelection.addEvents();
				
				// there's no way to detect when the current folder is changed, so the
				// only way to keep the data and the interface synced is using an interval
				setInterval(function(){
					appSelection.updateSelectionList();
					appSelection.updateCurrentSelectionCounter();
					appSelection.updateAllAppsCounter();
					appSelection.updateOutdatedAppsCounter();
				}, 500);
			}
		};
		
		// add extra function to the 'fn' object
		eval("fn.createHashFromString = (" + createHashFromStringStr + ")");
		
		var appSelection = {
			getIdentifier : function(){
				var identifier = projectName + "-" + $.trim($("#idFolderName").text());
				return fn.createHashFromString(identifier);
			},
			
			createControllers : function(){
				$elements.stage = $("<div id='appSelection' class='active'></div>");
				
				var saveSelectionTitle = "Save the current app selection in this specific project/folder";
				var clearSavedSelectionTitle = "Remove all saved selections for this project/folder";
				$([
					"<ul id='appSelection-menu'>",
						"<li id='appSelection-saveSelection' title='" + saveSelectionTitle +"'>",
							"Save Selection <span class='appSelection-currentSelectionCounter'></span>",
						"</li>",
						"<li>",
							"<span title='Select applications...'>Select in this folder...</span>",
							"<ul id='appSelection-selectApplications' class='appSelection-submenu'>",
								"<li id='appSelection-selectAllApps' title='Select all applications'>",
									"Select all applications <span class='appSelection-countAllApps select'></span>",
								"</li>",
								"<li id='appSelection-unselectAllApps' title='Unselect all applications'>",
									"Unselect all applications <span class='appSelection-countAllApps unselect'></span>",
								"</li>",
								"<li id='appSelection-selectAllOutdatedApps' title='Select all outdated applications'>",
									"Select all outdated applications <span class='appSelection-countOutdatedApps select'></span>",
								"</li>",
								"<li id='appSelection-unselectAllOutdatedApps' title='Unselect all outdated applications'>",
									"Unselect all outdated applications <span class='appSelection-countOutdatedApps unselect'></span>",
								"</li>",
							"</ul>",
						"</li>",
						"<li>",
							"<span title='Restore a previous (saved) app selection'>",
								"Restore Selection <span class='appSelection-selectionListCounter'></span>",
							"</span>",
							"<ul id='appSelection-selectionList' class='appSelection-submenu'>",
								"<li id='appSelection-clearSavedSelection' title='" + clearSavedSelectionTitle + "'>",
									"Clear list",
								"</li>",
							"</ul>",
						"</li>",
					"</ul>"
				].join(""))
					.appendTo($elements.stage)
				
				var appSelectionTitle = "App Selection module provided by ScriptCase Tools extension";
				$([
					"<span type='button' id='appSelection-toggleMenu' title='" + appSelectionTitle + "'>",
						"<span class='ui-button-text'>",
							"App Selection <span class='appSelection-currentSelectionCounter'></span>",
						"</span>",
					"</span>"
				].join(""))
					.addClass("ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only")
					.appendTo($elements.stage);
				
				$elements.stage.appendTo("body");
				
				$elements.toggleMenu = $("#appSelection-toggleMenu");
				$elements.currentSelectionCounter = $(".appSelection-currentSelectionCounter");
				$elements.saveSelection = $("#appSelection-saveSelection");
				$elements.selectionList = $("#appSelection-selectionList");
				$elements.selectionListCounter = $(".appSelection-selectionListCounter");
				$elements.clearSavedSelection = $("#appSelection-clearSavedSelection");
				$elements.countAllApps = $(".appSelection-countAllApps");
				$elements.countOutdatedApps = $(".appSelection-countOutdatedApps");
				$elements.selectAllApps = $("#appSelection-selectAllApps");
				$elements.unselectAllApps = $("#appSelection-unselectAllApps");
				$elements.selectAllOutdatedApps = $("#appSelection-selectAllOutdatedApps");
				$elements.unselectAllOutdatedApps = $("#appSelection-unselectAllOutdatedApps");
			},
			
			addEvents : function(){
				$elements.toggleMenu.click(appSelection.toggleMenu);
				
				$elements.saveSelection.click(appSelection.saveSelection);
				
				$elements.clearSavedSelection.click(function(){
					if($elements.selectionList.hasClass("appSelection-selectionList-is-empty")){
						return;
					}
					
					if(!confirm("Remove all saved selection?")){
						return;
					}
					
					appSelection.clearSavedSelection();
				});
				
				$elements.selectionList.on("click", ".appSelection-restoreSelection", function(){
					appSelection.restoreSelection(
						appSelection.getIdentifier(),
						$(this).attr("selectionKey")
					);
				});
				
				$elements.selectionList.on("click", ".appSelection-removeSavedSelection", function(evt){
					evt.preventDefault();
					evt.stopPropagation();
					
					if(!confirm("Remove selection?")){
						return;
					}
					
					appSelection.removeSavedSelection(
						appSelection.getIdentifier(),
						$(this).parent().attr("selectionKey")
					);
					
					return false;
				});
				
				$elements.selectAllApps.on("click", appSelection.selectAllApps);
				
				$elements.unselectAllApps.on("click", appSelection.unselectAllApps);
				
				$elements.selectAllOutdatedApps.on("click", appSelection.selectAllOutdatedApps);
				
				$elements.unselectAllOutdatedApps.on("click", appSelection.unselectAllOutdatedApps);
				
				$(document).on("change", "[name='str_check_uncheck'], [name='field_app_list[]']", function(){
					appSelection.updateCurrentSelectionCounter();
				});
			},
			
			toggleMenu : function(){
				$elements.stage.toggleClass("active");
			},
			
			closeMenu : function(){
				$elements.stage.removeClass("active");
			},
			
			updateSelectionList : function(forceUpdate){
				var identifier = appSelection.getIdentifier();
				
				// if the identifier hasn't changed, there's no need to update
				// the list because the folder is the same
				if(!forceUpdate && identifier == $elements.selectionList.data("identifier")){
					return;
				}
				
				var newItens = [];
				var selectionList = appSelection.getSavedSelection(identifier).selections;
				
				selectionList && selectionList.forEach(function(value, selectionKey){
					var apps = value.apps || [];
					
					// the apps name provided by ScriptCase use this pattern: AppName#@#AppType;
					// so the #@#AppType part must be removed before showing in the title
					var itemTitle = value.apps.join("/\n").replace(/(.+)(#@#[^/]+)(.+)/g, "$1");
					
					newItens.push([
						"<li class='appSelection-restoreSelection' selectionKey='" + selectionKey + "' title='" + itemTitle + "'>",
							value.name + " (" + apps.length + ")",
							"<span class='appSelection-removeSavedSelection' title='Remove this item'></span>",
						"</li>"
					].join(""));
				});
				
				$elements.selectionList
					.data("identifier", identifier)
					.find("li").not($elements.clearSavedSelection)
						.remove();
				
				$elements.selectionListCounter.text("(" + newItens.length + ")");
				
				if(newItens.length){
					$elements.selectionList
						.removeClass("appSelection-selectionList-is-empty")
						.append(newItens);
				}else{
					$elements.selectionList.addClass("appSelection-selectionList-is-empty");
				}
			},
			
			updateCurrentSelectionCounter : function(){
				var selectionCount = $("[name='field_app_list[]']:checked").length;
				$elements.currentSelectionCounter.text("(" + selectionCount + ")");
			},
			
			updateAllAppsCounter : function(){
				var appsCount = $("[name='field_app_list[]']").length;
				$elements.countAllApps.text("(" + appsCount + ")");
			},
			
			updateOutdatedAppsCounter : function(){
				var outdatedAppsCount = $(".nmTextDesatualizado:visible").length;
				$elements.countOutdatedApps.text("(" + outdatedAppsCount + ")");
			},
			
			getSuggestionForItemName : function(identifier){
				var data = appSelection.getSavedSelection();
				var next = data[identifier] ? data[identifier].totalSelectionsSaved + 1 : 1;
				return "Selection-" + next;
			},
			
			getCurrentSelection : function(){
				var selectionList = [];
				
				$("[name='field_app_list[]']:checked").each(function(){
					selectionList.push(this.value);
				});
				
				return selectionList.length ? selectionList : null;
			},
			
			getSavedSelection : function(identifier){
				var data = JSON.parse(localStorage.getItem("sctHomeAppSelection") || null);
				return data && (identifier ? data[identifier] : data) || {};
			},
			
			saveSelection : function(){
				var identifier = appSelection.getIdentifier();
				var data = appSelection.getSavedSelection();
				
				var itemName = prompt("Selection name:", appSelection.getSuggestionForItemName(identifier));
				
				if(!itemName){
					alert("Error: name can not be empty.");
					return;
				}
				
				if(!data[identifier]){
					data[identifier] = {
						totalSelectionsSaved : 1,
						selections : []
					};
				}else{
					data[identifier].totalSelectionsSaved++;
				}
				
				data[identifier].selections.push({
					name : itemName,
					apps : appSelection.getCurrentSelection() || []
				});
				
				localStorage.setItem("sctHomeAppSelection", JSON.stringify(data));
				
				appSelection.updateSelectionList(true);
			},
			
			restoreSelection : function(identifier, item){
				var selectionList = appSelection.getSavedSelection(identifier).selections[item];
				var $appList = $("[name='field_app_list[]']");
				
				$appList.filter(":checked").each(function(){
					var checkbox = this;
					checkbox.checked = false;
					nm_hid_apps_check(checkbox.value, false);
				});
				
				selectionList && selectionList.apps.forEach(function(value){
					var checkbox = $appList.filter("[value='" + value + "']").get(0);
					
					if(!checkbox){
						return;
					}
					
					checkbox.checked = true;
					nm_hid_apps_check(checkbox.value, true);
				});
				
				appSelection.updateCurrentSelectionCounter();
			},
			
			clearSavedSelection : function(){
				var identifier = appSelection.getIdentifier();
				var selectionList = appSelection.getSavedSelection(identifier).selections;
				
				for(var itemKey = selectionList.length; itemKey >= 0; itemKey--){
					appSelection.removeSavedSelection(identifier, itemKey, false);
				}
				
				appSelection.resetTotalSelectionsSaved(identifier);
				appSelection.updateSelectionList(true);
			},
			
			removeSavedSelection : function(identifier, item, updateSelectionList){
				var data = appSelection.getSavedSelection();
				
				if(!data[identifier] || !data[identifier].selections[item]){
					return;
				}
				
				data[identifier].selections.splice(item, 1);
				localStorage.setItem("sctHomeAppSelection", JSON.stringify(data));
				
				if(typeof updateSelectionList == "undefined" || updateSelectionList){
					appSelection.updateSelectionList(true);
				}
			},
			
			resetTotalSelectionsSaved : function(identifier){
				var data = appSelection.getSavedSelection();
				
				if(!data[identifier] || data[identifier].selections.length){
					return;
				}
				
				data[identifier].totalSelectionsSaved = 0;
				localStorage.setItem("sctHomeAppSelection", JSON.stringify(data));
			},
			
			selectAllApps : function(){
				$("[name='field_app_list[]']").not(":checked").each(function(){
					this.checked = true;
					nm_hid_apps_check(this.value, true);
				});
			},
			
			unselectAllApps : function(){
				$("[name='field_app_list[]']").filter(":checked").each(function(){
					this.checked = false;
					nm_hid_apps_check(this.value, false);
				});
			},
			
			selectAllOutdatedApps : function(){
				$(".nmTextDesatualizado:visible").each(function(){
					$(this).closest("tr")
						.find("[name='field_app_list[]']").not(":checked").each(function(){
							this.checked = true;
							nm_hid_apps_check(this.value, true);
						});
				});
			},
			
			unselectAllOutdatedApps : function(){
				$(".nmTextDesatualizado:visible").each(function(){
					$(this).closest("tr")
						.find("[name='field_app_list[]']").filter(":checked").each(function(){
							this.checked = false;
							nm_hid_apps_check(this.value, false);
						});
				});
			}
		};
		
		fn.init();
	}
	
	window.loadSettingsFromBackgroundPage(function(sctSettings){
		if(!sctSettings || !sctSettings.extEnabled){
			return;
		}
		
		var projectName = window.getProjectName();
		if(projectName){
			window.appendScript(document, controller, projectName, window.createHashFromString);
		}
	});
})();