var secretary = (function() {

	var _connection = null,
	_features = {},
	_handlers = {},

	_watchInterval = null,
	_disconnectReason,

	init = function() {
		// 自动登录
		if (optionManager.get('AUTO_SIGN_IN') !== false) {
			setTimeout(function() {
				signin();
			}, 2000);
		}
		
	},

	addHandler = function(handlerName, handler) {
		_handlers[handlerName] = handler;
	},

	addFeature = function(featureName, feature) {
		_features[featureName] = feature;
	},

	reset = function() {
		if (_connection) {
			_connection.reset();
		}
	},

	signin = function() {
		var service = optionManager.get('BOSH_SERVICE');
		var jid = optionManager.get('JID');
		var password = optionManager.get('PASSWORD');

		if (service && jid && password) {
			_connect(service, jid, password);
		}
	},

	signout = function() {
		if (_connection) {
			clearInterval(_watchInterval);
			_connection.disconnect('logout');
		}
	},

	// 是否是连接或正在连接阶段或等待重连
	isActive = function() {
		var conn = _connection
		if (conn) {
			// connecting connection_lost 不是 strophe 原生属性
			if (conn.connecting || conn.connected || conn.authenticated || conn.disconnecting || conn.connection_lost) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	},

	_registerFeatures = function(parameters) {
		var service = _connection.domain;
		var node = null;

		_connection.disco.discoverInfo(service, node, function(result) {
			var features = result.getFeatures();
			for (var i in features) {
				var featureName = features[i].featureName;
				if (typeof(_connection.disco.features) == 'undefined') {
					_connection.disco.features = [];
				}
				_registerFeature(featureName);
			}
		});

		/*
		<iq to="wodemaja@gmail.com/8A058BD3" from="gmail.com" id="7568:serviceDisco" type="result">
			<query xmlns="http://jabber.org/protocol/disco#info">
			<identity category="server" type="im" name="Google Talk"></identity>
			<feature var="http://jabber.org/protocol/disco#info"></feature>
			<feature var="google:jingleinfo"></feature>
			<feature var="google:roster"></feature>
			<feature var="google:nosave"></feature>
			<feature var="google:setting"></feature>
			<feature var="google:shared-status"></feature>
			<feature var="http://jabber.org/protocol/archive#otr"></feature>
			<feature var="google:queue"></feature>
			<feature var="google:mail:notify"></feature>
			<feature var="http://jabber.org/protocol/archive#save"></feature>
			<feature var="http://jabber.org/protocol/rosterx"></feature>
			</query>
		</iq>
		 */
	},

	_registerFeature = function(featureName) {
		boss.loadFeature(featureName, _connection);
	},

	_connected = function() {
		// connected 状态后才加载
		// 加载xmpp基础功能
		_registerFeature('xmpp');

		//_registerFeature('image');

		// google 
		if (_connection.isGoogle) {
			_registerFeature('gtalk');
		}

		// 不是facebook账户时,加载一些模块
		if (!_connection.isFacebook) {
			_registerFeature('xmpp_presence');
			_registerFeature('xmpp_invite');
		}

		// 加载disco支持的xmpp扩展
		_registerFeatures();

		for (index in _features) {
			if (_features[index].connected) {
				_features[index].connected(_connection);
			}
		}
	},

	_watchErrorsWhenConnecting = function() {
		// 在登录阶段, 每五秒检测一次errors，如果大于3，则判断为无法连接
		if (_watchInterval) {
			clearInterval(_watchInterval);
		}

		var conn = _connection;

		_watchInterval = setInterval(function() {
			if (conn && conn.errors > 3) {
				clearInterval(_watchInterval);
				// 连接已经断开
				boss.log('<div class="gtalklet_clear" title="">' + chrome.i18n.getMessage('connectError') + ' [<a class="gtalklet_retry">' + chrome.i18n.getMessage('retry')+ '</a>]</div>', 'error', true);
				conn.disconnect('logout');
				conn.connecting = false;
				boss.report('connectError', {});
			} else {
}

			return true;
		}, 5000);
	},

	_clearBoshManagerCookies = function(url) {
		// 现在仅仅用来清除AWS Load Balancer的cookie
		name = 'AWSELB';
		chrome.cookies.remove({'url': url, 'name': name});
	},

	_connect = function(url, jid, password) {
		_connection = new Strophe.Connection(url);

		var domain = Strophe.getDomainFromJid(jid);
		var route = '';

		_connection.isGoogle = domain == 'gmail.com' || domain == 'googlemail.com' || optionManager.get('SERVICE') == 'google';
		_connection.isFacebook = domain == 'chat.facebook.com' || optionManager.get('SERVICE') == 'facebook';

		if (_connection.isFacebook) {
			route = 'xmpp:chat.facebook.com:5222';
			boss.report('setService', {service: 'facebook'});
		} else if (_connection.isGoogle) {
			route = 'xmpp:talk.google.com:5222';
			boss.report('setService', {service: 'google'});
		}

		try {
			_connection.connect(jid, password, function(status, condition) {
				switch (status) {
				case Strophe.Status.CONNECTING:
					_watchErrorsWhenConnecting();
					_disconnectReason = '';
					_connection.connecting = true;
					_connection.connection_lost = false;

					boss.log('<div class="gtalklet_clear" title="' + url + '">' + chrome.i18n.getMessage('connecting') + ' [<a class="gtalklet_cancel_connect" title="' + chrome.i18n.getMessage('cancel') + '">' + chrome.i18n.getMessage('cancel') + '</a>]</div>', 'info', true);

					boss.report('connecting', {});
					break;
				case Strophe.Status.AUTHENTICATING:
					_watchErrorsWhenConnecting();
					_connection.connecting = true;

					boss.log('<div class="gtalklet_clear" title="' + jid + '">' + chrome.i18n.getMessage('authenticating') + ' [<a class="gtalklet_cancel_connect" title="' + chrome.i18n.getMessage('cancel') + '">' + chrome.i18n.getMessage('cancel') + '</a>]</div>', 'info', true);

					break;
				case Strophe.Status.CONNECTED:
					_connection.connecting = false;

					boss.log(chrome.i18n.getMessage('connected'));

					clearInterval(_watchInterval);
					_connected();
					break;
				case Strophe.Status.DISCONNECTING:
					console.warn('disconnecting');
					if (condition === 'logout') {
						_disconnectReason = 'logout';
					} else {
						_disconnectReason = '';
					}

					_connection.connecting = false;

					break;
				case Strophe.Status.DISCONNECTED:
					console.warn('disconnected');
					console.warn(_disconnectReason);
					if (_disconnectReason && _disconnectReason === 'logout') {
						_connection.connecting = false;
						boss.report('connectError', {});
					} else {
						boss.log('<div class="gtalklet_clear" title="">' + chrome.i18n.getMessage('connectionLost') + ' [<a class="gtalklet_retry">' + chrome.i18n.getMessage('retry') + '</a>] [<a class="gtalklet_cancel_connect" title="' + chrome.i18n.getMessage('cancel') + '">' + chrome.i18n.getMessage('cancel') + '</a>]</div>', 'error', true);
						_connection.connecting = false;
						_connection.connection_lost = true;

						boss.report('connecting', {});
					}

					_clearBoshManagerCookies(url);

					break;
				case Strophe.Status.CONNFAIL:
					boss.log(chrome.i18n.getMessage('connectionFailed'), 'error', true);
					_connection.connecting = false;

					// Strophe没有正确的设置这两个值 ?是么
					_connection.connected = false;
					_connection.disconnecting = false;

					boss.report('connectError', {});

					_clearBoshManagerCookies(url);
					_connection.disconnect('logout');
					break;
				case Strophe.Status.AUTHFAIL:
					boss.log(chrome.i18n.getMessage('authenticationFailed'), 'error', true);
					_connection.connecting = false;

					boss.report('connectError', {});
					_connection.disconnect('logout');
					break;
				case Strophe.Status.ERROR:
				default:
					boss.log(chrome.i18n.getMessage('somethingError'), 'error');
					_connection.connecting = false;

					boss.report('connectError', {});
					_clearBoshManagerCookies(url);
					_connection.disconnect('logout');
					break;
				}
			}, 30, 1, route);
		} catch(error) {
			console.dir(error);
		}
	}

	call = function(report, parameters) {
		if (_handlers[report]) {
			_handlers[report](parameters);
		} else {
			switch (report) {
				case 'signin':
					signin();
					break;
				case 'signout':
					signout();
					break;
				default:
					break;
			}
		}
	};

	return {
		init: init,
		addHandler: addHandler,
		addFeature: addFeature,
		reset: reset,
		signin: signin,
		signout: signout,
		isActive: isActive,
		call: call
	};
})();
