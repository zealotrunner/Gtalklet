(function(boss, secretary) {
	boss.registerFeature('google:shared-status', 'c', {
		/**
		 * share stauts messages
		 * @implements register
		 * @implements connected
		 *
		 * @provides
		 */
		_connection: null,

		load: function(connection, done) {
			this._connection = connection;
			this._connection.googleSharedStatus.requestSharedStatusList(function(){done()});

			if (!this._connection._googleSharedStatusRegistered) {
				secretary.addHandler('changeSharedStatus', this._changeSharedStatus.bind(this));
				secretary.addHandler('goInvisible', this._goInvisible.bind(this));

				this._connection.googleSharedStatus.addSharedStatusChangedHandler(this._sharedStatusChangedCallback.bind(this));

				this._connection._googleSharedStatusRegistered = true;
			}
		},

		_changeSharedStatus: function(parameters) {
			var show = '';
			var status = '';
			if (parameters) {
				show = parameters.show;
				status = parameters.status;
			}

			this._connection.googleSharedStatus.changeSharedStatus(show, status);
		},
		_goInvisible: function() {
			this._connection.googleSharedStatus.goInvisible();
		},

		_sharedStatusChangedCallback: function(attributes) {
			var show = attributes.show;
			var status = attributes.status;
			var isInvisible = attributes.invisible;
			if (isInvisible) {
				if (attributes.statusMinVer >= 2) {
					boss.report('goInvisible', {
						show: show,
						status: status
					});
				} else {
					var message = '<span class="gtalklet_clear" title="' + chrome.i18n.getMessage('stillVisibleBecause') + '">' + chrome.i18n.getMessage('stillVisible') + ' [<a class="gtalklet_ok" title="' + chrome.i18n.getMessage('ok') + '">' + chrome.i18n.getMessage('ok') + '</a>]</span>';
					boss.log(message, 'warn', true);

					boss.report('goInvisible', {
						show: show,
						status: status
					});
				}
			} else {
				boss.report('statusShared', {
					show: show,
					status: status
				});
			}
		},
	});
})(boss, secretary);
