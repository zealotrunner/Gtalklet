(function(boss, s) {
	var featureName = 'image';

	/*
	s.addStateConstants({

	});

	s.addState({

	});
	*/

	boss.registerFeature(featureName, 'm', {
		register : function() {
			//pass
		},

		load : function() {
			if (!s.featureLoaded(featureName)) {
				s.loadedFeature(featureName);
			}
		}
	});
})(boss, state);
