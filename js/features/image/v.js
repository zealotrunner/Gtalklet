(function(assistant, $) {
	selectors = assistant.selectors();

	assistant.registerFeature('image', {
		actions: {
			// 处理gtalk风格markdown
			urlToImage: {
				run: function() {
					$(selectors.timeline).urlToImg({class: 'gtalklet_message_image'});
				},
				load: function() {
					this.run();
				}
			},
			showMessages: {
				run: function(threadId, messages, unread, removeOldest) {
					threadId = threadId || '';

					var $panel = $('div[data-thread-id="' + threadId + '"]');
					var $timeline = $('.gtalklet_timeline', $panel);
					assistant.callAction('urlToImage', 'run', []);
				}
			},
		}
	});
})(assistant, gtalklet.$);
