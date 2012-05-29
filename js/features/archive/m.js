(function(boss, s) {
	boss.registerFeature('http://jabber.org/protocol/archive#otr', 'm', {
		_state: {
		},

        register: function() {

        },
		load: function() {
			s.addState(this._state);

			//s.addHandler('statusShared', this.statusShared.bind(this));
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

	boss.registerFeature('http://jabber.org/protocol/archive#save', 'm', {
		_state: {
		},

        register: function() {

        },
		load: function() {
			s.addState(this._state);

			//s.addHandler('statusShared', this.statusShared.bind(this));
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
