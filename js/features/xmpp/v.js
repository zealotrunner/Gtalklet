(function(assistant, $) {
	selectors = assistant.selectors();

	assistant.registerFeature('xmpp', {
		selectors: {
			openFilterButton : '#gtalklet_operation .gtalklet_toggle_filter',
			filterPanel : '#gtalklet_filter_panel',
			filter : '#gtalklet_filter_panel input.gtalklet_filter',

			contact : '#gtalklet_filter_panel .gtalklet_contact',
			contactName : '#gtalklet_filter_panel .gtalklet_contact_name', 
			contactJid : '#gtalklet_filter_panel .gtalklet_contact_jid', 
			contactAvatar : '#gtalklet_filter_panel .gtalklet_contact_avatar', 

			console: '#gtalklet_console',
			newMessage: '#gtalklet_console .gtalklet_new_message',
			presence: '#gtalklet_console .gtalklet_jump_list .gtalklet_presence',
			myPresence: '#gtalklet_console .gtalklet_my_presence',
			options: '#gtalklet_console .gtalklet_options',

			thread: '.gtalklet_thread',
			titleBar : '.gtalklet_thread .gtalklet_title_bar',
			close: '.gtalklet_close_thread',
			timeline : '.gtalklet_timeline',
			chatForm : '.gtalklet_chat_form',
			chatTextarea : 'form.gtalklet_chat_form textarea[name=gtalklet_chat]',

			sensitive: '#gtalklet_operation, #gtalklet_filter_panel, #gtalklet_console, .gtalklet_badge, .gtalklet_jump_list, .gtalklet_thread'
		},
		actions: {
			// 打开设置页
			options: {
				delegate: function() {
					assistant.$layer().delegate(selectors.options, 'click', function() {
						follower.report('showExtensionOption');
					});
				},
			},
			urlToLink: {
				load: function() {
					// url转链接
					$(selectors.timeline).autoLink({'class': 'gtalklet_message_link'});
				}
			},
			clickToFocus: {
				delegate: function() {
					assistant.$layer().delegate(selectors.timeline, 'click', function() {
						var $textarea = $('textarea[name=gtalklet_chat]', $(this).closest('div.gtalklet_thread'));
						if ($textarea.is(':focus')) {
							$textarea.blur();
						} else {
							$textarea.focus().get(0).setSelectionRange(999, 999);
						}
					});
				},
			},
			enterToSend: {
				delegate: function() {
					// 回车提交表单
					assistant.$layer().delegate(selectors.chatTextarea, 'keydown', function(event) {
						if (event.which == 13) {
							if (event.ctrlKey) {
								//$(this).val($(this).val() + '\n');
							} else if (event.shiftKey) {

							} else {
								$(this).closest('form.gtalklet_chat_form').submit();
								event.preventDefault();
							}
						}
					});
				},
			},
			signin: {
				run: function() {
					var base = this;
					follower.report('signin', {}, function(stateChange) {
						base.callback(stateChange.returns);
					}); // 没有回调，登录成功后会调connected
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.presence + '.signin', 'click', function() {
						base.run();
					});
				},
				callback: function() {
				},
			},
			retry: {
				delegate: function() {
					// 登录超时，重试
					assistant.$layer().delegate('#gtalklet_info .gtalklet_retry', 'click', function() {
						follower.report('signin'); // 没有回调，登录成功后会调connected
					});
				},
			},
			cancelSignIn: {
				delegate: function() {
					// 取消登录
					assistant.$layer().delegate('#gtalklet_info .gtalklet_cancel_connect', 'click', function() {
						//follower.report('signin'); // 没有回调，登录成功后会调connected
						assistant.callAction('signout', 'run');
					});
				},
			},
			signout: {
				run: function() {
					var base = this;
					follower.report('signout', {},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.presence + '.signout', 'click', function() {
						base.run();
					});
				},
				callback: function(returns) {
					if (returns.signout && returns.defaultState) {
						assistant.destroy();
						assistant.build(returns.defaultState);
					}
				}
			},
			// 切换控制台菜单状态
			toggleConsole: {
				run: function(expand) {
					var base = this;
					follower.report('toggleConsole', {
						expand: expand
					},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.myPresence + ' .gtalklet_presence:not(.gtalklet_options)', 'click', function() {
						base.run();
					});
				},
				callback: function(returns) {
					// returns.newState 控制台菜单的状态
					var $jumpList = $('#gtalklet_console .gtalklet_jump_list');

					$jumpList.switchToClass(returns.newState);
				}
			},
			// 切换控制台菜单命令
			toggleConsoleCommands: {
				load: function() {
					// run 了会导致block失效
					// 而且我忘了为什么要run
					//this.run();
				},
				run: function(commands) {
					var base = this;
					follower.report('getCommands', {}, function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				callback: function(returns) {
					// returns.commands
					commands = returns.commands || [];
					var $jumpList = $(selectors.console + ' .gtalklet_jump_list').empty();
					var fragment = document.createDocumentFragment();
					fragment.appendChild($('<div class="gtalklet_jump_list_item gtalklet_icon_button gtalklet_options" title="' + chrome.i18n.getMessage('options') + '"></div>').get(0));
					for (index in commands) {
						var $command = $('<div class="gtalklet_jump_list_item gtalklet_icon_button gtalklet_presence"></div>');
						$command.addClass(commands[index].classes).attr('data-presence', commands[index].classes).attr('title', commands[index].title);
						fragment.appendChild($command.get(0));
					}
					$jumpList.append($(fragment));
				},
			},
			// 切换在线状态
			changePresence: {
				run: function(type, message) {
					type = type || '';
					message = message || '';
					var base = this;
					follower.report('changePresence', {
						show: type,
						status: message
					},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.presence + '.chat, ' + selectors.presence + '.dnd', 'click', function() {
						var presence = $(this).data('presence');
						base.run(presence, '');
					});
				},
				callback: function(returns) {
					// returns.jid
					// returns.presence
					var $presence = $(selectors.myPresence + ' > .gtalklet_presence');
					$presence.switchToClass(returns.presence.type).attr('title', returns.jid);
				}
			},
			// 收缩/展开面板
			/**
			 * @required read
			 * @required bindScrollToProperPosition
			 */
			togglePanel: {
				run: function(panelId, expand) {
					panelId = panelId || '';
					var base = this;
					follower.report('togglePanel', {
						panelId: panelId,
						expand: expand
					},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.titleBar, 'click', function() {
						var $panel = $(this).parent();
						var threadId = $panel.attr('data-thread-id');
						assistant.callAction('read', 'run', [threadId]);
						base.run(threadId, undefined);
					}).delegate(selectors.titleBar, 'mousedown', function(event) {
						event.preventDefault();
					});
				},
				callback: function(returns) {
					// returns.panelId; 操作对象panelId
					// returns.newState; 操作对象pannel的最终状态
					var panelId = returns.panelId;
					var newState = returns.newState;
					var $panel = $('div[data-thread-id="' + panelId + '"]');
					var $textarea = $('textarea[name=gtalklet_chat]', $panel);

					$panel.switchToClass(newState);

					if (returns.newState == 'normal') {
						if (!$textarea.not('[disabled]').is(':focus')) {
							$textarea.focus();
						}
					} else {
						$textarea.blur();
					}
				}
			},
			// 显示消息
			/**
			 * @required read
			 */
			showMessages: {
				run: function(threadId, messages, unread, removeOldest) {
					threadId = threadId || '';
					messages = messages || [];
					unread = unread || false;
					removeOldest = removeOldest || false;

					var $panel = $('div[data-thread-id="' + threadId + '"]');
					if ($panel.length) {
						var $timeline = $('.gtalklet_timeline', $panel);

						var prototype = $('.gtalklet_message.prototype', $timeline).clone().removeClass('prototype');

						var fragment = document.createDocumentFragment();
						for (index in messages) {
							var $newMessage = prototype.clone().addClass(messages[index].type).find('.gtalklet_message_wrapper').attr('title', messages[index].time).html(messages[index].content).end(); // html() safe, background encoded
							if (messages[index].showTime) {
								$newMessage.find('.gtalklet_time').text(messages[index].time);
							}

							fragment.appendChild($newMessage.autoLink({
								'class': 'gtalklet_message_link'
							}).show().get(0));
						}
						$timeline.append($(fragment));

						if (removeOldest) {
							$('.gtalklet_message:not(.prototype)', $timeline).first().remove();
						}

						// 标题栏未读提示
						if (unread) {
							if ($('textarea[name=gtalklet_chat]', $panel).is(':focus')) {
								assistant.callAction('read', 'run',[$panel.attr('data-thread-id')]);
							} else {
								$panel.addClass(unread);
							}
						}

						// timeline滚动到最下方
						$timeline.scrollTop(9999);
					}
				}
			},
			// 展开/收缩filter面板
			toggleFilterPanel: {
				run: function(expand) {
					var base = this;
					follower.report('toggleFilterPanel', {
						expand: expand
					},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.openFilterButton, 'click', function() {
						base.run();
					});
					assistant.$layer().delegate(selectors.filter, 'blur', function() {
						if (false && $(this).val() === '') {
							base.run(false);
						}
					});
				},
				callback: function(returns) {
					// returns.newState 控制台菜单的状态
					var newState = returns.newState;

					var $filterPanel = $(selectors.filterPanel);
					var $openFilterButton = $(selectors.openFilterButton);
					var $filter = $(selectors.filter);

					$filterPanel.switchToClass(newState);

					if ($filter.is(':visible')) {
						$filter.focus();
						$openFilterButton.switchToClass('close');
					} else {
						$filter.val('').trigger('REFRESH_FILTER');
						$openFilterButton.switchToClass('open');
					}
				}
			},
			/**
			 * @required toggleFilterPanel
			 * @required highlightMatches
			 */
			filter: {
				run: function(segment) {
					segment = segment || '';
					var base = this;
					follower.report('filter', {
						segment: segment
					},
					function(stateChange) {
						//
						////////
						assistant.callAction('filter', 'callback', [stateChange.returns]);
						//base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					var $filterPanel = $(selectors.filterPanel);
					assistant.$layer().delegate(selectors.filter, 'REFRESH_FILTER', function(event, data) {
						var segment = data && data.content || '';
						base.run(segment);
					}).delegate(selectors.filter, 'keyup', function(event) {
						if ($.inArray(event.which, [16, 37, 38, 39, 40]) != - 1) {
							// 特殊键，定制事件
							if (event.which == 38 && $(this).val() == '') {
								var $matchedContacts = $('.gtalklet_contact', $filterPanel);
								// 按上箭头时，如果没有面板，打开面板
								if ($matchedContacts.length == 0) {
									$('.gtalklet_message:not(.prototype)', $filterPanel).addClass('loading');
									assistant.callAction('allContactsPanel', 'run');
								}
							}
							event.stopPropagation();
						} else if (event.which == 50) { 
							// @号
							if (!$(this).val() || $(this).val() == '@') {
								if (event.shiftKey) {
									event.preventDefault();
								} else { // 处理：先释放Shift后释放@键的情况
									event.preventDefault();
								}
							} else {
								$(this).trigger('REFRESH_FILTER', {content: $(this).val()});
							}
						} else {
							// 一般字符
							$(this).trigger('REFRESH_FILTER', {content: $(this).val()});
						}
					}).delegate(selectors.filter, 'keydown', function(event) {
                        event.stopPropagation();
						if (event.which == 13) {
							// 回车
							var $currentMatchedContacts = $('.gtalklet_contact.current', $filterPanel);
							$currentMatchedContacts.eq(0).click();
						} else if (event.which == 38 || event.which == 40) {
							// 上下箭头
							var $matchedContacts = $('.gtalklet_contact', $filterPanel);
							var $current = $matchedContacts.filter('.current');

							var method = event.which == 38 ? 'prev': 'next';

							var $target = null;
							if ($current.length === 0) {
								// 还没有选中联系人
								if (method == 'next') {
									$target = $matchedContacts.first();
								} else {
								$target = $matchedContacts.last();
								}
								$target.addClass('current');
							} else if ($current.length === 1) {
								// 已有选中联系人
								$current.removeClass('current');
								$target = $current.eq(0)[method](':not(.prototype)');
								$target.addClass('current');
							}

							var position = $target.position();
							var itemHeight = $matchedContacts.eq(0).height();
							if (position && (position.top < 0 || position.top >= itemHeight * 15)) {
								$('.gtalklet_contacts').scrollTo($target, 0, {offset: 0 - 8 * itemHeight});
							}

							event.stopPropagation();
							event.preventDefault();
						} else if (event.which == 50 && event.shiftKey) { // @
							if (!$(this).val()) {
								assistant.callAction('allContactsPanel', 'run');
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}).delegate(selectors.contact, 'hover', function(event) {
						$(selectors.contact).removeClass('current');
						$(this).addClass('current');
					}).delegate(selectors.filter, 'keypress', function(event) {
                        // prevent twitter conflict
                        event.stopPropagation();
                    });

				},
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

					var $contactsTimeline = $('#gtalklet_filter_panel .gtalklet_contacts');

					if (!self) {
						$(selectors.filter).val(segment);
					}

					if (self || !all) {
						// @ filter 不需同步
					if (matchedContacts.length > 0) {
						$('.gtalklet_all_contacts').hide();
						$('.gtalklet_contact, .gtalklet_message:not(.prototype)', $contactsTimeline).remove();
						var fragment = document.createDocumentFragment();
						if (matchedContactsSum - matchedContacts.length > 0) {
							fragment.appendChild($('<div class="gtalklet_message">' + chrome.i18n.getMessage('xMatches', matchedContactsSum + '') + '</div>').get(0));
						}
						for (index in matchedContacts) {
							var jid = matchedContacts[index].jid;
							var displayJid = matchedContacts[index].displayJid;
							var name = matchedContacts[index].name;
							var avatar = matchedContacts[index].avatar;

								var presenceType = matchedContacts[index].presence.type;
								var presenceMessage = matchedContacts[index].presence.message;
								var $contact = $('.gtalklet_contact.prototype').clone().removeClass('prototype').attr('data-jid', jid).find('.gtalklet_presence').switchToClass(presenceType).attr('title', presenceMessage).end();

								var $contactName = $('.gtalklet_contact_name', $contact).text(name);
								var $contactJid = $('.gtalklet_contact_jid', $contact).text(displayJid);
								var $contactAvatar = $('img.gtalklet_contact_avatar', $contact).attr('src', avatar);

								fragment.appendChild($contact.show().get(0));

								if (!all) {
									assistant.callAction('highlightMatches', 'run', [$contactName.add($contactJid), segment]);
								}
							}

							$contactsTimeline.append($(fragment));

							if (matchedContacts.length == 1) {
								$contact.addClass('current');
							}

						} else {
							var emptyMessage = '';
							if (segment === '') {
								$('.gtalklet_all_contacts').show();
								emptyMessage = '<span class="gtalklet_clear">' + chrome.i18n.getMessage('searchInAllContacts') + '</span>';
							} else {
								emptyMessage = chrome.i18n.getMessage('noMatchingContacts');
								$('.gtalklet_all_contacts').hide();
							}

							var $emptyMessage = $('.gtalklet_message.prototype', $contactsTimeline).clone().removeClass('prototype').html(emptyMessage);

							$('.gtalklet_contact, .gtalklet_message:not(.prototype)', $contactsTimeline).remove();
							$contactsTimeline.append($emptyMessage);
						}
					}

					if (all) {
						$contactsTimeline.addClass('all').scrollTop(99999);
					} else {
						$contactsTimeline.removeClass('all');
					}

				}
			},
			allContactsPanel: {
				run: function() {
					// 触发 @ 余下的工作 filter 处理
					$(selectors.filter).trigger('REFRESH_FILTER', {content: '@'});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate('.gtalklet_all_contacts', 'click', function() {
						base.run();
					});

					assistant.$layer().delegate(selectors.filterPanel + ' .gtalklet_contacts.all', 'mouseleave', function() {
						var $filter = $(selectors.filter);
						if (!$filter.val()) {
							$filter.trigger('REFRESH_FILTER', {content: ''});
						}
					})

					// 模拟非永久层 配合toggleHidden action的$(body).click();
					$(document).bind('click', function(event) {
						var $filter = $(selectors.filter);
						if ($filter.is(':visible') && !$filter.val()) {
							$filter.trigger('REFRESH_FILTER', {content: ''});
						}
					});
				},
			},
			shy: {
				run: function(force) {
					this.callback({force: force});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().bind('click', function(event) {
						event.stopPropagation();
					});

					// document
					$(document).bind('click', function(event) {
						if (event.pageX) {
							//确实是用户点击，而不是程序触发
							base.run(false);
						}
					}).bind('keyup', function(event) {
						if (event.which == 27) { //esc
							base.run(true);
						}
					});

					// 所有iframe
					$('iframe').each(function(index, element) {
						$(element.contentDocument).bind('click', function(event) {
							if (event.pageX) {
								//确实是用户点击，而不是程序触发
								base.run(false);
							}
						}).bind('keyup', function(event) {
							if (event.which == 27) { //esc
								base.run(true);
							}
						});
					});
				},
				callback: function(returns) {
					if (returns.force || assistant.$layer().attr('data-shy') == 'true') {
						assistant.callAction('toggleConsole', 'run', [false]);
						assistant.callAction('toggleFilterPanel', 'run', [false]);

						$(selectors.thread).each(function(index, element) {
							var threadId = $(element).attr('data-thread-id');
							if (threadId) {
								assistant.callAction('togglePanel', 'run', [threadId, false]);
							}
						});
					}
				},
				enable: function() {
					assistant.$layer().attr('data-shy', true);
				},
				disable: function() {
					assistant.$layer().attr('data-shy', false);
				},
			},
			// 新建聊天线程/ 激活已有
			/*
			 * @required toggleFilterPanel
			 * @required activatePanel
			 * @required createPanel
			 */
			createThread: {
				run: function(jid) {
					jid = jid || '';
					var base = this;
					follower.report('createThread', {
						jid: jid
					},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.filterPanel + ' .gtalklet_contact', 'click', function() {
						var jid = $(this).attr('data-jid');
						var $existedThreads = $(selectors.thread + '[data-jid=' + jid + ']');

						assistant.callAction('toggleFilterPanel', 'run', [false]);
						if ($existedThreads.length > 0) {
							//已经打开了
							assistant.callAction('activatePanel', 'run', [$existedThreads.eq(0), true]);
						} else {
							//新开panel
							base.run(jid);
						}
					});
				},
				callback: function(returns) {
					// returns.createdThread
					var thread = returns.createdThread;
					assistant.callAction('createPanel', 'run', [thread, true]);

					if (returns.self) {
						assistant.callAction('maxThread', 'run');
					}
				}
			},
			// 关闭线程
			closeThread: {
				run: function(threadId) {
					threadId = threadId || '';
					var base = this;
					follower.report('closeThread', {
						threadId: threadId
					},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.close, 'click', function(event) {
						var threadId = $(this).closest(selectors.thread).attr('data-thread-id');
						base.run(threadId);
						event.stopPropagation();
					});
				},
				callback: function(returns) {
					// returns.threadId
					var threadId = returns.threadId;
					var $thread = $('.gtalklet_thread[data-thread-id=' + threadId + ']');
					$thread.remove();
				}
			},
			// 创建面板
			/**
			 * @required scrollPanel
			 * @required toggleFilterPanel
			 * @required activatePanel
			 * @required prepareAutoResize
			 * @required showMessages
			 * @required maxThread
			 */
			createPanel: {
				run: function(thread, nextToFilterPanel) {
					thread = thread || [];
					nextToFilterPanel = nextToFilterPanel || false;
					var threadId = thread.id;
					var jid = thread.user.jid;

					var presenceType = thread.user.presence.type;
					var presenceMessage = thread.user.presence.message;

					var $createdThread = $('.gtalklet_thread.prototype').clone().removeClass('prototype').attr('data-thread-id', threadId).attr('data-jid', jid);

					$('.gtalklet_title_bar', $createdThread).find('.gtalklet_presence').addClass(presenceType).attr('data-switch-class', presenceType).attr('title', presenceMessage).end().find('.gtalklet_contact_name').text(thread.user.name).attr('title', thread.user.displayJid);

					if (thread.ui.messagebox.disabled) {
						$(selectors.chatTextarea, $createdThread).attr('disabled', 'disabled');
						$('.gtalklet_chat_form_mask', $createdThread).show();
					}

					// 绑定滚动
					assistant.callAction('scrollPanel', 'delegate', [$createdThread]);

					if (nextToFilterPanel) {
						$createdThread.insertAfter($(selectors.filterPanel));
					} else {
						var $console = $(selectors.console);
						$createdThread.insertBefore($console);
					}

					// 激活刚建立的线程面板
					assistant.callAction('activatePanel', 'run', [$createdThread, false]);

					// 绑定autoRezie
					//assistant.callAction('prepareAutoResize', 'run', [$createdThread]);

					// 如果messages中不只是存在prototype, 显示其中的message
					if (thread.messages && thread.messages.length > 1) {
						assistant.callAction('showMessages', 'run', [threadId, thread.messages]);
					}
				}
			},
			// 激活面板
			activatePanel: {
				run: function($panel, acceptThread) {
					acceptThread = acceptThread || false;

					var threadId = $panel.attr('data-thread-id');
					assistant.callAction('togglePanel', 'run', [threadId, true]);

					if (acceptThread) {
						var pendingThreadIds = $(selectors.newMessage).attr('data-pending-thread-ids');
						var index = pendingThreadIds.indexOf(threadId);
						if (index !== - 1) {
							assistant.callAction('acceptThread', 'run', [threadId]);
						}
					}
				}
			},
			// 接受新线程
			/**
			 * @required createPanel
			 */
			acceptThread: {
				run: function(threadId) {
					threadId = threadId || '';
					var base = this;
					follower.report('acceptThread', {
						threadId: threadId
					},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.newMessage, 'click', function() {
						var threadId = $(this).attr('data-pending-thread-ids').split(',').shift(); //shift 先来的消息先出
						var pendingThreadIds = $(selectors.newMessage).attr('data-pending-thread-ids');

						var index = pendingThreadIds.indexOf(threadId);
						if (index !== - 1) {
							//threadIds.splice(index, 1);
							base.run(threadId);
						}
					});
				},
				callback: function(returns) {
					// returns.createdThread;
					// returns.consoleState;
					var thread = returns.createdThread;
					var threadId = returns.threadId;
					var $newMessage = $(selectors.newMessage);
					var $badge = $('.gtalklet_badge', $newMessage);

					if (thread) {
						assistant.callAction('createPanel', 'run', [thread, false]);
					}

					if (returns.self) {
						assistant.callAction('maxThread', 'run');
					}

					var pendingThreadIds = $(selectors.newMessage).attr('data-pending-thread-ids');
					var threadIds = pendingThreadIds.split(',');
					var index = threadIds.indexOf(threadId);
					if (index !== - 1) {
						threadIds.splice(index, 1);
						$newMessage.attr('data-pending-thread-ids', threadIds.toString());
					}

					var num = parseInt($badge.text());
					if (num > 1) {
						$badge.text(num - 1);
					} else {
						$badge.text('0');
						$(selectors.console).switchToClass(returns.consoleState).removeClass('unread');
					}
				}
			},
			// 同步正在输入的消息
			typing: {
				run: function(content, caretStart, caretEnd, focused, threadId) {
					content = content || '';
					threadId = threadId || '';
					follower.report('typing', {
						content: content,
						caretStart: caretStart,
						caretEnd: caretEnd,
						focused: focused,
						threadId: threadId
					},
					function(stateChange) {
						// pass;
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.chatTextarea, 'keyup', function(event) {
						if ('pageX' in event) {
							// 用户触发点击才
							var caretStart = this.selectionStart;
							var caretEnd = this.selectionEnd;
							var focused = $(this).is(':focus');
							//var focused = true;

							var content = $(this).val();
							var threadId = $(this).closest('div.gtalklet_thread').attr('data-thread-id');
							base.run(content, caretStart, caretEnd, focused, threadId);
						}
					}).delegate(selectors.chatTextarea, 'keypress', function(event) {
                        // prevent twitter conflict
                        event.stopPropagation();
                    });
				},
				callback: function(returns) {
					if (returns.self) {
						return;
					}
					// returns.threadId;
					// returns.caretStart;
					// returns.caretEnd;
					// returns.content;
					// returns.focused;
					var threadId = returns.threadId;
					var content = returns.content;
					var caretStart = returns.caretStart;
					var caretEnd = returns.caretEnd;
					var focused = returns.focused;

					var $textarea = $(selectors.thread + '[data-thread-id=' + threadId + '] textarea[name=gtalklet_chat]');
					$textarea.val(content);
				}
			},
			// 提交聊天表单
			/**
			 * @required showMessages
			 */
			send: {
				run: function(message, jid, threadId) {
					if (message && jid && threadId && message.match(/\S+/)) {
						var base = this;
						follower.report('send', {
							message: message,
							jid: jid,
							threadId: threadId
						},
						function(stateChange) {
							base.callback(stateChange.returns);
						});
					};
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.chatForm, 'submit', function(event) {
						var $thread = $(this).closest('div.gtalklet_thread');
						var threadId = $thread.attr('data-thread-id');
						var $textarea = $('.gtalklet_thread[data-thread-id="' + threadId + '"] textarea[name=gtalklet_chat]');
						var message = $textarea.val();
						var jid = $thread.attr('data-jid');
						base.run(message, jid, threadId);
						event.preventDefault();
					});
				},
				callback: function(returns) {
					// returns.threadId; 消息所在threadId
					// returns.removeOldest;
					// returns.message;
					var message = returns.message;
					var threadId = returns.threadId;
					var removeOldest = returns.removeOldest;

					var $textarea = $('.gtalklet_thread[data-thread-id="' + threadId + '"] textarea[name=gtalklet_chat]');
					$textarea.val('');
					assistant.callAction('showMessages', 'run', [threadId, [message], false, removeOldest]);
				}
			},
			// 读线程 
			read: {
				run: function(threadId) {
					threadId = threadId || '';
					var base = this;
					follower.report('read', {
						threadId: threadId
					},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.chatTextarea, 'focus', function() {
						var $thread = $(this).closest('div.gtalklet_thread');
						$(selectors.chatTextarea).not(this).blur();
						base.run($thread.attr('data-thread-id'));
					});
				},
				callback: function(returns) {
					// returns.threadId;
					var threadId = returns.threadId;
					var $thread = $(selectors.thread + '[data-thread-id=' + threadId + ']');
					$thread.removeClass('unread');
				}
			},
			scrollFilterPanel: {
				delegate: function() {
					$('body').delegate('.gtalklet_contacts', 'mousewheel', function(event, data) {
						// 阻止滚动事件冒泡至上层
						if( this.scrollHeight === this.scrollTop + this.clientHeight && event.wheelDelta < 0 ||
							this.scrollTop === 0 && event.wheelDelta > 0) {
							event.preventDefault();
						}
					});
				}
			},
			// 滚动thread面板
			scrollPanel: {
				selector: '.gtalklet_timeline',
				event: 'scroll',

				run: function(threadId, scrollTop) {
					threadId = threadId || '';
					scrollTop = scrollTop || 0;

					follower.report('scrollPanel', {
						threadId: threadId,
						scrollTop: scrollTop
					}, function(stateChange) {
						var $panel = $(selectors.thread + '[data-thread-id=' + threadId + ']');
						var $timeline = $('.gtalkelt_timeline', $panel);
						$timeline.attr('data-scroll', scrollTop);
					});
				},
				delegate: function($thread) {
					var base = this;
					var element = '.gtalklet_timeline';
					if ($thread) {
						element = $thread.find('.gtalklet_timeline');
					}
					$(element).bind('scroll', function(event) {
						// 使用css('visibility')来判断可见，参见toggleHidden。
						// 不知为何is(':visible') 不对
						if (document.webkitVisibilityState == 'visible' && assistant.$layer().css('visibility') == 'visible') {
							var threadId = $(this).closest(selectors.thread).attr('data-thread-id');
							var scrollTop = $(this).attr('scrollTop');
							$(this).attr('data-scroll', scrollTop);
							base.run(threadId, scrollTop);
						}
					}).bind('mousewheel', function(event, data) {
						// 阻止滚动事件冒泡至上层
						if( this.scrollHeight === this.scrollTop + this.clientHeight && event.wheelDelta < 0 ||
							this.scrollTop === 0 && event.wheelDelta > 0) {
							event.preventDefault();
						}
					});
				},
				callback: function(returns) {
					// returns.threadId;
					// returns.scrollTop;
					var threadId = returns.threadId;
					var scrollTop = returns.scrollTop;
					var $panel = $(selectors.thread + '[data-thread-id=' + threadId + ']');

					var $timeline = $('.gtalklet_timeline', $panel);
					$timeline.attr('data-scroll', scrollTop);

					/*
					var preventDefault = function(event) {
						event.preventDefault();
						event.stopImmediatePropagation();
					};

					$timeline.bind('scroll', preventDefault);
					*/
					$timeline.scrollTop(scrollTop);
					/*
					setTimeout(function() {$timeline.unbind('scroll', preventDefault)}, 0);
					*/
				}
			},
			// 显示info
			/**
			 * @required clearInfo
			 */
			info: {
				run: function(message, level, keep) {
					message = message || '';
					level = level || '';
					keep = keep || false;

					if (typeof(gtalklet_info_timeout) !== 'undefined') {
						clearTimeout(gtalklet_info_timeout);
					}

					var $info = $('#gtalklet_info');
					var hiddenMessage = $info.find('div.gtalklet_info').html();
					if (!message && hiddenMessage) {
						message = hiddenMessage;
						var $infoTitleBar = $info.find('div.gtalklet_title_bar');
						level = $infoTitleBar.attr('data-switch-class');
						if ($infoTitleBar.attr('data-keep') == 'true') {
							keep = true;
						}
					}

					// 如果info不是keep的，自动消失
					if (message && !keep) {
						var timeout = 3000;
						gtalklet_info_timeout = setTimeout(function() {
							assistant.callAction('clearInfo', 'run');
						},
						timeout);
					}

					if (message) {
						$info.find('div.gtalklet_info').html(message).end().show();
						$('.gtalklet_title_bar', $info).switchToClass(level).attr('data-keep', keep);
					}
				},
				load: function() {
					this.run();
				}
			},
			// 清除info
			clearInfo: {
				run: function() {
					var base = this;
					follower.report('clearInfo', {},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				callback: function(returns) {
					// no returns;
					$('#gtalklet_info').fadeOut('slow', function() {
						$('.gtalklet_info', this).empty();
					});
				}
			},
			// 高亮匹配
			highlightMatches: {
				run: function(element, needle) {
					var regex = new RegExp('(' + needle + ')', 'i');

					$(element).each(function(i, e) {
						var html = $(e).text().replace(regex, '<div class="gtalklet_strong">$1</div>');
						$(e).html(html);
					});
				},
				load: function() {
					// 联系人高亮匹配
					var $contactName = $(selectors.contactName);
					var $contactJid = $(selectors.contactJid);
					var segment = $(selectors.filter).val();
					this.run($contactName.add($contactJid), segment);
				},
			},
			// 限制线程数至窗口允许大小
			/**
			 * @required closeOldestThread
			 * @required maxThread
			 */
			maxThread: {
				run: function(diff, careful) {
					diff = diff || 1;
					careful = careful || false;
					var arbitrary = ! careful;
					var pageWidth = assistant.$window().width();

					// 300 预留的非panel空间, 200 panel 宽度
					var newMaxThread = Math.floor((pageWidth - 300) / 200);

					if (arbitrary || newMaxThread < maxThread) {
						var $threads = $(selectors.thread).not('.prototype');
						var diff = $threads.size() - newMaxThread;
						if (diff > 0) {
							assistant.callAction('closeOldestThread', 'run', [diff]);
						}

						maxThread = newMaxThread;
					}
				},
				delegate: function() {
					$(window).resize(function(event) {
						assistant.callAction('maxThread', 'run', [1, true]);
					});
				},
				load: function() {
					this.run();
				}
			},
			// 关闭最久未使用的线程
			closeOldestThread: {
				run: function(diff) {
					diff = diff || 1;
					var base = this;
					follower.report('closeOldestThread', {
						num: diff
					},
					function(stateChange) {
						base.callback(stateChange.returns);
					});
				},
				callback: function(returns) {
					// returns.threadIds
					var threadIds = returns.threadIds;

					for (index in threadIds) {
						var $panel = $(selectors.thread + '[data-thread-id=' + threadIds[index] + ']');
						$panel.remove();
					}
				}
			},
			// 绑定autoResize
			prepareAutoResize: {
				run: function($thread) {
					return;
					// 
					//this.delegate($thread);
				},
				delegate: function($thread) {
					return;
					var $textarea = null;
					if ($thread) {
						$textarea = $('textarea[name=gtalklet_chat]', $thread);
					} else {
						$textarea = $(selectors.chatTextarea);
					}
					$textarea.each(function(index, element) {
						$(element).css('display', 'block').autoResize({
							'extraSpace': 16,
							'emptySpace': 16,
							'animate': true,
							// animate : true, animateCallback
							'animateCallback': function(data) {
								follower.report('resizeTextarea', {
									threadId: $thread.attr('data-thread-id'),
									height: $(this).height()
								},
								function(report) {});
							}
						});
					});
				},
				callback: function(returns) {
					return;
					// returns.threadId;
					// returns.height;
					var threadId = returns.threadId;
					var height = returns.height;

					var $textarea = $(selectors.thread + '[data-thread-id=' + threadId + '] textarea[name=gtalklet_chat]');
					$textarea.css('height', height);
				}
			},
			// UI阻塞 / 取消阻塞
			block: {
				run: function(isBlock) {
					if (typeof(isBlock) === 'undefined') {
						// 没有给出参数时，根据#gtalklet_layer上的blocked属性决定是block还是unblock
						var blocked = $('#gtalklet_layer').data('blocked');
						if (blocked) {
							$(selectors.sensitive).block({
								message: null,
								overlayCSS: {
									cursor: 'auto'
								},
								fadeIn: 0
							});
						} else {
							$(selectors.sensitive).unblock();
						}
					} else {
						if (isBlock) {
							$(selectors.sensitive).block({
								message: null,
								overlayCSS: {
									cursor: 'auto'
								}
							}).find('textarea, input').blur();
							$('#gtalklet_layer').attr('data-blocked', true);
						} else {
							$(selectors.sensitive).unblock();
							$('#gtalklet_layer').removeAttr('data-blocked');
						}
					}
				},
				load: function() {
					this.run();
				}
			},
			bindScrollToProperPosition: {
				delegate: function() {
					var base = this;
					var $loader = $('img.gtalklet_loader');
					
					$('.gtalklet_scorll').tinyscrollbar({axis: 'x'});

					// TODO clarify
					$loader.each(function (index, element) {
						if (element.complete || element.readyState == 4) {
							var $scroll = $(this).closest('.gtalklet_scroll');
							base.callback($scroll);
						} else {
							$(element).load(function() {
								var $scroll = $(this).closest('.gtalklet_scroll');
								base.callback($scroll);
							});
						}
					})
				},
				callback: function($scroll) {
					var scrollTop = $scroll.data('scroll');
					if (scrollTop) {
						setTimeout(function() {
							$scroll.scrollTop(scrollTop);
						},
						'0');
					}
				}
			},
			// 所有可滚动面板，设定滚动位置
			scrollToProperPosition: {
				run: function() {
					// no paramters
					console.log('scroll');
					setTimeout(function() {
						$('.gtalklet_scroll').each(function() {
							var scrollTop = $(this).data('scroll');
							console.log(scrollTop);
							if (scrollTop) {
								$(this).scrollTop(scrollTop);
							}
						});
					},
					'0');
				}
			},
			// 接收到log信息
			/**
			 * @required info
			 */
			log: {
				callback: function(returns) {
					// returns.message
					// returns.level
					var message = returns.message || '';
					var level = returns.level;
					var keep = returns.keep;

					assistant.callAction('info', 'run', [message, level, keep]);
				}
			},
			/**
			 * @required block
			 */
			dropped: {
				callback: function(returns) {
					// returns.blocked
					assistant.callAction('block', 'run', [returns.blocked]);
				}
			},
			/**
			 * @required block
			 */
			connecting: {
				callback: function(returns) {
					// returns.blocked
					assistant.callAction('block', 'run', [returns.blocked]);
				}
			},
			// 用户登陆完成
			/**
			 * @required block
			 * @required toggleConsoleCommands
			 */
			connected: {
				callback: function(returns) {
					// returns.blocked
					// returns.jid
					// returns.presence
					// returns.service
					assistant.callAction('block', 'run', [returns.blocked]);

					$(selectors.myPresence).find('.gtalklet_presence').switchToClass('chat').attr('title', returns.jid);
					assistant.callAction('toggleConsoleCommands', 'run');

					$('#gtalklet_operation').show('slow');
				}
			},
			/**
			 * @required block
			 */
			connectError: {
				callback: function(returns) {
					// returns.blocked
					assistant.callAction('block', 'run', [returns.blocked]);
				}
			},
			// 接收到新消息, 已有面板
			/**
			 * @required showMessages
			 */
			recieved: {
				callback: function(returns) {
					// returns.threadId; 消息所在threadId
					// returns.message; 消息
					// returns.unread; 是否增加未读标记
					// returns.removeOldest
					var messages = [returns.message];
					assistant.callAction('showMessages', 'run', [returns.threadId, messages, returns.unread, returns.removeOldest]);
				}
			},
			// 接受到新消息，需要新建面板，显示提示
			recievedThread: {
				callback: function(returns) {
					// return.jid
					// returns.name
					// returns.threadId;
					// returns.consoleState;
					var $newMessage = $(selectors.newMessage);
					var $console = $(selectors.console);

					var pendingIds = $newMessage.attr('data-pending-thread-ids');
					if (pendingIds === '' || typeof(pendingIds) === 'undefined') {
						pendingIds = returns.threadId;
					} else {
						pendingIds += (',' + returns.threadId);
					}

					$newMessage.attr('data-pending-thread-ids', pendingIds);
					var $badge = $newMessage.find('.gtalklet_badge');
					$badge.text(parseInt($badge.text(), 10) + 1);
					$console.switchToClass(returns.consoleState).addClass('unread');
				}
			},
			// 有用户的在线状态改变
			presence: {
				callback: function(returns) {
					// returns.jid; 
					// returns.presence.type;
					// returns.presence.message;
					if (returns) {
						var $presence = $(selectors.thread + '[data-jid="' + returns.jid + '"] .gtalklet_presence');
						$presence.switchToClass(returns.presence.type).attr('title', returns.presence.message);
					}
				}
			},
			toggleHidden: {
				callback: function(returns) {
					$(document).click();
					var $layer = assistant.$layer();
					if ($layer && $layer.length > 0) {
						if (returns.hide) {
							// 用visibility:hidden, 避免与子元素的display:none切换 造成冲突失效
							$layer.css('visibility', 'hidden');
						} else {
							$layer.css('visibility', 'visible');
						}
					}
				}
			},
			preventPageZoom: {
				run: function() {
					if (document.width) {
						var ratio = $(document).width() / document.width;
					} else {
						var ratio = window.innerWidth / window.outerWidth;
					}
					//取小数点后三位精度. 避开不同zoom级别时，计算后尺寸变化太大的问题
					var $layer = assistant.$layer();
					var zoomLevel = $layer.attr('zoom');
					$layer.css('zoom', Math.floor(ratio * 1000) * zoomLevel / 1000);
					//$layer.css('zoom', ratio * zoomLevel);
				},
				load: function() {
					this.run();
				},
				delegate: function() {
					var base = this;
					$(window).resize(function(event) {
						base.run();
					});
				},
			},
			zoom: {
				run: function(zoomIn) {
					var base = this;
					follower.report('zoom', {zoomIn: zoomIn}, function(stateChange){
						base.callback(stateChange.returns);
					});
				},
				delegate: function() {
					var base = this;
					assistant.$layer().delegate(selectors.filter + ', ' +  selectors.chatTextarea, 'keydown', function(event) {
                        event.stopPropagation();
						if (event.metaKey || event.ctrlKey) {
							if (event.which == 187) { // C+
								event.preventDefault();
								event.stopPropagation();
								base.run(true);
							} else if (event.which == 189) { // C-
								event.preventDefault();
								event.stopPropagation();
								base.run(false);
							} else if (event.which == 48) { // C0
								event.preventDefault();
								event.stopPropagation();
								base.run(null);
							}
						}
					});
				},
				callback: function(returns) {
					// 设置zoomLeve后，调用preventPageZoom计算实际zoom
					assistant.$layer().attr('zoom', returns.zoom || 1);
					assistant.callAction('preventPageZoom', 'run');
				},
			},
			/**
			 * @required toggleConsoleCommands
			 */
			CONNECTION_PREPARED: {
				callback: function(returns) {
					assistant.callAction('toggleConsoleCommands', 'run');
				}
			},
			ALIGN: {
				callback: function(returns) {
					// returns.value;
					var css = chrome.extension.getURL('css/' + returns.value) + '.css';
					var $head = $('head');
					$('#gtalklet_css').attr('href', css);
					if (returns.right) {
						//$('#gtalklet_right_css').remove().attr('media', 'screen').appendTo($head);
						$('#gtalklet_right_css').attr('media', 'screen');
					} else {
						//$('#gtalklet_right_css').remove().attr('media', 'tty').appendTo($head);
						$('#gtalklet_right_css').attr('media', 'tty');
					}
				}
			},
			SHY: {
				callback: function(returns) {
					if (returns.enabled) {
						assistant.callAction('shy', 'enable');
					} else {
						assistant.callAction('shy', 'disable');
					}
				}
			},
		}
	});
})(assistant, gtalklet.$);
