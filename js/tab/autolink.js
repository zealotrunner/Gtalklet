/*
 * http://codesnipp.it/code/793
 */
(function($) {
	$.fn.extend({
		autoLink: function(options) {
			var classes = options.class || '';
			var max = options.max || 28;

			var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
			/* Credit for the regex above goes to @elijahmanor on Twitter, so follow that awesome guy! */
			this.each(function() {
				var matches = $(this).html().match(exp);
				if (matches && matches.length) {
					matches = matches.sort(function(a, b) {return a.length < b.length});
					console.log(matches);
					var uniqueMatches = [matches[0]];
					for (var i = 1; i < matches.length; i++) { // start loop at 1 as element 0 can never be a duplicate
						if (matches[i-1] !== matches[i]) {
							uniqueMatches.push(matches[i]);
						}
					}
					matches = uniqueMatches;

					var replacedHtml = $(this).html();
					for (index in matches) {
						var match = matches[index];
						replacedHtml = replacedHtml.replace(new RegExp(match, 'g'), function(match) {
							return '@AUTOLINK_' + index + '@';
						});
					}

					for (index in matches) {
						var match = matches[index];
						replacedHtml = replacedHtml.replace(new RegExp('@AUTOLINK_' + index + '@', 'g'), function() {
							if (max > 0 && match.length > max) {
								var dotted = match.substr(0, max - 8) + '...' + match.substr(-5);
							} else {
								var dotted = match;
							}
							return "<a href='" + match + "' title='" + match + "' class='" + classes + "' target='_blank'>" + dotted + "</a>";
						});
					}
					$(this).html(replacedHtml);
				}
			});
			return this;
		}
	});
})(jQuery);
