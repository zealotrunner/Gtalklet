(function(assistant, $) {
	selectors = assistant.selectors();

	assistant.registerFeature('xmpp_invite', {
		actions: {
			/* see xmpp filter */
			filter: {
				callback: function(returns) {
					// returns.segment
					// returns.matchedContacts;
					// returns.matchedContactsSum;
					// returns.isAll;
					var segment = returns.segment;
					var matchedContacts = returns.matchedContacts;
					var matchedContactsSum = returns.matchedContactsSum;
					var all = returns.isAll;
					var self = returns.self;

					$(selectors.filter).removeClass('invalid').removeClass('invited').removeAttr('title');

					if (self || !all) {
						// @ filter 不需同步
						if (matchedContacts.length > 0) {
							$('.gtalklet_invite').hide();
						} else {
							if (segment === '') {
								$('.gtalklet_invite').hide();
							} else {
								$('.gtalklet_invite').removeClass('invited').attr('title', chrome.i18n.getMessage('InviteToChat')).show();
							}
						}
					}
				}
			},
			invite: {
				run: function() {
					var base = this;
					var jid = $(selectors.filter).val();

					follower.report('invite', {
						jid: jid
					},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate('.gtalklet_invite', 'click', function() {
						base.run();
					});
				},
				callback: function(returns) {
					// returns.invited = true|false
					// returns.invalidJid = true|false
					if (returns.invited) {
						$('.gtalklet_invite').addClass('invited').attr('title', chrome.i18n.getMessage('Invited'));
					} else if (returns.invalidJid) {
						// jid不合法
						$(selectors.filter).addClass('invalid').attr('title', chrome.i18n.getMessage('InvalidJid', returns.jid));
					} else {

					}
				}
			},
			acceptInvitation: {
				run: function(jid) {
					var base = this;

					follower.report('acceptInvitation', {
						jid: jid
					},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate('.gtalklet_invited_ok', 'click', function() {
						var jid = $(this).attr('data-jid');
						base.run(jid);
					});
				},
				callback: function(returns) {
					// returns.threadId
					var threadId = returns.threadId;
					var $thread = $('.gtalklet_thread[data-thread-id=' + threadId + ']');
					$(selectors.chatTextarea, $thread).removeAttr('disabled');

					$('.gtalklet_message:not(.prototype)', $thread).fadeOut();
					$('.gtalklet_chat_form_mask', $thread).fadeOut();
				}
			},
			rejectInvitation: {
				run: function(jid) {
					var base = this;

					follower.report('rejectInvitation', {
						jid: jid
					},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate('.gtalklet_invited_no', 'click', function() {
						var jid = $(this).attr('data-jid');
						base.run(jid);
					});
				},
				callback: function(returns) {
					// returns.threadId
					var threadId = returns.threadId;
					var $thread = $('.gtalklet_thread[data-thread-id=' + threadId + ']');
					$(selectors.chatTextarea, $thread).removeAttr('disabled');

					$('.gtalklet_message:not(.prototype)', $thread).fadeOut();
				}
			},
		}
	});
})(assistant, gtalklet.$);
