(function(boss, s) {
	var featureName = 'google:shared-status';

	s.addStateConstants({
		PRESENCE_TYPE: {
			INVISIBLE: 'invisible'
		},
		PRESENCE_MESSAGE: {
			invisible: chrome.i18n.getMessage('invisible')
		},
	});

	boss.registerFeature(featureName, 'm', {
		register : function() {
			s.addHandler('statusShared', this.statusShared.bind(this));
			s.addHandler('goInvisible', this.goInvisible.bind(this));
		},

		load : function() {
			if (!s.featureLoaded(featureName)) {
				var commands = s.constants.CONSOLE_COMMANDS.COMPLETE;
				var invisiblePushed = false;
				for (index in commands) {
					if (commands[index].classes == 'invisible') {
						invisiblePushed = true;
					}
				}
				if (!invisiblePushed) {
					commands.push({
						classes: 'invisible',
						title: chrome.i18n.getMessage('invisible'),
						weight: 15,
					});
				}

				s.loadedFeature(featureName);
			}

			s.addState({
				user: {
					presence: {
						invisible: false,
					}
				}
			});
		},

		statusShared : function(parameters, returns) {
			// parameters.show
			// parameters.status

			parameters.show = parameters.show || 'chat';
			parameters.show = parameters.show == 'default' ? 'chat' : parameters.show;

			s.state.user.presence.invisible = false;
			s.state.user.presence.type = parameters.show;
			s.state.user.presence.message = parameters.status;
		},

		goInvisible : function(parameters, returns) {
			// parameters.show
			// parameters.status
			s.state.user.presence.invisible = true;

			returns.jid = s.state.user.jid;
			returns.invisible = true;
		},
		invisibleLost: function(parameters, returns) {

		},
	});
})(boss, state);
