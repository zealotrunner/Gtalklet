(function(boss, s) {
	var featureName = 'xmpp_invite';

	s.addStateConstants({
		INVITATION_STATE: { //邀请状态, 未发送邀请|已发送邀请|jid非法
			NORMAL: '',
			INVITED: 'invited',
			INVALID: 'invalid',
		},
	});

	boss.registerFeature(featureName, 'm', {
		register : function() {
		},
		load : function() {
			if (!s.featureLoaded(featureName)) {
				s.loadedFeature(featureName);
			}

			s.addState({
				ui: {
					filter: {
						invite: s.constants.INVITATION_STATE.NORMAL, //邀请状态, 未发送邀请|已发送邀请|jid非法
					}
				},
			}, false);

			s.addHandler('filter', this.filter.bind(this));
			s.addHandler('invite', this.invite.bind(this));
			s.addHandler('acceptInvitation', this.acceptInvitation.bind(this));
			s.addHandler('rejectInvitation', this.rejectInvitation.bind(this));
		},
		/*see filter*/
		filter : function(parameters, returns) {
			// parameters.segment
			// return matchedContacts
			// return matchedContactsSum
			// return isAll
			var segment = parameters.segment.toLowerCase();

			if (segment === '@') {
				// pass
			} else if (segment !== '') {
				if (typeof (s.state.ui.filter.invite) != 'undefined') {
					s.state.ui.filter.invite = s.constants.INVITATION_STATE.NORMAL;
				}
			}
		},
		invite : function(parameters, returns) {
			// parameters.jid;
			// returns.invited;
			// returns.invalidJid;
			// TODO jid test 与secretary重复了
			var jid = parameters.jid || '';
			var jidReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
			if (jid && jidReg.test(jid) === true) {
				s.state.ui.filter.invite = s.constants.INVITATION_STATE.INVITED;
				returns.invited = true;
				returns.invalidJid = false;
			} else {
				s.state.ui.filter.invite = s.constants.INVITATION_STATE.INVALID;
				returns.invited = false;
				returns.invalidJid = true;
			}
		},
		acceptInvitation : function(parameters, returns) {
			// parameters.jid
			// returns.threadId
			var jid = parameters.jid;

			// TODO ask secretary?
			var threadId = $.md5(jid.toLowerCase());

			var thread = this._getThread(threadId);

			thread.ui.messagebox.disabled = false;
			for (index in thread.messages) {
				if (thread.messages[index].prototype !== 'prototype') {
					delete thread.messages[index];
					thread.messages.length--;
				}
			}

			returns.threadId = threadId;
		},
		rejectInvitation : function(parameters, returns) {
			// parameters.jid
			// returns.threadId
			var jid = parameters.jid;

			// TODO ask secretary?
			var threadId = $.md5(jid.toLowerCase());

			var thread = this._getThread(threadId);
			thread.ui.messagebox.disabled = true;
			for (index in thread.messages) {
				if (thread.messages[index].prototype !== 'prototype') {
					delete thread.messages[index];
					thread.messages.length--;
				}
			}

			returns.threadId = threadId;
		},
		//TODO copied from xmpp/m.js
		_getThread: function(threadId, includeCollapsed) {
			if (includeCollapsed) {
				var threads = $.grep(s.state.threads, function(e, i) {
					return e.ui.state === s.constants.PANEL_STATE.COLLAPSED && e.id === threadId;
				});
			} else {
				var threads = $.grep(s.state.threads, function(e, i) {
					return e.ui.state !== s.constants.PANEL_STATE.COLLAPSED && e.id === threadId;
				});
			}

			// 返回唯一的结果
			return threads[0];
		},
	});
})(boss, state);
