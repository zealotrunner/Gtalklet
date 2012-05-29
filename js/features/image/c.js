(function(boss, secretary) {
	boss.registerFeature('image', 'c', {
		_connection: null,

		load: function(connection, done) {
			done();
		},
	});
})(boss, secretary);
