/** 
 * 封装micro-templating。处理boss state与页面显示的转换，以及界面上的所有操作。
 */

var assistant = (function() {

var _template = '<script type="text/html" id="gtalklet_template">\
	<div id="gtalklet_layer" data-blocked="<%=ui.blocked%>" data-shy="<%=ui.shy%>" zoom="<%=ui.zoom%>" style="zoom:<%=ui.zoom%>; -webkit-text-size-adjust:none">\
		<style type="text/css" style="display:none!important">#gtalklet_layer {bottom: -500px; height: 0px; display:none!important}</style>\
\
		<link rel="stylesheet" href="<%=chrome.extension.getURL(\'css/\' + options.ALIGN + \'.css\')%>" id="gtalklet_css" media="screen"></link>\
\
		<%/*信息提示*/%>\
		<div id="gtalklet_info" class="gtalklet_panel" style="display:none">\
			<div class="gtalklet_title_bar <%=ui.log.level%>" data-switch-class="<%=ui.log.level%>" data-keep="<%=ui.log.keep%>">\
				<div class="gtalklet_info"><%=ui.log.message%></div>\
			</div>\
		</div>\
\
		<%/*新建聊天线程按钮*/%>\
		<div id="gtalklet_operation" class="gtalklet_panel" data-switch-class="" <% if (!user.signedin) { %>style="display:none"<% } %>>\
			<div class="gtalklet_title_bar">\
				<% if (ui.filter.state == "collapsed") { %>\
					<div class="gtalklet_icon_button gtalklet_toggle_filter open" data-switch-class="open"></div>\
				<% } else {%>\
					<div class="gtalklet_icon_button gtalklet_toggle_filter close" data-switch-class="close"></div>\
				<% } %>\
			</div>\
		</div>\
\
		<%/*新建聊天线程面板*/%>\
		<div id="gtalklet_filter_panel" class="gtalklet_panel <%=ui.filter.state%>" data-switch-class="<%=ui.filter.state%>">\
			<div class="gtalklet_panel_content_wrapper">\
				<div class="gtalklet_panel_content">\
					<div class="gtalklet_contacts gtalklet_scroll">\
						<% if (ui.filter.matchedContactsSum > ui.filter.matchedContacts.length) { %>\
							<div class="gtalklet_message"><%=ui.filter.matchedContactsSum%> matches</div>\
						<% } %>\
						<% if (ui.filter.matchedContactsSum > 0) { %>\
							<div class="gtalklet_message prototype"></div>\
							<% for(i in ui.filter.matchedContacts) { %>\
								<div class="gtalklet_contact" data-jid="<%=ui.filter.matchedContacts[i].jid%>">\
									<div class="gtalklet_contact_wrapper">\
										<div class="gtalklet_presence <%=ui.filter.matchedContacts[i].presence.type%>" data-switch-class="<%=ui.filter.matchedContacts[i].presence.type%>" title="<%=ui.filter.matchedContacts[i].presence.message%>"></div>\
										<div class="gtalklet_contact_name"><%=ui.filter.matchedContacts[i].name%></div>\
										<div class="gtalklet_contact_jid"><%=ui.filter.matchedContacts[i].displayJid%></div>\
										<img class="gtalklet_contact_avatar" src="<%=ui.filter.matchedContacts[i].avatar%>" />\
									</div>\
								</div>\
							<% } %>\
						<% } else { %>\
							<% if (ui.filter.filter == "") { %>\
								<div class="gtalklet_message prototype"></div>\
								<div class="gtalklet_message"><span class="gtalklet_clear"><%=chrome.i18n.getMessage("searchInAllContacts")%></span></div>\
							<% } else { %>\
								<div class="gtalklet_message prototype"></div>\
								<div class="gtalklet_message"><%=chrome.i18n.getMessage("noMatchingContacts")%></div>\
							<% } %>\
						<% } %>\
					</div>\
				</div>\
			</div>\
\
			<input type="input" class="gtalklet_filter <% if (ui.filter.invite == "invalid") { %>invalid<% } %>" placeholder="<%=chrome.i18n.getMessage("createConversation")%>" spellcheck="false" value="<%=ui.filter.filter%>" <% if (ui.filter.invite == "invalid") { %>title="<%=chrome.i18n.getMessage("invalidJid", ui.filter.filter)%>"<% } %> />\
\
			<% if (typeof ui.filter.invite != "undefined") { %>\
				<% if (ui.filter.matchedContactsSum || !ui.filter.filter) { %>\
					<div class="gtalklet_invite gtalklet_icon_button" title="<%=chrome.i18n.getMessage("inviteToChat")%>" style="display:none"></div>\
					<div class="gtalklet_all_contacts gtalklet_icon_button" title="<%=chrome.i18n.getMessage("showAllContacts")%>"></div>\
				<% } else { %>\
					<div class="gtalklet_invite gtalklet_icon_button" title="<%=chrome.i18n.getMessage("inviteToChat")%>"></div>\
					<div class="gtalklet_all_contacts gtalklet_icon_button" title="<%=chrome.i18n.getMessage("showAllContacts")%>" style="display:none"></div>\
				<% } %>\
			<% } else if (ui.filter.invite == "invalid") { %>\
				<% if (!ui.filter.filter) { %>\
					<div class="gtalklet_invite gtalklet_icon_button" title="<%=chrome.i18n.getMessage("inviteToChat")%>" style="display:none"></div>\
					<div class="gtalklet_all_contacts gtalklet_icon_button" title="<%=chrome.i18n.getMessage("showAllContacts")%>"></div>\
				<% } else { %>\
					<div class="gtalklet_invite gtalklet_icon_button" title="<%=chrome.i18n.getMessage("inviteToChat")%>"></div>\
					<div class="gtalklet_all_contacts gtalklet_icon_button" title="<%=chrome.i18n.getMessage("showAllContacts")%>" style="display:none"></div>\
				<% } %>\
			<% } else if (ui.filter.invite == "invited") { %>\
				<div class="gtalklet_invite gtalklet_icon_button invited" title="<%=chrome.i18n.getMessage("invited")%>"></div>\
				<div class="gtalklet_all_contacts gtalklet_icon_button" title="<%=chrome.i18n.getMessage("showAllContacts")%>" style="display:none"></div>\
			<% } else { %>\
				<div class="gtalklet_invite gtalklet_icon_button" title="<%=chrome.i18n.getMessage("inviteToChat")%>" style="display:none"></div>\
				<div class="gtalklet_all_contacts gtalklet_icon_button" title="<%=chrome.i18n.getMessage("showAllContacts")%>"></div>\
			<% } %>\
\
		</div>\
\
		<%/*聊天面板*/%>\
		<% for(i in threads) { %>\
			<% if (threads[i].ui.state !== "collapsed") { %>\
				<div class="gtalklet_thread gtalklet_panel <%=threads[i].ui.state%><%=\' \'%><%=threads[i].unread%><%=\' \'%><%=threads[i].prototype%>" data-thread-id="<%=threads[i].id%>" data-jid="<%=threads[i].user.jid%>" data-switch-class="<%=threads[i].ui.state%>">\
					<div class="gtalklet_title_bar">\
						<div class="gtalklet_presence <%=threads[i].user.presence.type%>" title="<%=threads[i].user.presence.message%>" data-switch-class="<%=threads[i].user.presence.type%>" ></div>\
						<div class="gtalklet_contact_name" title="<%=threads[i].user.displayJid%>">\
							<%=threads[i].user.name%>\
						</div>\
						<div class="gtalklet_close_thread"></div>\
					</div>\
					<div class="gtalklet_panel_content_wrapper">\
						<div class="gtalklet_panel_content">\
							<div class="gtalklet_toolbar_handler">\
								<div class="gtalklet_toolbar">\
									<div class="gtalklet_icon_button gtalklet_clear_timeline" title="Clear Messages"></div>\
									<div class="gtalklet_icon_button gtalklet_go_off_record" title="Go off the record"></div>\
									<div style="clear: both;"></div>\
								</div>\
							</div>\
							<div class="gtalklet_timeline gtalklet_scroll" data-scroll="<%=threads[i].ui.scrollTop%>">\
								<% for(mi in threads[i].messages) { %>\
									<div class="gtalklet_message <%=threads[i].messages[mi].type%><%=\' \'%><%=threads[i].messages[mi].prototype%>">\
										<% if(threads[i].messages[mi].showTime) {%>\
											<div class="gtalklet_time"><%=threads[i].messages[mi].time%></div>\
										<% } %>\
										<div class="gtalklet_message_wrapper" title="<%=threads[i].messages[mi].time%>">\
											<%=threads[i].messages[mi].content%>\
										</div>\
									</div>\
								<% } %>\
								<img src="<%=chrome.extension.getURL(\'1.gif\')%>" class="gtalklet_loader" style="display:none"/>\
							</div>\
							<form class="gtalklet_chat_form">\
								<textarea name="gtalklet_chat" class="gtalklet_clear" placeholder="<%=chrome.i18n.getMessage("enterToSend")%>" style="height: <%=threads[i].ui.messagebox.height%>px;" <% if (threads[i].ui.messagebox.disabled) { %>disabled="disabled"<% } %>><%=threads[i].ui.messagebox.typing%></textarea>\
							</form>\
							<div class="gtalklet_chat_form_mask" <% if (!threads[i].ui.messagebox.disabled) { %> style="display:none"<% } %>></div>\
						</div>\
					</div>\
				</div>\
			<% } %>\
		<% } %>\
\
		<%/*控制台*/%>\
		<div id="gtalklet_console" class="gtalklet_panel <%=ui.console.state%><%=\' \'%><% if (user.pendingThreads.length > 0) { %>unread<% } %>" data-switch-class="<%=ui.console.state%>">\
			<div class="gtalklet_title_bar">\
\
				<% if (false && mail) { %>\
				<div class="gtalklet_icon_button gtalklet_new_mail">\
					<div class="gtalklet_badge"><%=mail.unread%></div>\
				</div>\
				<% } %>\
\
				<div class="gtalklet_icon_button gtalklet_new_message" data-pending-thread-ids="<%=user.pendingThreads%>">\
					<div class="gtalklet_badge"><%=user.pendingThreads.length%></div>\
				</div>\
\
				<div class="gtalklet_icon_button gtalklet_my_presence">\
					<% if (user.presence.invisible) { %>\
					<div class="gtalklet_presence invisible" title="<%=user.jid%>" data-switch-class="invisible"></div>\
					<% } else { %>\
					<div class="gtalklet_presence <%=user.presence.type%>" title="<%=user.jid%>" data-switch-class="<%=user.presence.type%>"></div>\
					<% } %>\
					<div class="gtalklet_jump_list <%=ui.console.jumpListState %>" data-switch-class="<%=ui.console.jumpListState%>">\
						<div class="gtalklet_jump_list_item gtalklet_icon_button gtalklet_options" title="<%=chrome.i18n.getMessage("options")%>"></div>\
						<% for(i in ui.console.commands) { %>\
							<div class="gtalklet_jump_list_item gtalklet_icon_button gtalklet_presence <%=ui.console.commands[i].classes%>" title="<%=ui.console.commands[i].title%>" data-presence="<%=ui.console.commands[i].classes%>"></div>\
						<% } %>\
					</div>\
				</div>\
			</div>\
		</div>\
\
		<%/*原型*/%>\
		<div id="gtalklet_prototype" style="display:none">\
			<div class="gtalklet_contact prototype" data-jid="">\
				<div class="gtalklet_contact_wrapper">\
					<div class="gtalklet_presence" data-switch-class=""></div>\
					<div class="gtalklet_contact_name"></div>\
					<div class="gtalklet_contact_jid"></div>\
					<img class="gtalklet_contact_avatar" src="" />\
				</div>\
			</div>\
		</div>\
	</div>\
</script>';

var $ = null,
	$window = null, 
	$layer = null,

	_features = {},
	_actions = {},
	SELECTORS = {},

	maxThread = 999,

init = function(_$) {
	$ = _$;
	$window = $(window);
},

registerFeature = function(featureName, feature) {
	_features[featureName] = feature;

	for (var method in feature.actions) {
		if (!_actions[method]) {
			_actions[method] = [];
		}
		var temp = feature.actions[method];
		temp.parentFeature = featureName;
		_actions[method].push(temp);
	}

	$.extend(true, SELECTORS, feature.selectors);
},

loadFeature = function(featureName) {
	_loadFeature(featureName);
},

/*
addSelectors = function(selectorName, selector) {
	this.SELECTORS[selectorName] = selector;
},
*/

/**
 * 处理boss的state变化，更新显示
 */
handleStateChange = function(stateChange) {
	// 存在适当名字的action，执行action的callback
	var report = stateChange.report;
	if (_actions[report]) {
		for (var index in _actions[report]) {
			if (_features[_actions[report][index].parentFeature].loaded && _actions[report][index].callback) {
				_actions[report][index].callback(stateChange.returns);
			}
		}
	}
},

/**
 * 用state重建整个ui
 */
build = function(state, effect) {
	var $body = $('body');

	// 如果还未注入模板，注入模板
	if ($('#gtalklet_template').length === 0) {
		$body.append(_template.replace(/\>\s*\</g, '><'));
	}

	// 如果还未注入gtalklet层，注入gtalklet层
	if ($('#gtalklet_layer').length === 0) {
		// TODO dirty fix
		if (location.host == 'ifttt.com') {
			$body.prepend('<div id="gtalklet_layer" style="display:none"></div>');
		} else {
			$body.append('<div id="gtalklet_layer" style="display:none"></div>');
		}
	}
	// 建立layer html结构
	$('#gtalklet_layer').replaceWith(_render($.extend(true, state.state, {options: state.options})));

	$layer = $('#gtalklet_layer');

	// 判断content_script中的css有没有成功载入，如果没有，手动载入
	if ($layer.css('position') !== 'fixed') {
		var url = chrome.extension.getURL('css/style.css');
		$("<link rel='stylesheet' type='text/css' href='" + url + "' />").appendTo($body); 
	}

	if (!$layer.attr('data-x')) {
		// 重建事件, js预处理
		_prepare(state.loadedFeatures);
	}

	// 显示启用特效
	if (effect) {
		$layer.css('bottom', '-500px').animate({bottom:'0px'}, 'fast', function() {
			$(this).removeAttr('style');
		});
	} else {
		$layer.show();
	}
},

/**
 *
 */
destroy = function(effect) {
	if (effect) {
		$layer.animate({bottom:'-500px'},'slow', function() {
			$(this).attr('data-x', true).hide();
		});
	} else {
		for (featureName in _features) {
			_features[featureName].loaded = false;
		}

		$layer.remove();
	}

},

freeze = function() {
	// TODO 
	$(SELECTORS.sensitive).block({
		message: null,
		overlayCSS: {
			cursor: 'auto'
		},
	}).find('textarea, input').blur();

	var $info = $('#gtalklet_info');
	var message = '<div class="gtalklet_clear" title="' + chrome.i18n.getMessage('interfaceCrashed') + '">' + chrome.i18n.getMessage('oops') + ' [<a class="gtalklet_reload" onclick="javascript:location.reload(true)">' + chrome.i18n.getMessage('reload') + '</a>]</div>';
	var $infoTitleBar = $info.find('div.gtalklet_title_bar');
	var level = 'error';
	$info.find('div.gtalklet_info').html(message).end().show();
	$('.gtalklet_title_bar', $info).switchToClass(level).attr('data-keep', true);
},

callAction = function(action, method, parameters) {
	_callActionIfExists(action, method, parameters);
},

_callActionIfExists = function(action, method, parameters) {
	if (_actions[action]) {
		for (var index in _actions[action]) {
			if (_features[_actions[action][index].parentFeature].loaded && _actions[action][index][method]) {
				_actions[action][index][method].apply(_actions[action][index], parameters);
			}
		}
	}
},

/**
 * 重建事件, js预处理
 */
_prepare = function(loadedFeatures) {
	for (feature in loadedFeatures) {
		_loadFeature(feature);
	}
},

/**
 * 加载feature, 且之加载一次
 */
_loadFeature = function(featureName) {
	if (_features[featureName]) {
		if (!$layer.data('loaded' + featureName)) {
			$layer.data('loaded' + featureName, 'true');
			_features[featureName]['loaded'] = true;
			if (_features[featureName]['actions']) {
				for (index in _features[featureName]['actions']) {
					if (_features[featureName]['actions'][index].load) {
						_features[featureName]['actions'][index].load();
					}
				}
				for (index in _features[featureName]['actions']) {
					if (_features[featureName]['actions'][index].delegate) {
						_features[featureName]['actions'][index].delegate();
					}
				}
			}
		}
	}
},

/**
 * 
 */
_render = function(state) {
	if ($.isEmptyObject(state)) {
		return '';
	} else {
		return tmpl('gtalklet_template', state);
	}
};

return {
	init: init,
	build: build,
	destroy: destroy,
	freeze: freeze,

	registerFeature: registerFeature,
	loadFeature: loadFeature,
	handleStateChange: handleStateChange,
	callAction: callAction,

	$layer: function() {return $layer;},
	$window: function() {return $window;},
	selectors: function() {return SELECTORS;}
};

})();
