(function(boss, secretary) {
	boss.registerFeature('google:mail:notify', 'c', {
		/**
		 * gmail notification
		 *
		 * @provides
		 */
		_connection: null,
		self: this,

		load: function(connection, done) {
            console.error('loaded notify');
			self._connection = connection;

			self._connection.gmailNotification.addNewMailHandler(function(mailbox) {
				console.warn('recievedNotification');
				boss.report('recievedNotification', {unread: 3});
			});

			self._connection.gmailNotification.requestNewMails(function(mailbox) {
                console.warn('requestNewMail');
				console.warn(mailbox);
			});

			done();
		},
	});
})(boss, secretary);
