window.addEvent('domready', function () {
	var signoutMessage = chrome.i18n.getMessage('signout');
	var signingoutMessage = chrome.i18n.getMessage('signingout');
	new FancySettings.initWithManifest(function (settings) {
		var $sensitiveElements = jQuery('.tab-content.show input:not(#signout), .tab-content.show select, .tab-content.show checkbox');
		var $signout = jQuery('#signout');
		var $signoutGroup = $signout.closest('.group');

		var toggleBoshService = function(effect) {
			var value = settings.manifest.custom_bosh_service.get();
			if (value) {
				if (effect) {
					jQuery('#bosh_service').slideUp();
				} else {
					jQuery('#bosh_service').hide();
				}
			}
		};

		var toggleProtection = function() {
			if (background.secretary.isActive()) {
				$sensitiveElements.attr('disabled', 'disabled');
				$signout.val(signoutMessage).attr('disabled', '');
				$signoutGroup.show();
			} else {
				$sensitiveElements.removeAttr('disabled');
				$signoutGroup.hide();
			}
		};
		var toggleJid = function() {
			var value = settings.manifest.jid.get();
			if (value) {
				jQuery('#jid').removeClass('error');
			} else {
				jQuery('#jid').addClass('error');
			}
		};
		var togglePassword = function() {
			var value = settings.manifest.password.get();
			if (value) {
				jQuery('#password').removeClass('error');
			} else {
				jQuery('#password').addClass('error');
			}
		};
		var toggleService = function() {
			var value = settings.manifest.service.get();
			if (value == 'google') {
				jQuery('#jid').attr('placeholder', 'username@gmail.com');
			} else if (value == 'facebook') {
				jQuery('#jid').attr('placeholder', 'username@chat.facebook.com');
			} else {
				jQuery('#jid').attr('placeholder', 'username@jabber.org');
			}
		};
		var toggleNotification = function() {
			var desktop = settings.manifest.desktop_notification.get();
			if (desktop) {
				jQuery('#sound_notification').removeAttr('disabled');
			} else {
				jQuery('#sound_notification').attr('disabled', 'disabled');
			}
		};

		var background = chrome.extension.getBackgroundPage();

		toggleBoshService();
		toggleProtection();
		toggleNotification();
		toggleJid();
		toggleService();
		togglePassword();

		settings.manifest.bosh_service.addEvent('action', function() {
			background.optionManager.updated('BOSH_SERVICE');
		});

		settings.manifest.custom_bosh_service.addEvent('action', function() {
			var value = settings.manifest.custom_bosh_service.get();
			// check if valid url 
			var exp = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
			if (value) {
				if (value.match(exp)) {
					jQuery('#custom_bosh_service').removeClass('error');
				} else {
					jQuery('#custom_bosh_service').addClass('error');
				}
			} else {
				jQuery('#custom_bosh_service').removeClass('error');
			}
			background.optionManager.updated('CUSTOM_BOSH_SERVICE');
		});

		jQuery('#custom_bosh_service').bind('blur',function() {
			var value = settings.manifest.custom_bosh_service.get();
			if (!value) {
				jQuery('#bosh_service').slideDown(function() {
					var selected = jQuery(this).find('option:selected');
					if (selected.length === 0) {
						selected = jQuery(this).attr('selectedIndex', '-1').children('option').removeAttr('selected').eq(0).attr('selected', 'selected');
					}
					background.optionManager.updated('CUSTOM_BOSH_SERVICE');
				});
				jQuery(this).removeClass('error');
			}
		}).bind('focus', function() {
			var value = settings.manifest.custom_bosh_service.get();
			if (!value) {
				jQuery('#bosh_service').slideUp();
			}
		});

		settings.manifest.jid.addEvent('action', function() {
			toggleJid();
			background.optionManager.updated('JID');
		});

		settings.manifest.password.addEvent('action', function() {
			togglePassword();
			background.optionManager.updated('PASSWORD');
		});
		
		settings.manifest.service.addEvent('action', function() {
			toggleService();
			//background.optionManager.updated('SERVICE');
		});

		settings.manifest.align.addEvent('action', function() {
			background.optionManager.updated('ALIGN');
		});

		/*
		settings.manifest.shy.addEvent('action', function() {
			background.optionManager.updated('SHY');
		});
		*/

		settings.manifest.signout.addEvent('action', function() {
			background.boss.signout();
			jQuery('#signout').val(signingoutMessage).attr('disabled', 'disabled');
		});

		settings.manifest.excludes.addEvent('action', function() {
			background.optionManager.updated('EXCLUDES');
		});
		
		settings.manifest.desktop_notification.addEvent('action', function() {
			background.optionManager.updated('DESKTOP_NOTIFICATION');
			toggleNotification();
		});
		settings.manifest.sound_notification.addEvent('action', function() {
			background.optionManager.updated('SOUND_NOTIFICATION');
		});

		setInterval(toggleProtection, 2000);
	});
	
});
