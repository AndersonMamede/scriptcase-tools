window.ScriptCase7MacrosHint = [
	{
		displayText : "sc_begin_trans",
		text : "sc_begin_trans",
		code : 'sc_begin_trans("Connection")'
	},
	{
		displayText : "sc_commit_trans",
		text : "sc_commit_trans",
		code : 'sc_commit_trans("Connection")'
	},
	{
		displayText : "sc_error_continue",
		text : "sc_error_continue",
		code : 'sc_error_continue("Event")'
	},
	{
		displayText : "sc_error_delete",
		text : "sc_error_delete",
		code : '{sc_error_delete}'
	},
	{
		displayText : "sc_error_insert",
		text : "sc_error_insert",
		code : '{sc_error_insert}'
	},
	{
		displayText : "sc_error_update",
		text : "sc_error_update",
		code : '{sc_error_update}'
	},
	{
		displayText : "sc_exec_sql",
		text : "sc_exec_sql",
		code : 'sc_exec_sql("SQL Command", "Connection")'
	},
	{
		displayText : "sc_lookup",
		text : "sc_lookup",
		code : 'sc_lookup(dataset, "SQL Command", "Connection")'
	},
	{
		displayText : "sc_rollback_trans",
		text : "sc_rollback_trans",
		code : 'sc_rollback_trans("Connection")'
	},
	{
		displayText : "sc_select",
		text : "sc_select",
		code : 'sc_select(dataset, "SQL Command", "Connection")'
	},
	{
		displayText : "sc_select_field",
		text : "sc_select_field",
		code : 'sc_select_field({Field})'
	},
	{
		displayText : "sc_select_order",
		text : "sc_select_order",
		code : 'sc_select_order("Field")'
	},
	{
		displayText : "sc_select_where",
		text : "sc_select_where",
		code : 'sc_select_where(add)'
	},
	{
		displayText : "sc_sql_injection",
		text : "sc_sql_injection",
		code : 'sc_sql_injection({Field} or $Variable)'
	},
	{
		displayText : "sc_where_current",
		text : "sc_where_current",
		code : '{sc_where_current}'
	},
	{
		displayText : "sc_where_orig",
		text : "sc_where_orig",
		code : '{sc_where_orig}'
	},
	{
		displayText : "sc_date",
		text : "sc_date",
		code : 'sc_date(date, format, operator, D, M, Y)'
	},
	{
		displayText : "sc_date_conv",
		text : "sc_date_conv",
		code : 'sc_date_conv({Field_date}, "Input_format", "Output_format")'
	},
	{
		displayText : "sc_date_dif",
		text : "sc_date_dif",
		code : 'sc_date_dif(date1, "date1 format", date2, "date2 format")'
	},
	{
		displayText : "sc_date_dif_2",
		text : "sc_date_dif_2",
		code : 'sc_date_dif_2(date1, "date1 format", date2, "date2 format", option)'
	},
	{
		displayText : "sc_date_empty",
		text : "sc_date_empty",
		code : 'sc_date_empty({Field_date})'
	},
	{
		displayText : "sc_alert",
		text : "sc_alert",
		code : 'sc_alert("Message")'
	},
	{
		displayText : "sc_apl_conf",
		text : "sc_apl_conf",
		code : 'sc_apl_conf("Application", "Property", "Value")'
	},
	{
		displayText : "sc_calc_dv",
		text : "sc_calc_dv",
		code : 'sc_calc_dv(digit, rest, value, module, weights, type)'
	},
	{
		displayText : "sc_changed",
		text : "sc_changed",
		code : 'sc_changed({Field})'
	},
	{
		displayText : "sc_confirm",
		text : "sc_confirm",
		code : 'sc_confirm("Message")'
	},
	{
		displayText : "sc_decode",
		text : "sc_decode",
		code : 'sc_decode({Field} or $Variable)'
	},
	{
		displayText : "sc_encode",
		text : "sc_encode",
		code : 'sc_encode({Field} or $Variable)'
	},
	{
		displayText : "sc_error_exit",
		text : "sc_error_exit",
		code : 'sc_error_exit("URL or Application", "Target")'
	},
	{
		displayText : "sc_error_message",
		text : "sc_error_message",
		code : 'sc_error_message("Text")'
	},
	{
		displayText : "sc_exit",
		text : "sc_exit",
		code : 'sc_exit(Option)'
	},
	{
		displayText : "sc_groupby_label",
		text : "sc_groupby_label",
		code : 'sc_groupby_label("Field")'
	},
	{
		displayText : "sc_image",
		text : "sc_image",
		code : 'sc_image(img1.jpg, img2.gif, ...)'
	},
	{
		displayText : "sc_include",
		text : "sc_include",
		code : 'sc_include("File", "Source")'
	},
	{
		displayText : "sc_label",
		text : "sc_label",
		code : 'sc_label({Field})'
	},
	{
		displayText : "sc_link",
		text : "sc_link",
		code : 'sc_link(column, application, parameters, "hint", "target", height, width)'
	},
	{
		displayText : "sc_mail_send",
		text : "sc_mail_send",
		code : 'sc_mail_send(smtp, usr, pw, from, to, subject, message, mens_type, copies, copies_type, port, connection_type, attachment)'
	},
	{
		displayText : "sc_make_link",
		text : "sc_make_link",
		code : 'sc_make_link(application, parameters)'
	},
	{
		displayText : "sc_master_value",
		text : "sc_master_value",
		code : 'sc_master_value("object", value)'
	},
	{
		displayText : "sc_redir",
		text : "sc_redir",
		code : 'sc_redir(application, parameter1; parameter2; ..., target, error)'
	},
	{
		displayText : "sc_reset_global",
		text : "sc_reset_global",
		code : 'sc_reset_global([global_variable1], [global_variable2] ...)'
	},
	{
		displayText : "sc_seq_register",
		text : "sc_seq_register",
		code : '{sc_seq_register}'
	},
	{
		displayText : "sc_set_global",
		text : "sc_set_global",
		code : 'sc_set_global({Field} or $Variable)'
	},
	{
		displayText : "sc_site_ssl",
		text : "sc_site_ssl",
		code : 'sc_site_ssl'
	},
	{
		displayText : "sc_trunc_num",
		text : "sc_trunc_num",
		code : 'sc_trunc_num({Field}, Decimal_number)'
	},
	{
		displayText : "sc_url_exit",
		text : "sc_url_exit",
		code : 'sc_url_exit(URL)'
	},
	{
		displayText : "sc_warning",
		text : "sc_warning",
		code : 'sc_warning = "on" or "off";'
	},
	{
		displayText : "sc_zip_file",
		text : "sc_zip_file",
		code : 'sc_zip_file("File", "Zip")'
	},
	{
		displayText : "sc_lin_cod_barra_arrecadacao (PT-BR)",
		text : "sc_lin_cod_barra_arrecadacao",
		code : 'sc_lin_cod_barra_arrecadacao(cod_barra, cod_seguimento, cod_moeda, valor, livre)'
	},
	{
		displayText : "sc_lin_cod_barra_banco (PT-BR)",
		text : "sc_lin_cod_barra_banco",
		code : 'sc_lin_cod_barra_banco(cod_barra, cod_banco, cod_moeda, valor, livre, dt_venc)'
	},
	{
		displayText : "sc_lin_digitavel_arrecadacao (PT-BR)",
		text : "sc_lin_digitavel_arrecadacao",
		code : 'sc_lin_digitavel_arrecadacao(lin_digitavel, cod_barras)'
	},
	{
		displayText : "sc_lin_digitavel_banco (PT-BR)",
		text : "sc_lin_digitavel_banco",
		code : 'sc_lin_digitavel_banco(lin_digitavel, cod_barras)'
	},
	{
		displayText : "sc_where_filter",
		text : "sc_where_filter",
		code : '{sc_where_filter}'
	},
	{
		displayText : "sc_apl_status",
		text : "sc_apl_status",
		code : 'sc_apl_status("application", "on or off")'
	},
	{
		displayText : "sc_reset_apl_conf",
		text : "sc_reset_apl_conf",
		code : 'sc_reset_apl_conf("application", "property")'
	},
	{
		displayText : "sc_reset_apl_status",
		text : "sc_reset_apl_status",
		code : 'sc_reset_apl_status()'
	},
	{
		displayText : "sc_reset_menu_delete",
		text : "sc_reset_menu_delete",
		code : 'sc_reset_menu_delete()'
	},
	{
		displayText : "sc_reset_menu_disable",
		text : "sc_reset_menu_disable",
		code : 'sc_reset_menu_disable()'
	},
	{
		displayText : "sc_block_display",
		text : "sc_block_display",
		code : 'sc_block_display(Block_name, on/off)'
	},
	{
		displayText : "sc_field_color",
		text : "sc_field_color",
		code : 'sc_field_color("Field", "Color")'
	},
	{
		displayText : "sc_field_display",
		text : "sc_field_display",
		code : 'sc_field_display({Field}, on/off)'
	},
	{
		displayText : "sc_field_readonly",
		text : "sc_field_readonly",
		code : 'sc_field_readonly({Field}, on/off)'
	},
	{
		displayText : "sc_format_num",
		text : "sc_format_num",
		code : 'sc_format_num({Field}, "Group_Symb", "Dec_Symb", "Amount_Dec", "Fill_Zeros", "Side_Neg", "Currency_Symb", "Side_Currency_Symb")'
	},
	{
		displayText : "sc_form_show",
		text : "sc_form_show",
		code : 'sc_form_show = "on"/"off"'
	},
	{
		displayText : "sc_set_focus",
		text : "sc_set_focus",
		code : 'sc_set_focus("Field")'
	},
	{
		displayText : "sc_vl_extenso (PT-BR)",
		text : "sc_vl_extenso",
		code : 'sc_vl_extenso(valor, tam_linha, tipo)'
	},
	{
		displayText : "sc_btn_delete",
		text : "sc_btn_delete",
		code : 'sc_btn_delete'
	},
	{
		displayText : "sc_btn_display",
		text : "sc_btn_display",
		code : 'sc_btn_display("Button_name", "on/off")'
	},
	{
		displayText : "sc_btn_insert",
		text : "sc_btn_insert",
		code : 'sc_btn_insert'
	},
	{
		displayText : "sc_btn_new",
		text : "sc_btn_new",
		code : 'sc_btn_new'
	},
	{
		displayText : "sc_btn_update",
		text : "sc_btn_update",
		code : 'sc_btn_update'
	},
	{
		displayText : "sc_menu_delete",
		text : "sc_menu_delete",
		code : 'sc_menu_deleteid_item1,id_item2,...'
	},
	{
		displayText : "sc_menu_disable",
		text : "sc_menu_disable",
		code : 'sc_menu_disableid_item1,id_item2,...'
	},
	{
		displayText : "sc_menu_item",
		text : "sc_menu_item",
		code : '{sc_menu_item}'
	},
	{
		displayText : "sc_script_name",
		text : "sc_script_name",
		code : '{sc_script_name}'
	}
];