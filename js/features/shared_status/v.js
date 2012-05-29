(function(assistant, $) {
	selectors = assistant.selectors();

	assistant.registerFeature('google:shared-status', {
		selectors: {
		},
		actions: {
			statusShared: {
				callback: function(returns) {
					// returns.show
					// returns.status
					$(selectors.myPresence + ' > .gtalklet_presence').switchToClass(returns.show);
				}
			},
			invisibleLostOK: {
				run: function() {
					assistant.callAction('clearInfo', 'run');
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate('.gtalklet_ok', 'click', function() {
						base.run();
					});
				}
			},
			changeSharedStatus: {
				run: function(type, message) {
					var base = this;
					type = type || '';
					message = message || '';
					follower.report('changeSharedStatus', {
							show: type,
							status: message
						}, function(stateChange) {
							base.callback(stateChange.returns);
						}
					);
					assistant.callAction('invisibleLostOK', 'run');
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.presence + '.chat, ' + selectors.presence + '.dnd', 'click', function() {
						var presence = $(this).data('presence');
						base.run(presence, '');
					});
				},
				callback: function(returns) {
					// no nothing
				}
			},
			goInvisible: {
				run: function() {
					var base = this;
					follower.report('goInvisible', {}, function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.presence + '.invisible', 'click', function() {
						base.run();
					});
				},
				callback: function(returns) {
					// returns.invisible = true | false
					// returns.jid
					$(selectors.myPresence + ' > .gtalklet_presence').switchToClass('invisible').attr('title', returns.jid);
				},
			},
		}
	});
})(assistant, gtalklet.$);
