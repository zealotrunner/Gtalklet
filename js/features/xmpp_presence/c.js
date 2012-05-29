(function(boss, secretary) {
	boss.registerFeature('xmpp_presence', 'c', {
		load: function(connection, done) {
			done();
		},
	});
})(boss, secretary);
