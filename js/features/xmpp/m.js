(function(boss, s) {
	var featureName = 'xmpp';

	s.addStateConstants({
		MAX_MESSAGES: 30,
		DEFAULT_AVATAR: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAIAAABt+uBvAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGNzBENjg1MUY0RjkxMUUwQTlDNUMzNEFBRUEzQkVCRCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGNzBENjg1MkY0RjkxMUUwQTlDNUMzNEFBRUEzQkVCRCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkY3MEQ2ODRGRjRGOTExRTBBOUM1QzM0QUFFQTNCRUJEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkY3MEQ2ODUwRjRGOTExRTBBOUM1QzM0QUFFQTNCRUJEIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+cxeKigAACQJJREFUeNrsnNlP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',  // 默认头像
		PANEL_STATE: {
			NORMAL: 'normal',
			EXPANDED: 'expanded',
			MINIMIZED: 'minimized',
			COLLAPSED: 'collapsed'
		},
		PANEL_TYPE: {
			CHAT: 'chat',
		},
		PRESENCE_TYPE: {
			UNKNOWN: 'unknown',
			INVITED: 'invited',
			REJECTED: 'rejected',
			UNAVAILABLE: 'unavailable',
			DND: 'dnd',
			XA: 'xa',
			AWAY: 'away',
			CHAT: 'chat',
			ERROR: 'unavailable',
		},
		PRESENCE_MESSAGE: {
			unknown: chrome.i18n.getMessage('unknown'),
			invited: chrome.i18n.getMessage('invited'),
			rejected: chrome.i18n.getMessage('rejected'),
			unavailable: chrome.i18n.getMessage('offline'),
			dnd: chrome.i18n.getMessage('busy'),
			xa: chrome.i18n.getMessage('idle'),
			away: chrome.i18n.getMessage('idle'),
			chat: chrome.i18n.getMessage('available'),
			error: chrome.i18n.getMessage('offline'),
		},
		PRESENCE_TYPE_ARRAY: [
			'rejected',
			'invited',
			'unknown',
			'unavailable',
			'dnd',
			'xa',
			'away',
			'chat'
		],
		MESSAGE_TYPE: {
			TIME: 'time',
			INVITE: 'invite',
			CHAT_SENT: 'chat_sent',
			CHAT: 'chat_recieved',
			NORMAL: 'normal',
			GROUPCHAT: 'groupchat',
			HEADLINE: 'headline',
			ERROR: 'error'
		},
		CONSOLE_STATE: {
			NORMAL: 'my_presence',
			NEW_MESSAGE: 'new_message',
			//NEW_MAIL: 'new_mail'
		},
		CONSOLE_COMMANDS: {
			EMPTY: [],
			SIGNIN: [
				{
					classes: 'signin',
					title: chrome.i18n.getMessage('signIn'),
					weight: 10,
				}
			],
			COMPLETE: [
				{
					classes: 'signout',
					title: chrome.i18n.getMessage('signOut'),
					weight: 10,
				},
				/*
				{
					classes: 'mail',
					title: ''
				},
				*/
			]
		},
	});

	s.addState({
		user: { // 初始，未登录
			service: '', // 账号服务提供商
			signedin: false, // 是否登录
			jid: '',
			name: '',
			avatar: s.constants.DEFAULT_AVATAR,
			presence: {
				type: s.constants.PRESENCE_TYPE.UNAVAILABLE,
				message: s.constants.PRESENCE_MESSAGE[s.constants.PRESENCE_TYPE.UNAVAILABLE]
			},
			pendingThreads: [], // 待接收的新会话threadId
			contacts: {} // 联系人 
		},
		ui: {
			zoom: 1,
			blocked: false,
			console: {
				state: s.constants.CONSOLE_STATE.NORMAL,
				jumpListState: s.constants.PANEL_STATE.COLLAPSED,
				commands: s.constants.CONSOLE_COMMANDS.EMPTY
			},
			log: {
				message: '',
				level: '', //  DEBUG INFO WARN ERROR
				keep: false
			},
			filter: {
				state: s.constants.PANEL_STATE.COLLAPSED, // 新会话面板状态 collapsed | expand
				filter: '', // 用户filter文本框中的内容
				matchedContacts: [], // 匹配的用户
				matchedContactsSum: 0, //匹配的用户总数
			}
		},
		threads: [ //初始，没有聊天线程
		{
			prototype: 'prototype',
			id: 'prototype',
			type: s.constants.PANEL_TYPE.CHAT, //线程类型 chat | invited | ...

			unread: '',
			lastActivity: '', // 最近活动时间

			user: {
				name: '',
				jid: '',
				presence: {
					type: '',
					message: ''
				}
			},
			participator: [
				{
					name: '',
					jid: '',
					presence: {
						type: '',
						message: ''
					}
				}
			],
			ui: {
				state: s.constants.PANEL_STATE.MINIMIZED, //面板的状态, minimized | normal |...
				scrollTop: 0, // 滚动位置
				messagebox: {
					typing: '',
					caretStart: 0,
					caretEnd: 0,
					//消息框中的内容
					height: 32, //16
					disabled: false,
					focused: false
				}
			},
			messages: [ //线程中的消息
			{
				prototype: 'prototype',
				type: '', //消息类型，chat_sent | chat_recieved | status 之类
				from: '', //消息来源，jid; 没有from表示自己或系统消息（根据type）
				time: '', //发消息的时间
				timestamp: '',
				showTime: true,
				content: '' //消息内容
			}]
		}]
	});

	boss.registerFeature(featureName, 'm', {
		register : function() {
			s.addHandler('setService', this.setService.bind(this));
			s.addHandler('signout', this.signout.bind(this));
			s.addHandler('log', this.log.bind(this));
			s.addHandler('clearInfo', this.clearInfo.bind(this));
			s.addHandler('read', this.read.bind(this));
			s.addHandler('presence', this.presence.bind(this));
			s.addHandler('filter', this.filter.bind(this));
			s.addHandler('scrollPanel', this.scrollPanel.bind(this));
			s.addHandler('togglePanel', this.togglePanel.bind(this));
			s.addHandler('connecting', this.connecting.bind(this));
			s.addHandler('connected', this.connected.bind(this));
			s.addHandler('connectError', this.connectError.bind(this));
			s.addHandler('changePresence', this.changePresence.bind(this));
			s.addHandler('loadUser', this.loadUser.bind(this));
			s.addHandler('toggleConsole', this.toggleConsole.bind(this));
			s.addHandler('scrolling', this.scrolling.bind(this));
			s.addHandler('typing', this.typing.bind(this));
			s.addHandler('resizeTextarea', this.resizeTextarea.bind(this));
			s.addHandler('send', this.send.bind(this));
			s.addHandler('recieved', this.recieved.bind(this));
			s.addHandler('recievedGroupChatInvitation', this.recievedGroupChatInvitation.bind(this));
			s.addHandler('acceptThread', this.acceptThread.bind(this));
			s.addHandler('toggleFilterPanel', this.toggleFilterPanel.bind(this));
			s.addHandler('createThread', this.createThread.bind(this));
			s.addHandler('closeThread', this.closeThread.bind(this));
			s.addHandler('closeOldestThread', this.closeOldestThread.bind(this));
			s.addHandler('disableThread', this.disableThread.bind(this));
			s.addHandler('loadContacts', this.loadContacts.bind(this));
			//s.addHandler('readNotification', this.readNotification.bind(this));
			//s.addHandler('recievedNotification', this.recievedNotification.bind(this));
			s.addHandler('zoom', this.zoom.bind(this));
			s.addHandler('getCommands', this.getCommands.bind(this));

			s.addHandler('BOSH_SERVICE', this.connectionUpdated.bind(this));
			s.addHandler('CUSTOM_BOSH_SERVICE', this.connectionUpdated.bind(this));
			s.addHandler('JID', this.connectionUpdated.bind(this));
			s.addHandler('PASSWORD', this.connectionUpdated.bind(this));
			s.addHandler('CONNECTION_PREPARED', this.connectionPrepared.bind(this));
		},

		load : function() {
		},

		setService : function(parameters) {
			// parameters.service;
			s.state.user.service = parameters.service;
		},
		signout : function(parameters, returns) {
			// no parameters
			// return signout true | false
			s.reset();

			returns.signout = true;
			returns.defaultState = s;
		},
		log : function(parameters, returns) {
			// parameters.message;
			// parameters.level;
			// returns message level;
			var message = parameters.message;
			var level = parameters.level;
			var keep = parameters.keep;

			s.state.ui.log.message = message;
			s.state.ui.log.level = level;
			s.state.ui.log.keep = keep;

			returns.message = message;
			returns.level = level;
			returns.keep = keep;
		},
		clearInfo : function(parameters, returns) {
			s.state.ui.log.message = '';
			s.state.ui.log.level = '';
		},
		read : function(parameters, returns) {
			// paramters.threadId
			// no return;
			var threadId = parameters.threadId;
			thread = this._getThread(threadId);
			if (thread && thread.ui) {
				thread.ui.unread = '';
			}
		},
		presence : function(parameters, returns) {
			// parameters.from
			// parameters.show
			// parameters.status
			// return 
			var from = parameters.from;
			var show = parameters.show;
			var status = parameters.status;

			var type = s.constants.PRESENCE_TYPE[show.toUpperCase()];
			var message = status || s.constants.PRESENCE_MESSAGE[type];

			if (s.state.user.contacts[from]) {
				s.state.user.contacts[from].presence = {},
				s.state.user.contacts[from].presence.type = type;
				s.state.user.contacts[from].presence.message = message;
			}

			var threadOfJid = this._getThreadByJid(from);
			if (threadOfJid) {
				threadOfJid.user.presence.type = type;
				threadOfJid.user.presence.message = message;
			}

			returns.jid = from;
			returns.presence = {},
			returns.presence.type = type;
			returns.presence.message = status;
		},
		filter : function(parameters, returns) {
			// parameters.segment
			// return matchedContacts
			// return matchedContactsSum
			// return isAll
			var segment = parameters.segment.toLowerCase();
			var matchedContacts = [];
			var matchedContactsSum = 0;

			// 建立临时操作联系人
			var contacts = [];
			for (index in s.state.user.contacts) {
				contacts.push(s.state.user.contacts[index]);
			}

			// 按在线状态排序
			contacts.sort(function(a, b) {
				var presenceA = a.presence.type.toLowerCase();
				var ra = s.constants.PRESENCE_TYPE_ARRAY.indexOf(presenceA);

				var presenceB = b.presence.type.toLowerCase();
				var rb = s.constants.PRESENCE_TYPE_ARRAY.indexOf(presenceB);

				if (ra < rb) {
					return 1;
				} else {
					return - 1;
				}
			});

			if (segment === '@') {
				matchedContacts = contacts.reverse();

				s.state.ui.filter.filter = ''; 
				s.state.ui.filter.matchedContacts = [];
				s.state.ui.filter.matchedContactsSum = 0;

				returns.segment = '';
				returns.isAll = true;
			} else if (segment !== '') {
				$.grep(contacts, function(e, i) {
					var jid = e.displayJid.toLowerCase();
					var name = e.name.toLowerCase();

					var match = jid.indexOf(segment);
					if (match > - 1 && matchedContactsSum++ < 8) {
						matchedContacts.unshift(e);
					} else {
						match = name.indexOf(segment);
						if (match > - 1 && matchedContactsSum++ < 8) {
							matchedContacts.unshift(e);
						}
					}
				});

				s.state.ui.filter.filter = segment;
				s.state.ui.filter.matchedContacts = matchedContacts;
				s.state.ui.filter.matchedContactsSum = matchedContactsSum;

				returns.isAll = false;
			} else { //segment == ''
				s.state.ui.filter.filter = '';
				s.state.ui.filter.matchedContacts = [];
				s.state.ui.filter.matchedContactsSum = 0;

				returns.isAll = false;
			}

			returns.matchedContacts = matchedContacts;
			returns.matchedContactsSum = matchedContactsSum;
		},
		scrollPanel : function(parameters, returns) {
			// parameters.scrollTop;
			// parameters.threadId;
			// no returns;
			var scrollTop = parameters.scrollTop;

			var thread = this._getThread(parameters.threadId);

			if (thread) {
				thread.ui.scrollTop = scrollTop;
			}
		},
		togglePanel : function(parameters, returns) {
			//parameters.panelId
			//parameters.expand option true | fale 
			//return returns.panelState
			threadId = parameters.panelId;
			var expand = parameters.expand;
			thread = this._getThread(threadId);

			if (typeof(threadId) !== 'undefined' && typeof(thread) != 'undefined') {
				if (typeof(expand) === 'undefined') {
					//toggle
					if (thread.ui.state === s.constants.PANEL_STATE.NORMAL) {
						newState = s.constants.PANEL_STATE.MINIMIZED;
					} else {
						newState = s.constants.PANEL_STATE.NORMAL;
					}
				} else {
					newState = expand ? s.constants.PANEL_STATE.NORMAL: s.constants.PANEL_STATE.MINIMIZED;
				}

				thread.ui.state = newState;

				returns.newState = thread.ui.state;
			}
		},
		connecting : function(parameters, returns) {
			// no paramters
			// returns blocked;
			s.state.ui.blocked = true;

			returns.blocked = true;
		},
		connected : function(parameters, returns) {
			// parameters.jid
			// parameters.name
			// parameters.avatar
			// returns jid
			s.state.user.signedin = true;
			s.state.user.jid = parameters.jid;
			s.state.user.name = parameters.name;
			s.state.user.avatar = parameters.avatar;

			s.state.user.presence.type = s.constants.PRESENCE_TYPE.CHAT;
			s.state.user.presence.message = s.constants.PRESENCE_MESSAGE[s.constants.PRESENCE_TYPE.CHAT];

			s.state.ui.console.commands = s.constants.CONSOLE_COMMANDS.COMPLETE;

			s.state.ui.blocked = false;

			returns.jid = s.state.user.jid;
			returns.presence = s.state.user.presence;
			returns.service = s.state.user.service;
			returns.blocked = false;
		},
		connectError : function(parameters, returns) {
			// no paramters
			// returns blocked;
			s.state.ui.blocked = false;
			returns.blocked = false;
		},
		changePresence : function(parameters, returns) {
			// parameters.show
			// parameters.status
			// retunrs jid
			// returns presence
			s.state.user.presence.type = parameters.show;
			s.state.user.presence.message = s.constants.PRESENCE_MESSAGE[parameters.show];

			returns.jid = s.state.user.jid;
			returns.presence = s.state.user.presence;
		},
		loadUser : function(parameters, returns) {
			// parameters.jid
			// parameters.name
			// parameters.avatar
			// no returns
			var jid = parameters.jid;

			if (s.state.user.contacts[jid].name === jid) {
				// 如果没有比较好的name，用vcard中的name字段覆盖
				s.state.user.contacts[jid].name = parameters.name;
			}
			s.state.user.contacts[jid].avatar = parameters.avatar || s.constants.DEFAULT_AVATAR;
		},
		toggleConsole : function(parameters, returns) {
			// parameters.expand option
			var expand = parameters.expand;

			if (typeof(expand) === 'undefined') {
				//toggle
				if (s.state.ui.console.jumpListState === ''){
					newState = s.constants.PANEL_STATE.COLLAPSED;
				} else {
					newState = '';
				}
			} else {
				newState = expand ? '' : s.constants.PANEL_STATE.COLLAPSED;
			}

			s.state.ui.console.jumpListState = newState;

			returns.newState = newState;
		},
		scrolling : function(parameters, returns) {
			// parameters.threadId
			// parameters.scrollTop
			threadId = parameters.threadId;
			thread = this._getThread(threadId);

			var scrollTop = parameters.scrollTop;

			if (typeof(threadId) !== 'undefined' && typeof(thread) !== 'undefined') {
				thread.ui.scrollTop = scrollTop;
			}

			// no returns
		},
		typing : function(parameters, returns) {
			//parameters.threadId
			//parameters.content
			threadId = parameters.threadId;
			thread = this._getThread(threadId);

			content = parameters.content;

			if (typeof(threadId) != 'undefined' && typeof(thread) != 'undefined') {
				thread.ui.messagebox.typing = content;
			}

			// no returns
		},
		resizeTextarea : function(parameters, returns) {
			//parameters.threadId
			//parameters.height = 34 //16
			// no returns
			threadId = parameters.threadId;
			thread = this._getThread(threadId);

			var height = parameters.height;
			//var width = parameters.width;
			if (typeof(threadId) != 'undefined' && typeof(thread) != 'undefined') {
				if (typeof(height) != 'undefined') {
					thread.ui.messagebox.height = height;
				} else {
					thread.ui.messagebox.height = 34; //原始大小
				}
			}
		},
		send : function(parameters, returns) {
			//parameters.threadId
			//paremeters.message
			threadId = parameters.threadId;
			var message = parameters.message;

			thread = this._getThread(threadId);
			// encode html tag
			message = $('<div />').text(message).html();

			if (typeof(threadId) != 'undefined' && typeof(thread) != 'undefined') {
				//在thread里添加新的message
				var result = this._insertMessage(thread, {
					type: s.constants.MESSAGE_TYPE.CHAT_SENT,
					from: '',
					time: this._now(),
					timestamp: this._now(true),
					content: message
				});

				//清空正在输入的内容
				thread.ui.messagebox.typing = '';

				returns.removeOldest = result.removeOldest;
				returns.message = result.message;
			}

		},
		recieved : function(parameters, returns, stateChange) {
			// parameters.from
			// parameters.threadId
			// parameters.type
			// parameters.message
			// parameters.html = false
			threadId = parameters.threadId;
			var from = parameters.from;
			var type = s.constants.MESSAGE_TYPE[parameters.type.toUpperCase()];
			var message = parameters.message;
			if (!parameters.html) {
				message = $('<div />').text(message).html();
			}

			thread = this._getThread(threadId, false);

			var user = {
				jid: from,
				name: s.state.user.contacts[from] ? s.state.user.contacts[from].name : from,
				avatar: s.state.user.contacts[from] ? s.state.user.contacts[from].avatar : '',
				presence: s.state.user.contacts[from] ? s.state.user.contacts[from].presence : {
					type: '',
					message: ''
				}
			};

			if (thread) {
				// 存在线程，直接往里插入message
				var result = this._insertMessage(thread, {
					type: type,
					from: from,
					time: this._now(),
					timestamp: this._now(true),
					content: message
				});
				thread.ui.unread = 'unread';

				stateChange.report = 'recieved';
				returns.removeOldest = result.removeOldest;
				returns.message = result.message;
				returns.unread = 'unread';

			} else {
				var collapsedThread = this._getThread(threadId, true);

				if (collapsedThread) {
					// 存在collapsed线程
					this._insertMessage(collapsedThread, {
						type: type,
						from: from,
						time: this._now(),
						timestamp: this._now(true),
						content: message
					});
				} else {
					// 还没有线程，新建
					// copy object
					var createdThread = $.extend(true, {},
					this._getThread('prototype'));

					createdThread.id = threadId;
					createdThread.user = $.extend(true, {},
					createdThread.user, user);
					createdThread.ui.state = s.constants.PANEL_STATE.COLLAPSED;

					delete createdThread.prototype;

					s.state.threads.unshift(createdThread);

					this._insertMessage(createdThread, {
						type: type,
						from: from,
						time: this._now(),
						timestamp: this._now(true),
						content: message
					});
				}

				if (s.state.user.pendingThreads.indexOf(threadId) === - 1) {
					s.state.user.pendingThreads.push(threadId);
					s.state.ui.console.state = s.constants.CONSOLE_STATE.NEW_MESSAGE;

					stateChange.report = 'recievedThread';
					returns.jid = user.jid;
					returns.name = user.name;
					returns.threadId = threadId;
					returns.consoleState = s.state.ui.console.state;
				}
			}

			boss.showNotification(user.avatar, user.name, message);
		},
		recievedGroupChatInvitation : function(parameters, returns) {
			// parameters.from;
			// parameters.chatroom;
			// parameters.reason;
			//
		},
		acceptThread : function(parameters, returns) {
			// parameters.threadId
			// returns.createdThread
			// returns.consoleState
			var threadId = parameters.threadId;
			thread = this._getThread(threadId, true);

			if (thread) {
				// move to beginning of threadList
				this._moveThread(thread, false);
				thread.ui.state = s.constants.PANEL_STATE.EXPANDED;

				returns.createdThread = thread;
			}

			// remove 
			var index = s.state.user.pendingThreads.indexOf(threadId);
			s.state.user.pendingThreads.splice(index, 1);
			s.state.ui.console.state = s.constants.CONSOLE_STATE.NORMAL;

			returns.consoleState = s.state.ui.console.state;

		},
		toggleFilterPanel : function(parameters, returns) {
			// parameters.expand option
			var expand = parameters.expand;

			if (typeof(expand) === 'undefined') {
				//toggle
				if (s.state.ui.filter.state === s.constants.PANEL_STATE.COLLAPSED) {
					newState = s.constants.PANEL_STATE.EXPANDED;
				} else {
					newState = s.constants.PANEL_STATE.COLLAPSED;
				}
			} else {
				newState = expand ? s.constants.PANEL_STATE.EXPANDED: s.constants.PANEL_STATE.COLLAPSED;
			}

			s.state.ui.filter.state = newState;

			returns.newState = newState;
		},
		createThread : function(parameters, returns) {
			// parameters.jid
			var jid = parameters.jid;
			var user = s.state.user.contacts[jid];

			// TODO ask secretary?
			threadId = $.md5(jid.toLowerCase());

			var existedCollapsedThread = this._getThread(threadId, true);

			if (existedCollapsedThread) {
				this._moveThread(existedCollapsedThread, true);
				existedCollapsedThread.ui.state = s.constants.PANEL_STATE.EXPANDED;

				returns.createdThread = existedCollapsedThread;
			} else {
				// copy object
				var createdThread = $.extend(true, {},
				this._getThread('prototype'));

				createdThread.id = threadId;
				createdThread.lastActivity = this._now(true);
				createdThread.user = $.extend(true, {},
				createdThread.user, user);
				delete createdThread.prototype;

				s.state.threads.unshift(createdThread);
				returns.createdThread = createdThread;
			}

			s.state.ui.filter = {
				state: s.constants.PANEL_STATE.COLLAPSED,
				// 新会话面板状态 collapsed | expand
				scrollTop: 0,
				// 滚动位置
				filter: '',
				// 用户filter文本框中的内容
				matchedContacts: []
			},
			returns.filter = s.state.ui.filter;

		},
		closeThread : function(parameters, returns) {
			// parameters.threadId
			var threadId = parameters.threadId;

			var thread = this._getThread(threadId);

			thread.ui.state = s.constants.PANEL_STATE.COLLAPSED;
			thread.ui.lastActivity = this._now(true);
			var moved = this._moveThread(thread, true);
		},
		closeOldestThread : function(parameters, returns) {
			// parameters.num
			var num = parameters.num;

			var threadIds = [];
			for (var i = num; i > 0; i--) {
				var thread = this._oldestThread();

				if (thread) {
					thread.ui.state = s.constants.PANEL_STATE.COLLAPSED;
					thread.ui.lastActivity = this._now(true);
					this._moveThread(thread, true);

					threadIds.push(thread.id);
				}
			}

			returns.threadIds = threadIds;
		},
		disableThread : function(parameters, returns, stateChange) {
			// parameters.threadId
			var threadId = parameters.threadId;
			var thread = this._getThread(threadId, true);

			thread.ui.messagebox.disabled = true;

			stateChange.report = 'disableThread';

			returns.threadId = threadId;
		},
		loadContacts : function(parameters, returns) {
			// parameters.contacts
			// return true | false
			var contacts = parameters.contacts;

			for (index in contacts) {
				if (contacts[index].invited) {
					// invited not response
					contacts[index].presence = {
						type: s.constants.PRESENCE_TYPE.INVITED,
						message: s.constants.PRESENCE_MESSAGE[s.constants.PRESENCE_TYPE.INVITED]
					};
				} else if (contacts[index].rejected) {
					// rejected
					contacts[index].presence = {
						type: s.constants.PRESENCE_TYPE.REJECTED,
						message: s.constants.PRESENCE_MESSAGE[s.constants.PRESENCE_TYPE.REJECTED]
					};
				} else if (typeof(contacts[index].presence) === 'undefined') {
					contacts[index].presence = {
						type: s.constants.PRESENCE_TYPE.UNAVAILABLE,
						message: s.constants.PRESENCE_MESSAGE[s.constants.PRESENCE_TYPE.UNAVAILABLE]
					};
				}
				contacts[index].displayJid = this._displayJid(contacts[index].jid);
				contacts[index].avatar = contacts[index].avatar || s.constants.DEFAULT_AVATAR;
			}

			s.state.user.contacts = $.extend(s.state.user.contacts, contacts);
		},
		zoom: function(parameters, returns) {
			if (parameters.zoomIn == null) {
				s.state.ui.zoom = 1;
			} else {
				if (parameters.zoomIn || false) {
					s.state.ui.zoom += 0.1;
				} else {
					s.state.ui.zoom -= 0.1;
				}
			}
			returns.zoom = s.state.ui.zoom;
		},

		getCommands: function(parameters, returns) {
			// no parameters
			// returns.commands
			returns.commands = s.state.ui.console.commands;
		},
		getOption: function(parameters, returns) {
			// parameters.key
			// returns.value
			returns.value = optionManager.get(parameters.key);
		},

		connectionUpdated: function(parameters, returns, stateChange) {
			if ((optionManager.get('BOSH_SERVICE') || optionManager.get('CUSTOM_BOSH_SERVICE')) && optionManager.get('JID') && optionManager.get('PASSWORD')) {
				optionManager.set('CONNECTION_PREPARED', true);
			} else {
				optionManager.set('CONNECTION_PREPARED', false);
			}
		},

		connectionPrepared: function(parameters, returns) {
			if (optionManager.get('CONNECTION_PREPARED')) {
				if (JSON.stringify(s.state.ui.console.commands) == JSON.stringify(s.constants.CONSOLE_COMMANDS.EMPTY) || JSON.stringify(s.state.ui.console.commands) == JSON.stringify(s.constants.CONSOLE_COMMANDS.SIGNIN)) {
					s.state.ui.console.commands = s.constants.CONSOLE_COMMANDS.SIGNIN;
				}
			} else {
				if (JSON.stringify(s.state.ui.console.commands) == JSON.stringify(s.constants.CONSOLE_COMMANDS.SIGNIN)) {
					s.state.ui.console.commands = s.constants.CONSOLE_COMMANDS.EMPTY;
				}
			}
		},

		/*
		//gmail notification
		readNotification : function(parameters, returns) {
		},
		recievedNotification : function(parameters, returns) {
			// parameters.unread
			// returns.new
			// returns.unread
			//s.state.mail.new = true;
			s.state.mail.unread = parameters.unread;

			//returns.new = s.state.mail.new;
			returns.consoleState = s.state.CONSOLE_STATE.NORMAL;
			returns.unread = s.state.mail.unread;
		},
		*/
	_now: function(timestamp) {
		var now = new Date();
		if (timestamp) {
			return now.getTime();
		} else {
			return now.toLocaleTimeString();
		}
	},
	_oldestThread: function() {
		var mark = this._now(true);
		var thread = null;
		for (index in s.state.threads) {
			if (s.state.threads[index].prototype !== 'prototype' && s.state.threads[index].ui.state !== s.constants.PANEL_STATE.COLLAPSED) {
				if (s.state.threads[index].lastActivity < mark) {
					mark = s.state.threads[index].lastActivity;
					thread = s.state.threads[index];
				}
			}
		}

		return thread;
	},
	_trimMessages: function(thread) {
		var messages = thread.messages;
		if (messages.length > s.constants.MAX_MESSAGES) {
			// first is prototype, remove second messages
			messages.splice(1, 1);
			return true;
		} else {
			return false;
		}
	},
	_insertMessage: function(thread, message) {
		var longTimePast = message.timestamp - thread.messages[thread.messages.length - 1].timestamp > 60000; // 1min
		if (thread.messages.length < 2 || longTimePast) {
			message.showTime = true;
		}

		thread.messages.push(message);

		var removeOldest = this._trimMessages(thread);
		thread.lastActivity = this._now(true);

		return {
			removeOldest: removeOldest,
			message: message
		};
	},
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
	_getThreadByJid: function(jid) {
		var threads = $.grep(s.state.threads, function(e, i) {
			return e.user.jid === jid;
		});

		// 返回唯一的结果
		return threads[0];
	},
	_moveThread: function(thread, endOrBegin) {
		var index = $.inArray(thread, s.state.threads);
		if (endOrBegin) {
			// 移动到末尾
			s.state.threads.splice(index, 1);
			s.state.threads.unshift(thread);
			return true;
		} else {
			var length = s.state.threads.length;

			// 移动到头
			s.state.threads.splice(index, 1);
			s.state.threads.push(thread);
			return true;
		}
	},
	_displayJid: function(jid) {
		var domain = Strophe.getDomainFromJid(jid);
		if (domain != 'chat.facebook.com' && domain != 'public.talk.google.com') {
			return jid;
		} else {
			return '';
		}
	},
	});

})(boss, state);
