(function($) {
	$.fn.extend({
		gtalkMarkdown: function(options) {
			// TODO refine
			var strongClasses = options.strongClass || '';
			var italicClasses = options.italicClass || '';
			var deletedClasses = options.deletedClass || '';
			var max = options.max || 100;

			var y = /(\s|\>)(\*|\_|\-)(?!\s)([^\2]{1,100}?)\2(\W|\<)/g;

			this.each(function() {
				var $this = $(this);
				var html = $this.html();
				
				var count = 4;
				while(count--) {
					html = html.replace(y, function(str, p1, p2, p3, p4) {
						if (p2 == '*') {
							return p1 + '<strong class="' + strongClasses + '">' + p3 + '</strong>' + p4;
						} else if (p2 == '_') {
							return p1 + '<em class="' + italicClasses + '">' + p3 + '</em>' + p4;
						} else if (p2 == '-') {
							return p1 + '<del class="' + deletedClasses + '">' + p3 + '</del>' + p4;
						}
					});
				}

				$this.html(html);
			});

			return this;
		}
	});
})(jQuery);

