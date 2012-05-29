(function(boss, secretary) {
	boss.registerFeature('xmpp_invite', 'c', {
		/**
		 * xmpp 邀请、接受邀请功能
		 *
		 * @provides invite
		 */
		_connection: null,

		load: function(connection, done) {
			this._connection = connection;

			if (!this._connection._xmppInviteRegistered) {
				secretary.addHandler('invite', this._invite.bind(this));
				secretary.addHandler('acceptInvitation', this._acceptInvitation.bind(this));
				secretary.addHandler('rejectInvitation', this._rejectInvitation.bind(this));

				this._connection._xmppInviteRegistered = true;
			}

			done();
		},

		_invite: function(parameters) {
			var jid = parameters.jid || '';
			var jidReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
			if (jid && jidReg.test(jid) === true) {
				return this._connection.roster.subscribe(jid);
			} else {
				return false;
			}
		},
		_acceptInvitation: function(parameters) {
			var jid = parameters.jid || '';
			return this._connection.roster.subscribe(jid);
		},
		_rejectInvitation: function(parameters) {
			var jid = parameters.jid || '';
			return this._connection.roster.unsubscribed(jid);
		},
	});
})(boss, secretary);
