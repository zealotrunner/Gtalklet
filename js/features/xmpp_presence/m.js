(function(boss, s) {
	var featureName = 'xmpp_presence';

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
				var commands = s.constants.CONSOLE_COMMANDS.COMPLETE;
				var chatPushed = false;
				var dndPushed = false;
				for (index in commands) {
					if (commands[index].classes == 'chat') {
						chatPushed = true;
					}
					if (commands[index].classes == 'dnd') {
						dndPushed = true;
					}
				}

				if (!chatPushed) {
					commands.push({
						classes: 'chat',
						title: chrome.i18n.getMessage('Available'),
						weight: 20,
					});
				}

				if (!dndPushed) {
					commands.push({
						classes: 'dnd',
						title: chrome.i18n.getMessage('Busy'),
						weight: 30,
					});
				}

				s.loadedFeature(featureName);
			};
		}
	});
})(boss, state);
