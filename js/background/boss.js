/**
 * boss对象，后台对象，模型层，维护所有状态并与follower通信
 */

var boss = (function() {

	var _secretary = null,
	_state = null,
	_features = {},
	_ports = {},
	_notifications = {},

    _idle = false;
	_idleWatcher = null,
    _idleResetWatcher = null,
    _canReset = true,
	_IDLE_TIME = 10,
    _IDLE_RESET_TIME = 2,

	_lastFollowerId = 0,
	_chromeFocused = true,

	_optionUrl = chrome.extension.getURL('options/index.html'),

	/**
	 * 初始化boss
	 */
	init = function(secretary, state) {
		_secretary = secretary;
		_state = state;

		_initVersion();

		_listen();

		for (featureName in _features) {
			if (_features[featureName]['m']) {
				_features[featureName]['m'].register(_state);
			}
		}

		_state.allRegistered();
		_state.reset();

		/* secretary
		// 自动登录
		if (optionManager.get('AUTO_SIGN_IN') !== false || (new Date().getTime()) - optionManager.get('crashed_at', false) < 2000) {
			setTimeout(function() {
				_secretary.signin();
			}, 2000);
		}
		*/
	},

	/**
	 * 新安装/升级 初始化
	 */
	_initVersion = function() {
		var details = chrome.app.getDetails();
		var currentVersion = typeof details.version != 'undefined' ? details.version : '0.0.0.0';
		var previousVersion = optionManager.get('VERSION');

		if (currentVersion != previousVersion) {
			optionManager.set('VERSION', currentVersion);
			if (previousVersion) {
				// onUpdated
				optionManager.setCompatible();
				chrome.tabs.create({url: chrome.extension.getURL('html/' + chrome.i18n.getMessage('locale') + '/updated.html'), selected: false}); 
			} else {
				// onInstall
				optionManager.setDefault();
				chrome.tabs.create({url: chrome.extension.getURL('html/' + chrome.i18n.getMessage('locale') + '/guide.html'), selected: true}); 
			}
		}
	},

	/**
	 * 监听请求
	 */
	_listen = function() {
		// 监听page action点击
		chrome.pageAction.onClicked.addListener(boss._callbackOnClicked);

		// 监听标签加载完成，加载UI
		chrome.tabs.onUpdated.addListener(boss._callbackOnUpdated);

		// 监听当前哪个tab上的follower被激活，更新_lastFollower
		chrome.tabs.onSelectionChanged.addListener(boss._callbackOnSelectionChanged);

		chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
			chrome.tabs.getSelected(detachInfo.oldWindowId, function(tab) {
				if (tab) {
					_sendRequest(tab.id, {
						stateChange: {
							report: 'toggleHidden',
							returns: {
								hide: true
							}
						}
					});
				}
			})
		});

		// 监听切换窗口
		chrome.windows.onFocusChanged.addListener(boss._callbackOnFocusChanged);

		// 关闭标签时，将其从enabledFollower中移除
		chrome.tabs.onRemoved.addListener(function(tabId) {
			if (_ports[tabId]) {
				_ports[tabId].disconnect();
			}
			delete _ports[tabId];
		});

		/*
		// boss 死掉之前保存状态
		$(window).unload(function() {
			console.error((new Date()).getTime());
			optionManager.set('crashed_at', (new Date()).getTime());
			optionManager.set('recovery', _state);
		});
		*/
		
	},

	/**
	 * 回调,根据follower的请求，更新状态
	 */
	_callbackOnRequest = function(request, port) {
		var callback = request.callback;
		var request = request.data;
		var sender = port;
		if (sender.tab && sender.tab.index >= 0) { // 检测index，避免chrome omnibar instant preview warning问题
			switch (request.report) {
			case 'rebuild':
				//_sendResponse(sender.tab.id, $.extend(true, {enable: true}, _state));
				break;
			case 'showPageAction':
				// page action 点击请求
				var suffix, title;
				if (followerManager.isEnabled(sender.tab.id, sender.tab)) {
					suffix = 'enabled';
					title = chrome.i18n.getMessage('enabled');
				} else {
					if (followerManager.isExcluded(sender.tab)) {
						suffix = 'excluded';
						title = chrome.i18n.getMessage('excluded');
					} else {
						suffix = 'disabled';
						title = chrome.i18n.getMessage('disabled');
					}
				}

				chrome.pageAction.setIcon({
					path: '/icon_' + suffix + '.png',
					tabId: sender.tab.id
				});
				chrome.pageAction.setTitle({
					title: title,
					tabId: sender.tab.id
				});
				chrome.pageAction.show(sender.tab.id);
				break;
			case 'showExtensionOption':
				// 打开扩展选项tab
				chrome.tabs.getAllInWindow(null, function(tabs) {
					var option_tab = tabs.filter(function(t) {
						return t.url === _optionUrl;
					});
					if (option_tab.length) {
						// 已经打开，直接激活
						chrome.tabs.update(option_tab[0].id, {
							selected: true
						});
					} else {
						chrome.tabs.create({
							url: _optionUrl,
							selected: true
						});
					}
				});
				break;
			case 'read':
				// 阅读信息后，关闭notifications
				this.hideNotifications();
				// 没有break
			default:
				// follower的其它请求
				_secretary.call(request.report, request.parameters);
				// 状态对象处理自身的更新
				var stateChange = _state.call(request.report, request.parameters);
				// 发送状态更新给来源follower
				_sendResponse(sender.tab.id, $.extend(true, {returns:{self: true}}, stateChange), callback);
				// 发送状态更新给其他follower
				_sendResponseToAll(stateChange, sender.tab.id);
				break;
			}
		}

		_resetIdleWatcher();
	},

	_callbackOnClicked = function(tab) {
		if (followerManager.isEnabled(tab.id, tab)) {
			// enabled => disable
			_sendRequest(tab.id, {
				disable: true
			});
			followerManager.toggle(tab.id, false);
		} else {
			// disabled => enable
			_sendRequest(tab.id, $.extend({}, _state, {
				enable: true
			}));
			followerManager.toggle(tab.id, true);
		}
	},

	/**
	 * 监听标签加载完成，加载UI
	 */
	_callbackOnUpdated = function(tabId, changeInfo, tab) {
		// 加载完成后注入UI
		if (changeInfo.status === 'complete') {
			// 断开已存在的port，保证使用新开port,避免使用到disconnected的port
			if (_ports[tabId]) {
				_ports[tabId].disconnect();
				delete _ports[tabId];
			}

			if (!followerManager.isExcluded(tab) && followerManager.isEnabled(tabId, tab)) {
				// 加载UI
				_sendRequest(tabId, $.extend(true, _state, {options: optionManager.getAll()}));
			} else {
				// 加载空UI
				_sendRequest(tabId, {});
			}
		}
	},

	/**
	 * 监听当前哪个tab上的follower被激活，更新_lastFollower
	 */
	_callbackOnSelectionChanged = function(tabId) {
		if (!followerManager.hasRegistered(tabId)) {
			// 如果中还没有注册， 注册, 并尝试启用
			// 用于instant preview 功能启用后
			chrome.tabs.get(tabId, function(tab) {
				// tab有可能无法获取到，chrome的问题
				if (tab) {
					followerManager.register(tab);
					if (followerManager.isEnabled(tabId, tab)) {
						_sendRequest(tabId, _state);
						//_sendRequest(tabId, $.extend(true, _state, {options: optionManager.getAll()}));
					}
				}
			});
		}

		//显示tab
		_sendRequest(tabId, {
			stateChange: {
				report: 'toggleHidden',
				returns: {
					hide: false
				}
			}
		});

		followerManager.updateLastActiveFollower(tabId);
		_lastFollowerId = tabId;

		_resetIdleWatcher();
	}

	/**
	 * 回调，当切换窗口时，更新follower
	 */
	_callbackOnFocusChanged = function(windowId) {
		if (windowId !== chrome.windows.WINDOW_ID_NONE) {
			// 从chrome窗口切换至chrome窗口
			chrome.tabs.getSelected(windowId, function(tab) {
				if (tab && followerManager.hasRegistered(tab.id)) {
					if (followerManager.isEnabled(_lastFollowerId)) {
						// 隐藏失去焦点的tab上的UI
						// 该状态更新不需要同步到state
						_sendRequest(_lastFollowerId, {
							stateChange: {
								report: 'toggleHidden',
								returns: {
									hide: true
								}
							}
						});
					}

					// 显示获得焦点的tab上的UI
					// 该状态更新不需要同步到state
					if (followerManager.isEnabled(tab.id)) {
						_sendRequest(tab.id, {
							stateChange: {
								report: 'toggleHidden',
								returns: {
									hide: false
								}
							}
						});
					}
				}

				if (tab) {
					_lastFollowerId = tab.id;
				}
			});
			_chromeFocused = true;
		} else {
			// 切换到非chrome窗口，啥都不干
			_chromeFocused = false;
		}
	},

	/**
	 * 通过port发送消息
	 */
	_sendRequest = function(tabId, data) {
		if (!_ports[tabId]) {
			// 新建port并发送消息
			// 给port添加tab信息，方便跟踪
			chrome.tabs.get(tabId, function(tab) {
				if (tab) {
					_ports[tabId] = chrome.tabs.connect(tabId, {
						name: '' + tabId
					});
					_ports[tabId].onMessage.addListener(boss._callbackOnRequest);
					_ports[tabId].onDisconnect.addListener(function(data) {
						delete _ports[tabId];
					});
					_ports[tabId].tab = tab;
					_ports[tabId].postMessage(data);
				}
			});
		} else {
			// 已经有连接好的port，发送消息
			_ports[tabId].postMessage(data);
		};
	},

	/**
	 * 把状态更新通知follower，带回调
	 */
	_sendResponse = function(followerId, stateChange, callback) {
		_sendRequest(followerId, {
			stateChange: stateChange,
			callback: callback
		});
	},

	/**
	 * 把状态更新通知所有follower
	 */
	_sendResponseToAll = function(stateChange, exceptFollowerId) {
		exceptFollowerId = exceptFollowerId || NaN;
		var followers = followerManager.get();
		for (followerId in followers) {
			followerId = parseInt(followerId);
			if (followerId != exceptFollowerId && followerManager.isEnabled(followerId)) {
				followerId = followerId || _lastFollowerId;
				_sendRequest(followerId, {
					'stateChange': stateChange
				});
			}
		}
	},

	_resetIdleWatcher = function() {
        if (false && _canReset) {
            console.warn('reset');
            if (_idleWatcher) {
                clearTimeout(_idleWatcher);
            }
            
            if (_idle) {
                _idle = false;
                console.error('exit idle');
            }

            _idleWatcher = setTimeout(function() {
                _idle = true;
                console.error('idle');
            }, _IDLE_TIME * 1000);

            _idleResetWatcher = setTimeout(function() {
                _canReset = true;
            }, _IDLE_RESET_TIME * 1000);

            _canReset = false;
        }
	},

	/**
	 * secretary通过report方法报告 状态变化
	 */
	report = function(report, parameters) {
		// 更新state
		var stateChange = _state.call(report, parameters);
		_sendResponseToAll(stateChange);
	},

	_optionUpdated = function(key, value) {
		report(key, {value: value});
	},

	hideNotifications = function() {
		//var n = _notifications[id];
		for (index in _notifications) {
			var n = _notifications[index];
			n && n.cancel();
		}
	},

	showNotification = function(icon, title, message) {
		if (optionManager.get('DESKTOP_NOTIFICATION') && _lastFollowerId && (!_chromeFocused || ! followerManager.isEnabled(_lastFollowerId))) {
			var encode = function(s) {
				return s;
			},
			new_id = Date.now(),
			params = {
				message: encode(message),
				title: encode(title),
				icon: encode(icon),
				id: new_id,
				timeout: 5000
			};
			var notification = webkitNotifications.createHTMLNotification(
				chrome.extension.getURL('html/notification.html?params=' + encodeURIComponent(JSON.stringify(params))));
			notification.show();
			notification.onclose = function() {
				delete _notifications[new_id];
			};
			_notifications[new_id] = notification;

			if (optionManager.get('SOUND_NOTIFICATION')) {
				$('#notification').get(0).play();
			}
		}
	},

	/**
	 * 
	 */
	log = function(message, level, keep) {
		console.log(message);

		if (typeof(level) === 'undefined') {
			level = 'info';
		}
		if (typeof(keep) === 'undefined') {
			keep = false;
		}
		message = '' || message;

		var stateChange = {
			report: 'log',
			returns: {
				message: message,
				level: level,
				keep: keep
			}
		};

		_state.call('log', {
			message: message,
			level: level,
			keep: keep
		});

		_sendResponseToAll(stateChange);
	},

	signout = function() {
		_secretary.call('signout', {});
		var stateChange = _state.call('signout', {});
		_sendResponseToAll(stateChange);
	},

	/**
	 * 注册feature，由feature调用
	 */
	registerFeature = function(featureName, type, feature) {
		if (!_features[featureName]) {
			_features[featureName] = {};
		}
		_features[featureName][type] = feature;
	},

	/**
	 * 加载feature，由secretary调用
	 */
	loadFeature = function(featureName, connection) {
		if (_features[featureName]) {
			_features[featureName]['loading'] = true;
			_features[featureName]['m'].load(_state);
			_features[featureName]['c'].load(connection, function(){
				_features[featureName]['loading'] = false;

				var done = true;
				for (index in _features) {
					if (typeof _features[index]['loading'] != 'undefined' && _features[index]['loading']) {
						done = false;
					}
				}
				
				if (done) {
					// 所有插件加载完成
					for (index in _features) {
						if (_features[index]['c'].done) {
							_features[index]['c'].done();
						}
					}
				}
			});

			_sendResponseToAll({report: 'loadFeature', featureName: featureName});
		}
	};

	return {
		init: init,
		report: report,
		registerFeature: registerFeature,
		loadFeature: loadFeature,

		showNotification: showNotification,
		hideNotifications: hideNotifications,
		log: log,
		signout: signout,

		_callbackOnRequest: _callbackOnRequest,
		_callbackOnClicked: _callbackOnClicked,
		_callbackOnSelectionChanged: _callbackOnSelectionChanged,
		_callbackOnUpdated: _callbackOnUpdated,
		_callbackOnFocusChanged: _callbackOnFocusChanged
	};

})();
