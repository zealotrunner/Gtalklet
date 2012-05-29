var gtalklet = (function(assistant, follower) {
	var gtalklet = {};
	
	gtalklet._$ = jQuery.noConflict();
	gtalklet._context = null;

	gtalklet.$ = function(selector, context) {
		if (typeof(selector) === 'string') {
			// 默认给没指定元素名的选择器 制定元素div
			var regex = /^\.| \./,
				replace = ' div.',
				selector = selector.replace(regex, replace);
		}

		if (!context) {
			if (!gtalklet._context || gtalklet._context.length === 0) {
				gtalklet._context = gtalklet._$('#gtalklet_layer');
			}
			context = gtalklet._context;
		}

		return gtalklet._$.apply(this, arguments);
	};

	gtalklet._$.extend(gtalklet.$, gtalklet._$);

	//?
	assistant.init(gtalklet.$);
	follower.init(gtalklet.$);

	return gtalklet;
})(assistant, follower);
