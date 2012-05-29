(function(boss, s) {
	var featureName = 'google:mail:notify';
    var _state =  {
        mail: {
            new: false,
            unread: 0,
        },
    };

    //s.addState(this._state);

	boss.registerFeature(featureName, 'm', {
		register : function() {
            console.error('registered notify');

			//s.addHandler('statusShared', this.statusShared.bind(this));
		},

        load : function() {
			if (!s.featureLoaded(featureName)) {
				s.loadedFeature(featureName);
			}
        },

		/*
		statusShared : function(parameters, returns) {
			// parameters.show
			// parameters.status
			//
			s.user.presence.type = parameters.show;
			s.user.presence.message = parameters.status;
		},
		*/

	});
})(boss, state);
