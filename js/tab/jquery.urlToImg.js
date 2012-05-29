(function($) {
	$.fn.extend({
		urlToImg: function(options) {
			var classes = options.class || '';

			$(this).find('a[href$=.jpg], a[href$=.gif] , a[href$=.png]').each(function(index, element) {
				var $this = $(element);

				$this.wrapInner($('<img src="' + $this.attr('href')+ '" class="' + classes + '" />'));
			});
			return this;
		}
	});
})(jQuery);

