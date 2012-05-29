(function(boss, s) {
	var featureName = 'http://jabber.org/protocol/commands';
	boss.registerFeature(featureName, 'm', {

		register : function() {

		},

		load : function() {
			if (!s.featureLoaded(featureName)) {
				s.loadedFeature(featureName);
			}
		},
	});
})(boss, state);
