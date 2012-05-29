(function(boss, secretary) {
	boss.registerFeature('gtalk', 'c', {
		_connection: null,

		load: function(connection, done) {
			done();
		},
	});
})(boss, secretary);
