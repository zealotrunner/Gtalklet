this.manifest = {
	"name": chrome.i18n.getMessage("gtalkletOptions"),
	"icon": "icon.png",
	"settings": [
		{
			"tab": chrome.i18n.getMessage("connection"),
			"group": "BOSH",
			"name": "",
			"type": "description",
			"text": chrome.i18n.getMessage("gtalkletConnectionWarn")
		},
		{
			"tab": chrome.i18n.getMessage("connection"),
			"group": "BOSH",
			"name": "bosh_service",
			"id": "bosh_service",
			"type": "listBox",
			"label": chrome.i18n.getMessage("selectCM"),
			"options": [
				{
					"value": "https://ssl.miy.im/http-bind",
					"text": "https://ssl.miy.im/http-bind (" + chrome.i18n.getMessage('builtForGtalklet') + ")"
				},
				{
					"value": "https://www.jappix.com/bind",
					"text": "https://www.jappix.com/bind"
				},
				{
					"value": "https://dhruvbird.com/bosh/",
					"text": "https://dhruvbird.com/bosh/"
				},
				{
					"value": "http://bosh.metajack.im:5280/xmpp-httpbind",
					"text": "http://bosh.metajack.im:5280/xmpp-httpbind"
				},
				{
					"value": "http://jwchat.org/JHB/",
					"text": "http://jwchat.org/JHB/"
				},
			]
		},
		{
			"tab": chrome.i18n.getMessage("connection"),
			"group": "BOSH",
			"name": "custom_bosh_service",
			"id": "custom_bosh_service",
			"type": "text",
			"label": chrome.i18n.getMessage("selectOtherCM"),
			"text": "https://bosh.example.com/",
			"masked": false
		},
		/*
		{
			"tab": chrome.i18n.getMessage("connection"),
			"group": chrome.i18n.getMessage("account"),
			"name": "",
			"type": "description",
			"text": chrome.i18n.getMessage("gtalkletAccountWarn"),
		},
		*/
		{
			"tab": chrome.i18n.getMessage("connection"),
			"group": chrome.i18n.getMessage("account"),
			"name": "service",
			"type": "popupButton",
			"options": [
				{
					"value": "google",
					"text": "Google"
				},
				{
					"value": "facebook",
					"text": "Facebook Chat"
				},
				{
					"value": "other",
					"text": "Other"
				}
			]
		},
		{
			"tab": chrome.i18n.getMessage("connection"),
			"group": chrome.i18n.getMessage("account"),
			"name": "jid",
			"id": "jid",
			"type": "text",
			"text": "username@gmail.com",
			"masked": false
		},
		{
			"tab": chrome.i18n.getMessage("connection"),
			"group": chrome.i18n.getMessage("account"),
			"name": "password",
			"id": "password",
			"type": "text",
			"text": "******",
			"masked": true
		},
		/*
		{
			"tab": chrome.i18n.getMessage("connection"),
			"group": chrome.i18n.getMessage("account"),
			"name": "google_apps_account",
			"type": "checkbox",
			"label": chrome.i18n.getMessage("itsGAA"),
		},
		*/
		{
			"tab": chrome.i18n.getMessage("connection"),
			"group": chrome.i18n.getMessage("account"),
			"name": "auto_sign_in",
			"type": "checkbox",
			"label": chrome.i18n.getMessage("autoSignIn"),
		},
		{
			"tab": chrome.i18n.getMessage("connection"),
			"group": "",
			"name": "",
			"type": "description",
			"text": chrome.i18n.getMessage("signoutFirst"),
		},
		{
			"tab": chrome.i18n.getMessage("connection"),
			"group": "",
			"name": "signout",
			"id": "signout",
			"type": "button",
			"text": chrome.i18n.getMessage("signout")
		},
		{
			"tab": chrome.i18n.getMessage("advanced"),
			"group": chrome.i18n.getMessage("position"),
			"name": "align",
			"type": "radioButtons",
			"options": [
				{
					"value": "left",
					"text": chrome.i18n.getMessage("left")
				},
				{
					"value": "right",
					"text": chrome.i18n.getMessage("right")
				}
			]
		},
		{
			"tab": chrome.i18n.getMessage("advanced"),
			"group": chrome.i18n.getMessage("notification"),
			"name": "desktop_notification",
			"type": "checkbox",
			"label": chrome.i18n.getMessage("showDesktopNotification")
		},
		{
			"tab": chrome.i18n.getMessage("advanced"),
			"group": chrome.i18n.getMessage("notification"),
			"name": "sound_notification",
			"id": "sound_notification",
			"type": "checkbox",
			"label": chrome.i18n.getMessage("playSound")
		},
		{
			"tab": chrome.i18n.getMessage("advanced"),
			"group": chrome.i18n.getMessage("excludes"),
			"name": "excludes",
			"type": "textarea"
		},
		{
			"tab": chrome.i18n.getMessage("advanced"),
			"group": chrome.i18n.getMessage("excludes"),
			"name": "",
			"type": "description",
			"text": chrome.i18n.getMessage("excludesDescription")
		},
		{
			"tab": chrome.i18n.getMessage("about"),
			"group": "Credits",
			"name": "",
			"type": "description",
			"text": "<a href='http://jquery.com/' target='_blank'>jQuery</a> Licensed under MIT<br />\
					 <a href='http://strophe.im/' target='_blank'>Strophejs</a> Licensed under MIT<br />\
					 <a href='https://github.com/frankkohlhepp/fancy-settings' target='_blank'>Fancy Settings</a> Frank Kohlhepp - Licensed under the LGPL 2.1<br />\
					 <a href='http://ejohn.org/blog/javascript-micro-templating/' target='_blank'>Simple JavaScript Templating</a> John Resig - Licensed under MIT<br />\
					 <a href='https://github.com/malsup/blockui' target='_blank'>jQuery blockUI</a> M. Alsup - Licensed under MIT<br />\
					 <a href='https://gist.github.com/796851' target='_blank'>jQuery Scrollbar Width</a> Rasmus Schultz - Licensed under LGPL v3.0<br />\
					 <br />\
					 <a href='http://gentleface.com/free_icon_set.html' target='_blank'>Free Mono Icon Set</a> Licensed under Creative Commons Attribution-Noncommercial Works 3.0 Unported\
					 <br />\
					 <a href='https://ssl.miy.im/http-bind' target='_blank'>https://ssl.miy.im/http-bind</a> Powered by <a href='https://github.com/twonds/punjab' target='_blank'>Punjab</a>"
		},
		{
			"tab": chrome.i18n.getMessage("about"),
			"group": "",
			"name": "",
			"type": "description",
			"text": "<a href='https://chrome.google.com/extensions/detail/mijcfiakajpjojbebgmoahoddbeafckk' target='_blank'>Gtalklet</a> Copyright © 2011 - 2012, <br />\
					Sean Zheng <a href='mailto:zealotrunner@gmail.com'>zealotrunner@gmail.com</a><br />\
					Ambar Lee <a href='mailto:ambar.lee@gmail.com'>ambar.lee@gmail.com</a><br />"
		}
	]
};

// 判断离线安装包
if (chrome.i18n.getMessage("@@extension_id") != "mijcfiakajpjojbebgmoahoddbeafckk") {
	this.manifest.settings.push(
		{
			"tab": chrome.i18n.getMessage("about"),
			"group": chrome.i18n.getMessage("crxVersion"),
			"name": "",
			"type": "description",
			"text": chrome.i18n.getMessage("crxVersionDescription")
		}
	);
}
