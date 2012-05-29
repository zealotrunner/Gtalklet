(function(boss, secretary) {
	boss.registerFeature('http://jabber.org/protocol/archive#otr', 'c', {
		_connection: null,

		load: function(connection) {
			self._connection = connection;

            console.warn('load otr');
			self._connection.archive.listCollections('zealorunner@gmail.com/58D42871', null, function(result) {
				console.log('s');
                console.warn(result);
			});

            /*
			self._connection.gmailNotification.requestNewMails(function(mailbox) {
				//console.warn('requestNewMail');
				//console.warn(mailbox);
			});
            */
		},
	});
	boss.registerFeature('http://jabber.org/protocol/archive#save', 'c', {
		_connection: null,

		load: function(connection) {
			return;
			self._connection = connection;

            console.warn('load save');
            /*
			self._connection.gmailNotification.addNewMailHandler(function(mailbox) {
				//console.warn('recievedNotification');
				boss.report('recievedNotification', {unread: 3});
			});

			self._connection.gmailNotification.requestNewMails(function(mailbox) {
				//console.warn('requestNewMail');
				//console.warn(mailbox);
			});
            */
		},
	});
})(boss, secretary);
