/* Functions for the advlink plugin popup */
function preinit(){
	// Initialize
	tinyMCE.setWindowArg('mce_windowresize', false);
	tinyMCE.setWindowArg('mce_replacevariables', false);
}
function changeClass(){
	setValue('classes', getSelectValue('classlist'));
}
function init(){
	tinyMCEPopup.resizeToInnerSize();

    var inst = tinyMCE.getInstanceById(tinyMCE.getWindowArg('editor_id'));
	var elm = inst.getFocusElement();
	var action = "insert";
	var html;

	setHTML('anchorlistcontainer', getAnchorListHTML('anchorlist','href'));
	
	elm = tinyMCE.getParentElement(elm, "a");
	if (elm != null && elm.nodeName == "A")
		action = "update";

	setValue('insert', tinyMCE.getLang('lang_' + action, 'Insert', true)); 
	selectByValue('targetlist', jce.get('target'));

	if (action == "update") {
		var href = tinyMCE.getAttrib(elm, 'href');

		// Fix for drag-drop/copy paste bug in Mozilla
		mceRealHref = tinyMCE.getAttrib(elm, 'mce_real_href');
		if (mceRealHref != "")
			href = mceRealHref;

		href = convertURL(href, elm, true);

		var onclick = tinyMCE.cleanupEventStr(tinyMCE.getAttrib(elm, 'onclick'));

		// Setup form data
		setValue('href', href);
		setValue('title', tinyMCE.getAttrib(elm, 'title'));
		setValue('id', tinyMCE.getAttrib(elm, 'id'));
		setValue('style', tinyMCE.serializeStyle(tinyMCE.parseStyle(tinyMCE.getAttrib(elm, "style"))));
		setValue('rel', tinyMCE.getAttrib(elm, 'rel'));
		setValue('rev', tinyMCE.getAttrib(elm, 'rev'));
		setValue('charset', tinyMCE.getAttrib(elm, 'charset'));
		setValue('hreflang', tinyMCE.getAttrib(elm, 'hreflang'));
		setValue('dir', tinyMCE.getAttrib(elm, 'dir'));
		setValue('lang', tinyMCE.getAttrib(elm, 'lang'));
		setValue('tabindex', tinyMCE.getAttrib(elm, 'tabindex', typeof(elm.tabindex) != "undefined" ? elm.tabindex : ""));
		setValue('accesskey', tinyMCE.getAttrib(elm, 'accesskey', typeof(elm.accesskey) != "undefined" ? elm.accesskey : ""));
		setValue('type', tinyMCE.getAttrib(elm, 'type'));
		setValue('onfocus', tinyMCE.cleanupEventStr(tinyMCE.getAttrib(elm, 'onfocus')));
		setValue('onblur', tinyMCE.cleanupEventStr(tinyMCE.getAttrib(elm, 'onblur')));
		setValue('onclick', onclick);
		setValue('ondblclick', tinyMCE.cleanupEventStr(tinyMCE.getAttrib(elm, 'ondblclick')));
		setValue('onmousedown', tinyMCE.cleanupEventStr(tinyMCE.getAttrib(elm, 'onmousedown')));
		setValue('onmouseup', tinyMCE.cleanupEventStr(tinyMCE.getAttrib(elm, 'onmouseup')));
		setValue('onmouseover', tinyMCE.cleanupEventStr(tinyMCE.getAttrib(elm, 'onmouseover')));
		setValue('onmousemove', tinyMCE.cleanupEventStr(tinyMCE.getAttrib(elm, 'onmousemove')));
		setValue('onmouseout', tinyMCE.cleanupEventStr(tinyMCE.getAttrib(elm, 'onmouseout')));
		setValue('onkeypress', tinyMCE.cleanupEventStr(tinyMCE.getAttrib(elm, 'onkeypress')));
		setValue('onkeydown', tinyMCE.cleanupEventStr(tinyMCE.getAttrib(elm, 'onkeydown')));
		setValue('onkeyup', tinyMCE.cleanupEventStr(tinyMCE.getAttrib(elm, 'onkeyup')));
		setValue('classes', tinyMCE.getAttrib(elm, 'class'));

		// Select by the values
		selectByValue('targetlist', tinyMCE.getAttrib(elm, 'target'));
		selectByValue('dir', tinyMCE.getAttrib(elm, 'dir'));
		selectByValue('rel', tinyMCE.getAttrib(elm, 'rel'));
		selectByValue('rev', tinyMCE.getAttrib(elm, 'rev'));


		if (href.charAt(0) == '#')
			selectByValue('anchorlist', href);

		addClassesToList('classlist', 'advlink_styles');

		selectByValue('classlist', tinyMCE.getAttrib(elm, 'class'), true);
		selectByValue('targetlist', tinyMCE.getAttrib(elm, 'target'), true);
	} else
		addClassesToList('classlist', 'advlink_styles');
		
	TinyMCE_EditableSelects.init();
	window.focus();
}
function getAnchorListHTML(id, target){
	var inst = tinyMCE.getInstanceById(tinyMCE.getWindowArg('editor_id'));
	var nodes = inst.getBody().getElementsByTagName("a");

	var html = "";

	html += '<select id="' + id + '" name="' + id + '" class="mceAnchorList" onfocus="tinyMCE.addSelectAccessibility(event, this, window);" onchange="this.form.' + target + '.value=';
	html += 'this.options[this.selectedIndex].value;">';
	html += '<option value="">---</option>';

	for (var i=0; i<nodes.length; i++) {
		if ((name = tinyMCE.getAttrib(nodes[i], "name")) != "")
			html += '<option value="#' + name + '">' + name + '</option>';
	}

	html += '</select>';

	return html;
}
function checkPrefix(n) {
	if (Validator.isEmail(n) && !/^\s*mailto:/i.test(n.value) && confirm(jce.getLang('lang_is_email', false, 'The URL you entered seems to be an email address, do you want to add the required mailto: prefix?')))
		n.value = 'mailto:' + n.value;

	if (/^\s*www./i.test(n.value) && confirm(jce.getLang('lang_is_external', false, 'The URL you entered seems to external link, do you want to add the required http:// prefix?')))
		n.value = 'http://' + n.value;
};
function insertAction(){
	var inst = tinyMCE.getInstanceById(tinyMCE.getWindowArg('editor_id'));
	var elm = inst.getFocusElement();
	
	checkPrefix(getObj('href'));

	elm = tinyMCE.getParentElement(elm, "a");

	tinyMCEPopup.execCommand("mceBeginUndoLevel");

	// Create new anchor elements
	if (elm == null) {
		if (tinyMCE.isSafari)
			tinyMCEPopup.execCommand("mceInsertContent", false, '<a href="#mce_temp_url#">' + inst.selection.getSelectedHTML() + '</a>');
		else
			tinyMCEPopup.execCommand("createlink", false, "#mce_temp_url#");

		var elementArray = tinyMCE.getElementsByAttributeValue(inst.getBody(), "a", "href", "#mce_temp_url#");
		for (var i=0; i<elementArray.length; i++) {
			var elm = elementArray[i];

			// Move cursor behind the new anchor
			if (tinyMCE.isGecko) {
				var sp = inst.getDoc().createTextNode(" ");

				if (elm.nextSibling)
					elm.parentNode.insertBefore(sp, elm.nextSibling);
				else
					elm.parentNode.appendChild(sp);

				// Set range after link
				var rng = inst.getDoc().createRange();
				rng.setStartAfter(elm);
				rng.setEndAfter(elm);

				// Update selection
				var sel = inst.getSel();
				sel.removeAllRanges();
				sel.addRange(rng);
			}

			setAllAttribs(elm);
		}
	} else
		setAllAttribs(elm);

	tinyMCE._setEventsEnabled(inst.getBody(), false);
	tinyMCEPopup.execCommand("mceEndUndoLevel");
	tinyMCEPopup.close();
}
function setAllAttribs(elm){
	var href = getValue('href');
	var target = getSelectValue('targetlist');

	// Make anchors absolute
	//if (href.charAt(0) == '#' && tinyMCE.getParam('convert_urls'))
		//href = tinyMCE.settings['document_base_url'] + href;
	var link_class = getSelectValue('classlist');
	if(link_class == '') link_class = getValue('classes');
		
	setAttrib(elm, 'href', convertURL(href, elm));
	setAttrib(elm, 'mce_href', href);
	setAttrib(elm, 'title');
	setAttrib(elm, 'target', target);
	setAttrib(elm, 'id');
	setAttrib(elm, 'style');
	setAttrib(elm, 'class', link_class);
	setAttrib(elm, 'rel');
	setAttrib(elm, 'rev');
	setAttrib(elm, 'charset');
	setAttrib(elm, 'hreflang');
	setAttrib(elm, 'dir');
	setAttrib(elm, 'lang');
	setAttrib(elm, 'tabindex');
	setAttrib(elm, 'accesskey');
	setAttrib(elm, 'type');
	setAttrib(elm, 'onfocus');
	setAttrib(elm, 'onblur');
	setAttrib(elm, 'onclick');
	setAttrib(elm, 'ondblclick');
	setAttrib(elm, 'onmousedown');
	setAttrib(elm, 'onmouseup');
	setAttrib(elm, 'onmouseover');
	setAttrib(elm, 'onmousemove');
	setAttrib(elm, 'onmouseout');
	setAttrib(elm, 'onkeypress');
	setAttrib(elm, 'onkeydown');
	setAttrib(elm, 'onkeyup');

	// Refresh in old MSIE
	if (tinyMCE.isMSIE5)
		elm.outerHTML = elm.outerHTML;
}
function getTargetListHTML(elm_id, target_form_element) {
	var targets = tinyMCE.getParam('theme_advanced_link_targets', '').split(';');
	var html = '';

	html += '<select id="' + elm_id + '" name="' + elm_id + '" onfocus="tinyMCE.addSelectAccessibility(event, this, window);" onchange="this.form.' + target_form_element + '.value=';
	html += 'this.options[this.selectedIndex].value;">';

	html += '<option value="_self">' + jce.getLang('target_same', true, 'Open in this window / frame') + '</option>';
	html += '<option value="_blank">' + jce.getLang('target_blank', true, 'Open in new window') + ' (_blank)</option>';
	html += '<option value="_parent">' + jce.getLang('target_parent', true, 'Open in parent window / frame') + ' (_parent)</option>';
	html += '<option value="_top">' + jce.getLang('target_top', true, 'Open in top frame (replaces all frames)') + ' (_top)</option>';

	for (var i=0; i<targets.length; i++) {
		var key, value;

		if (targets[i] == "")
			continue;

		key = targets[i].split('=')[0];
		value = targets[i].split('=')[1];

		html += '<option value="' + key + '">' + value + ' (' + key + ')</option>';
	}

	html += '</select>';

	return html;
}
function buildAddress(){
	var address = getValue('emailadd');
    if(!Validator.isEmail(address)){
        new Alert(jce.getLang('invalid_email', true, 'Invalid e-mail address!'));
    }else{
        subj = ( getValue('emailsub') != '' ) ? '?subject=' + getValue('emailsub') : '';
        setValue('href', 'mailto:' + address + subj);
    }
}
function insertLink( val ){
	setValue('href', (!Validator.isAbsUrl( val ))  ? tinyMCE.getParam('document_base_url') + val : val);
}
function clearLists(){
	setHTML('list_level_2', '');
	setHTML('list_level_2_label', '');
	setHTML('list_level_3', '');
	setHTML('list_level_3_label', '');
}
function setSelectList(id, label, html){
	html = xmlDecode(html);
	setHTML(id + '_label', label);
	setHTML(id, html);
	getObj('loader').src = jce.getLibImg('spacer.gif');	
}
function loadType( type, id ){
	getObj('loader').src = jce.getLibImg('load.gif');
	var values = new Array(type, id);
	jce.ajaxSend('getByType', values);
}
// While loading
preinit();