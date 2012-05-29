(function(boss, secretary) {
	boss.registerFeature('http://jabber.org/protocol/commands', 'c', {

		_connection: null,

		load: function(connection, done) {
			done();
			console.error('load commands');
			this._connection = connection;

			var service = this._connection.domain;
			var node = 'http://jabber.org/protocol/commands';

			if (this._connection.disco && this._connection.disco.discoverItems) {
				this._connection.disco.discoverItems(service, node, function(result) {
					console.warn(result);
				});
			}

			if (!this._connection._commandsRegistered) {
				//secretary.addHandler('changeSharedStatus', this._changeSharedStatus.bind(this));
				//secretary.addHandler('goInvisible', this._goInvisible.bind(this));

				this._connection._commandsRegistered = true;
			}
		},
	});
})(boss, secretary);
