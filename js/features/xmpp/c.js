(function(boss, secretary) {
	boss.registerFeature('xmpp', 'c', {
		/**
		 * xmpp 基础功能 登录，在线状态，发消息
		 * @implements load
		 * @implements done
		 *
		 * @provides send
		 * @provides changePresence
		 * @provides acceptInvitation
		 * @provides rejectInvitation
		 */
		_connection: null,
		_done: null,

		// 缓存bareJid fullJid映射
		_toFullJid: {},
		// 缓存已登录用户
		_user: {},

    /*
        _idle: false,
        _idleWatcher: null,
        _idleResetWatcher: null,
        _canReset: true,
        _IDLE_TIME: 10,
        _IDLE_RESET_TIME: 2,
    */

		load: function(connection, done) {
			this._done = done;
			this._connection = connection;

			if (!this._connection._xmppRegistered) {
				secretary.addHandler('changePresence', this._changePresence.bind(this));
				secretary.addHandler('send', this._send.bind(this));

				this._connection.addHandler(this._anyCallback.bind(this), null, null);

				this._connection.addHandler(this._messageCallback.bind(this), null, 'message');
				this._connection.addHandler(this._presenceCallback.bind(this), null, 'presence');

				this._connection._xmppRegistered = true;
			}

			this._loadSignedInUser(Strophe.getBareJidFromJid(this._connection.jid));
			this._loadContacts();
		},

		done: function() {
			boss.report('connected', this._user);
			boss.log(chrome.i18n.getMessage('signedIn'));
		},

		_send: function(parameters) {
			var to = this._toFullJid[parameters.jid] || parameters.jid;
			var threadId = parameters.threadId;
			var message = parameters.message;

			var iq = $msg({
				to: to,
				type: 'chat'
			}).c('body').t(message);

			this._connection.send(iq);
		},
		_changePresence: function(parameters) {
			var show = '';
			var status = '';
			if (parameters) {
				show = parameters.show;
				status = parameters.status;
			}

			var iq = $pres();
			if (show) {
				if (status) {
					iq = iq.c('show').t(show).up().c('status').t(status);
				} else {
					iq = iq.c('show').t(show);
				}
			}

			this._connection.send(iq);
		},
		_loadSignedInUser: function(jid) {
			// http://xmpp.org/extensions/xep-0054.html
			// http://xmpp.org/extensions/xep-0153.html
			this._loadUser(jid, function(response) {
				this._user = {
					jid: response.jid.toLowerCase(),
					name: response.name,
					avatar: response.avatar
				};

				if (this._done) {
					this._done();
				}
			}.bind(this));

			this._changePresence();
		},
		_loadUser: function(jid, callback) {
			// http://xmpp.org/extensions/xep-0054.html
			// http://xmpp.org/extensions/xep-0153.html
			var resultUser = {};
			var iq = $iq({
				type: 'get',
				to: jid
			}).c('vCard', {
				xmlns: 'vcard-temp'
			});

			this._connection.sendIQ(iq, function(response) {
				var $response = $(response);
				var name = $response.find('vCard FN').text();
				var $photo = $response.find('vCard PHOTO');
				var photoType = $photo.find('TYPE').text();
				var photoBinval = $photo.find('BINVAL').text();
				if (photoType && photoBinval) {
					var avatar = 'data:' + photoType + ';base64,' + photoBinval;
				}

				var response = {
					jid: jid.toLowerCase(),
					name: name || jid.toLowerCase(),
					avatar: avatar || '',
				};
				callback(response);
			});
		},
		_loadContacts: function() {
			boss.log(chrome.i18n.getMessage('loadingContacts') + ' [<a class="gtalklet_cancel_connect" title="' + chrome.i18n.getMessage('cancel') + '">' + chrome.i18n.getMessage('cancel') + '</a>]', 'info', true);

			var self = this;
			this._connection.roster.requestRoster(function(rosters) {
				var contacts = {};
				$(rosters).find('item').each(function() {
					//<item name="Sean Zheng" jid="i@icelink.me" subscription="both"></item>
					//<item ask="subscribe" jid="i@icelink.me" subscription="none"></item>
					//<item jid="i@miy.im" subscription="none"/> 被拒绝
					$this = $(this);
					var jid = $this.attr('jid').toLowerCase();
					var name = $this.attr('name') || jid;
					var invited = !! $this.attr('ask');
					var rejected = $this.attr('subscription') == 'none';

					contacts[jid] = {
						jid: jid,
						name: name,
						invited: invited,
						rejected: rejected
					};
				});

				boss.report('loadContacts', {
					contacts: contacts
				});

				for (index in contacts) {
					self._loadUser(contacts[index].jid, function(response) {
						boss.report('loadUser', response);
					});
				}

			});
		},
		_anyCallback: function(message) {
			//console.error(message);
		},
		_messageCallback: function(message) {
			$message = $(message);

			var jid = $message.attr('from').toLowerCase();
			var from = Strophe.getBareJidFromJid(jid);
			var threadId = $.md5(from.toLowerCase()); // getThreadId;
			var type = $message.attr('type');
			var messageText = $message.children('body').text();

			// 更新FullJid
			this._toFullJid[from] = jid;

			// TODO offline
			var $error = $message.children('error');
			if ($error.length) {
				type = 'error';
				//var errorCode = $error.attr('code');
				//var errorType = $error.attr('type');
				//var errorMessage = $error.children().first().get(0).tagName;
				//messageText = from + ' ' + errorCode + ' ' + errorType + ' ' + errorMessage;
				messageText = chrome.i18n.getMessage('xOffline', from);
			}

			var $invite = $message.find('invite');
			if (false && $invite) {
				// group chat invitation
				var invitedFrom = Strophe.getBareJidFromJid($invite.attr('from')).toLowerCase();
				var reason = $invite.find('reason').text();
				boss.report('recievedGroupChatInvitation', {
					from: invitedFrom,
					chatroom: from,
					reason: reason
				});
			} else {
				// normal chat message
				if (messageText) {
					//boss.showNotification('', from, messageText);
					boss.report('recieved', {
						from: from,
						threadId: threadId,
						type: type,
						message: messageText
					});
				}
			}

			return true;
		},
		_presenceCallback: function(presence) {
			$presence = $(presence);

			var from = Strophe.getBareJidFromJid($presence.attr('from')).toLowerCase();
			var show = 'chat',
			status = '';

			var type = $presence.attr('type');
			switch (type) {
			case 'subscribe':
				// 对方想订阅我的状态
				var threadId = $.md5(from.toLowerCase()); // getThreadId;
				var type = 'invite'; //?
				var messageText = chrome.i18n.getMessage('xWantsToAddYou', from);
				boss.report('recieved', {
					from: from,
					threadId: threadId,
					type: type,
					message: messageText,
					html: true
				});
				boss.report('disableThread', {
					threadId: threadId
				});
				break;
			case 'subscribed':
				// 对方接受了我的订阅请求
				var jid = from;
				var name = jid;
				var contacts = {};
				contacts[jid] = {
					jid: jid,
					name: name,
					rejected: false
				};
				boss.report('loadContacts', {
					contacts: contacts
				});
				break;
			case 'unsubscribe':
				// 对方想退订我的状态
				break;
			case 'unsubscribed':
				// 对方拒绝了我的订阅请求
				var jid = from;
				var name = jid;
				var contacts = {};
				contacts[jid] = {
					jid: jid,
					name: name,
					rejected: true
				};
				boss.report('loadContacts', {
					contacts: contacts
				});
				break;
			case 'probe':
				// 状态探针
				break;
			case 'error':
				break;
			case 'unavailable':
			default:
				if (type) {
					// 对方状态是unavailable
					show = 'unavailable';

					// 从FullJid映射中删除resource
					if (this._toFullJid[from]) {
						delete this._toFullJid[from];
					}
				} else {
					// 一般状态
					var $show = $presence.find('show');
					if ($show.length == 1) {
						show = $show.text();
					}
				}

				var $status = $presence.find('status');
				if ($status.length == 1) {
					status = $status.text();
				}

				if (from !== this._user.jid) {
					boss.report('presence', {
						from: from,
						show: show,
						status: status
					});
				}
			}

			return true;
		}
	});
})(boss, secretary);
