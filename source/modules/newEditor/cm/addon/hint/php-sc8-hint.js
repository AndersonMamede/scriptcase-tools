window.ScriptCase8MacrosHint = [
	{
		displayText : "sc_begin_trans",
		text : "sc_begin_trans",
		code : 'sc_begin_trans("Connection")'
	},
	{
		displayText : "sc_change_connection",
		text : "sc_change_connection",
		code : 'sc_change_connection("Old_Connection", "New_Connection")'
	},
	{
		displayText : "sc_commit_trans",
		text : "sc_commit_trans",
		code : 'sc_commit_trans("Connection")'
	},
	{
		displayText : "sc_concat",
		text : "sc_concat",
		code : 'sc_concat()'
	},
	{
		displayText : "sc_connection_edit",
		text : "sc_connection_edit",
		code : 'sc_connection_edit("Connection_Name", $arr_conn)'
	},
	{
		displayText : "sc_connection_new",
		text : "sc_connection_new",
		code : 'sc_connection_new("Connection_Name", $arr_conn)'
	},
	{
		displayText : "sc_error_continue",
		text : "sc_error_continue",
		code : 'sc_error_continue("Event")'
	},
	{
		displayText : "sc_exec_sql",
		text : "sc_exec_sql",
		code : 'sc_exec_sql("SQL Command", "Connection")'
	},
	{
		displayText : "sc_lookup",
		text : "sc_lookup",
		code : 'sc_lookup(Dataset, "SQL Command", "Connection")'
	},
	{
		displayText : "sc_reset_change_connection",
		text : "sc_reset_change_connection",
		code : '{sc_reset_change_connection}'
	},
	{
		displayText : "sc_reset_connection_edit",
		text : "sc_reset_connection_edit",
		code : '{sc_reset_connection_edit}'
	},
	{
		displayText : "sc_reset_connection_new",
		text : "sc_reset_connection_new",
		code : '{sc_reset_connection_new}'
	},
	{
		displayText : "sc_select",
		text : "sc_select",
		code : 'sc_select(dataset, "SQL Command", "Connection")'
	},
	{
		displayText : "sc_set_fetchmode",
		text : "sc_set_fetchmode",
		code : 'sc_set_fetchmode(parm);'
	},
	{
		displayText : "sc_sql_injection",
		text : "sc_sql_injection",
		code : 'sc_sql_injection({My_Field}) or ($My_Variable)'
	},
	{
		displayText : "sc_date",
		text : "sc_date",
		code : 'sc_date(Date, "Format", "Operator", D, M, Y)'
	},
	{
		displayText : "sc_date_conv",
		text : "sc_date_conv",
		code : 'sc_date_conv({Field_Date}, "Input_Format", "Output_Format")'
	},
	{
		displayText : "sc_date_dif",
		text : "sc_date_dif",
		code : 'sc_date_dif({Date1}, "Format Date1", {Date2}, "Format Date2")'
	},
	{
		displayText : "sc_date_dif_2",
		text : "sc_date_dif_2",
		code : 'sc_date_dif_2({Date1}, "Format Date1", {Date2}, "Format Date2", Option)'
	},
	{
		displayText : "sc_time_diff",
		text : "sc_time_diff",
		code : 'sc_time_diff({datetime_01}, "Date_01 Format", {datetime_02}, "Date_02 Format")'
	},
	{
		displayText : "sc_apl_conf",
		text : "sc_apl_conf",
		code : 'sc_apl_conf("Application", "Property", "Value")'
	},
	{
		displayText : "sc_calc_dv",
		text : "sc_calc_dv",
		code : 'sc_calc_dv(Digit, Rest, Value, Module, Weights, Type)'
	},
	{
		displayText : "sc_decode",
		text : "sc_decode",
		code : 'sc_decode({My_Field})'
	},
	{
		displayText : "sc_encode",
		text : "sc_encode",
		code : 'sc_encode({My_Field})'
	},
	{
		displayText : "sc_error_exit",
		text : "sc_error_exit",
		code : 'sc_error_exit(URL, "Target") or (My_Application, "Target")'
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
		displayText : "sc_get_language",
		text : "sc_get_language",
		code : '{sc_get_language}'
	},
	{
		displayText : "sc_get_regional",
		text : "sc_get_regional",
		code : '{sc_get_regional}'
	},
	{
		displayText : "sc_get_theme",
		text : "sc_get_theme",
		code : '{sc_get_theme}'
	},
	{
		displayText : "sc_image",
		text : "sc_image",
		code : 'sc_image(Image01.jpg)'
	},
	{
		displayText : "sc_include",
		text : "sc_include",
		code : 'sc_include("File", "Source")'
	},
	{
		displayText : "sc_include_library",
		text : "sc_include_library",
		code : 'sc_include_library("Target", "Library Name", "File", "include_once", "Require")'
	},
	{
		displayText : "sc_label",
		text : "sc_label",
		code : 'sc_label({My_Field})'
	},
	{
		displayText : "sc_language",
		text : "sc_language",
		code : '{sc_language}'
	},
	{
		displayText : "sc_mail_send",
		text : "sc_mail_send",
		code : 'sc_mail_send(SMTP, Usr, Pw, From, To, Subject, Message, Mens_Type, Copies, Copies_Type, Port, Connection_Type, Attachment, SSL)'
	},
	{
		displayText : "sc_master_value",
		text : "sc_master_value",
		code : 'sc_master_value("Object", Value)'
	},
	{
		displayText : "sc_redir",
		text : "sc_redir",
		code : 'sc_redir(Application, Parameter01; Parameter02; Target, Error, height_modal, width_modal)'
	},
	{
		displayText : "sc_reset_global",
		text : "sc_reset_global",
		code : 'sc_reset_global([Global_Variable1], [Global_Variable2] ...)'
	},
	{
		displayText : "sc_set_global",
		text : "sc_set_global",
		code : 'sc_set_global($variable_01) or ({My_Field})'
	},
	{
		displayText : "sc_set_language",
		text : "sc_set_language",
		code : 'sc_set_language("String Language")'
	},
	{
		displayText : "sc_set_regional",
		text : "sc_set_regional",
		code : 'sc_set_regional("String Regional")'
	},
	{
		displayText : "sc_set_theme",
		text : "sc_set_theme",
		code : 'sc_set_theme("String Theme")'
	},
	{
		displayText : "sc_site_ssl",
		text : "sc_site_ssl",
		code : '{sc_site_ssl}'
	},
	{
		displayText : "sc_trunc_num",
		text : "sc_trunc_num",
		code : 'sc_trunc_num({My_Field}, Decimal_Number)'
	},
	{
		displayText : "sc_url_exit",
		text : "sc_url_exit",
		code : 'sc_url_exit(URL)'
	},
	{
		displayText : "sc_url_library",
		text : "sc_url_library",
		code : 'sc_url_library("Target", "Library Name", "File")'
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
		displayText : "sc_apl_status",
		text : "sc_apl_status",
		code : 'sc_apl_status("Application", "Status")'
	},
	{
		displayText : "sc_reset_apl_conf",
		text : "sc_reset_apl_conf",
		code : 'sc_reset_apl_conf("Application", "Property")'
	},
	{
		displayText : "sc_reset_apl_status",
		text : "sc_reset_apl_status",
		code : '{sc_reset_apl_status}'
	},
	{
		displayText : "sc_user_logout",
		text : "sc_user_logout",
		code : 'sc_user_logout("variable_name", "variable_content", "apl_redir.php", "target")'
	},
	{
		displayText : "sc_block_display",
		text : "sc_block_display",
		code : 'sc_block_display(Block_Name, on/off)'
	},
	{
		displayText : "sc_field_display",
		text : "sc_field_display",
		code : 'sc_field_display({My_Field}, on/off)'
	},
	{
		displayText : "sc_field_readonly",
		text : "sc_field_readonly",
		code : 'sc_field_readonly({Field}, on/off)'
	},
	{
		displayText : "sc_format_num",
		text : "sc_format_num",
		code : 'sc_format_num({My_Field}, "Group_Symb", "Dec_Symb", "Amount_Dec", "Fill_Zeros", "Side_Neg", "Currency_Symb", "Side_Currency_Symb")'
	},
	{
		displayText : "sc_format_num_region",
		text : "sc_format_num_region",
		code : 'sc_format_num_region({My_Field}, "Qtde_Dec", "Insert_Zeros", "Monetary_Sym")'
	},
	{
		displayText : "sc_form_show",
		text : "sc_form_show",
		code : 'sc_form_show = "on" or "off";'
	},
	{
		displayText : "sc_set_focus",
		text : "sc_set_focus",
		code : 'sc_set_focus("Field")'
	},
	{
		displayText : "sc_btn_display",
		text : "sc_btn_display",
		code : 'sc_btn_display("Button_Name","on/off")'
	}
];