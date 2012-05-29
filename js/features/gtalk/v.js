(function(assistant, $) {
	selectors = assistant.selectors();

	assistant.registerFeature('gtalk', {
		actions: {
			// 处理gtalk风格markdown
			gtalkMarkdown: {
				run: function() {
					$(selectors.timeline).gtalkMarkdown({'strongClass': 'gtalklet_strong', 'italicClass': 'gtalklet_italic'});
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
					assistant.callAction('gtalkMarkdown', 'run', []);
				}
			},
		}
	});
})(assistant, gtalklet.$);
