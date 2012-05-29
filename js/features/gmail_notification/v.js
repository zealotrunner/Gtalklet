(function(assistant, $) {
	selectors = assistant.selectors();

	assistant.registerFeature('gmailNotification', {
		actions: {
			recievedNotification: {
				callback: function(returns) {
					//console.error('ssssss');
					//console.error(returns);
					//returns.unread
					//returns.consoleState
					var $console = $(selectors.console);
					$console.switchToClass(returns.consoleState).addClass('unread');

				}
			},
			readNotification: {
				run: function() {
					
				},
				delegate: function() {
					
				},
				callback: function() {
				}
			},
			openGmail: {
				run: function() {
					
				},
				delegate: function() {

				}
			}
		}
	});
})(assistant, gtalklet.$);
