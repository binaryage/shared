/**
 * @license
 * jQuery Tools 1.2.5 Overlay - Overlay base. Extend it.
 *
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 *
 * http://flowplayer.org/tools/overlay/
 *
 * Since: March 2008
 * Date:    Wed Sep 22 06:02:10 2010 +0000
 */
(function($) {

	// static constructs
	$.tools = $.tools || {version: '1.2.5'};

	$.tools.overlay = {

		addEffect: function(name, loadFn, closeFn) {
			effects[name] = [loadFn, closeFn];
		},

		conf: {
			close: null,
			closeOnClick: true,
			closeOnEsc: true,
			closeSpeed: 'fast',
			effect: 'default',

			// since 1.2. fixed positioning not supported by IE6
			fixed: !$.browser.msie || $.browser.version > 6,

			left: 'center',
			load: false, // 1.2
			mask: null,
			oneInstance: true,
			speed: 'normal',
			target: null, // target element to be overlayed. by default taken from [rel]
			top: '10%'
		}
	};


	var instances = [], effects = {};

	// the default effect. nice and easy!
	$.tools.overlay.addEffect('default',

		/*
			onLoad/onClose functions must be called otherwise none of the
			user supplied callback methods won't be called
		*/
		function(pos, onLoad) {

			var conf = this.getConf(),
				 w = $(window);

			if (!conf.fixed)  {
				pos.top += w.scrollTop();
				pos.left += w.scrollLeft();
			}

			pos.position = conf.fixed ? 'fixed' : 'absolute';
			this.getOverlay().css(pos).fadeIn(conf.speed, onLoad);

		}, function(onClose) {
			this.getOverlay().fadeOut(this.getConf().closeSpeed, onClose);
		}
	);


	function Overlay(trigger, conf) {

		// private variables
		var self = this,
			 fire = trigger.add(self),
			 w = $(window),
			 closers,
			 overlay,
			 opened,
			 maskConf = $.tools.expose && (conf.mask || conf.expose),
			 uid = Math.random().toString().slice(10);


		// mask configuration
		if (maskConf) {
			if (typeof maskConf == 'string') { maskConf = {color: maskConf}; }
			maskConf.closeOnClick = maskConf.closeOnEsc = false;
		}

		// get overlay and triggerr
		var jq = conf.target || trigger.attr("rel");
		overlay = jq ? $(jq) : null || trigger;

		// overlay not found. cannot continue
		if (!overlay.length) { throw "Could not find Overlay: " + jq; }

		// trigger's click event
		if (trigger && trigger.index(overlay) == -1) {
			trigger.click(function(e) {
				self.load(e);
				return e.preventDefault();
			});
		}

		// API methods
		$.extend(self, {

			load: function(e) {

				// can be opened only once
				if (self.isOpened()) { return self; }

				ga('send', 'pageview', '/overlays/'+trigger.attr('id'));

				if (window.SSTracker) {
				    SSTracker.pushState(trigger.attr('id'));
				}

				// find the effect
		 		var eff = effects[conf.effect];
		 		if (!eff) { throw "Overlay: cannot find effect : \"" + conf.effect + "\""; }

				// close other instances?
				if (conf.oneInstance) {
					$.each(instances, function() {
						this.close(e);
					});
				}

				// onBeforeLoad
				e = e || $.Event();
				e.type = "onBeforeLoad";
				fire.trigger(e);
				if (e.isDefaultPrevented()) { return self; }

				// opened
				opened = true;

				// possible mask effect
				if (maskConf) { $(overlay).expose(maskConf); }

				// position & dimensions
				var top = conf.top,
					 left = conf.left,
					 oWidth = overlay.outerWidth({margin:true}),
					 oHeight = overlay.outerHeight({margin:true});

			    var winw = w.width();
			    var winh = w.height();

			    var zoom = 1;
			    if (winw<oWidth || winh<oHeight) {
			        zoom = 1/Math.max(oWidth/winw, oHeight/winh);
			    }

	            overlay.css('zoom', zoom);
				 oWidth *= zoom;
  			     oHeight *= zoom;

				if (typeof top == 'string')  {
					top = top == 'center' ? Math.max((w.height() - oHeight) / 2, 0) : parseInt(top, 10) / 100 * w.height();
				}

				if (left == 'center') { left = Math.max((w.width() - oWidth) / 2, 0); }
		        left /= zoom;
		        top /= zoom;
		        top = parseInt(top);
		        left = parseInt(left);

				// load effect
				eff[0].call(self, {top: top, left: left}, function() {
					if (opened) {
						e.type = "onLoad";
						fire.trigger(e);
					}
				});

				// mask.click closes overlay
				if (maskConf && conf.closeOnClick) {
					$.mask.getMask().one("click", self.close);
				}

				// when window is clicked outside overlay, we close
				if (conf.closeOnClick) {
					$(document).bind("click." + uid, function(e) {
						if (!$(e.target).parents(overlay).length) {
							self.close(e);
						}
					});
				}

				// keyboard::escape
				if (conf.closeOnEsc) {

					// one callback is enough if multiple instances are loaded simultaneously
					$(document).bind("keydown." + uid, function(e) {
						if (e.keyCode == 27) {
							self.close(e);
						}
					});
				}


				return self;
			},

			close: function(e) {

				if (!self.isOpened()) { return self; }

				e = e || $.Event();
				e.type = "onBeforeClose";
				fire.trigger(e);
				if (e.isDefaultPrevented()) { return; }

				if (window.SSTracker) {
				    SSTracker.popState();
				}

				opened = false;

				// close effect
				effects[conf.effect][1].call(self, function() {
					e.type = "onClose";
					fire.trigger(e);
				});

				// unbind the keyboard / clicking actions
				$(document).unbind("click." + uid).unbind("keydown." + uid);

				if (maskConf) {
					$.mask.close();
				}

				return self;
			},

			getOverlay: function() {
				return overlay;
			},

			getTrigger: function() {
				return trigger;
			},

			getClosers: function() {
				return closers;
			},

			isOpened: function()  {
				return opened;
			},

			// manipulate start, finish and speeds
			getConf: function() {
				return conf;
			}

		});

		// callbacks
		$.each("onBeforeLoad,onStart,onLoad,onBeforeClose,onClose".split(","), function(i, name) {

			// configuration
			if ($.isFunction(conf[name])) {
				$(self).bind(name, conf[name]);
			}

			// API
			self[name] = function(fn) {
				if (fn) { $(self).bind(name, fn); }
				return self;
			};
		});

		// close button
		closers = overlay.find(conf.close || ".close");

		if (!closers.length && !conf.close) {
			closers = $('<a class="close"></a>');
			overlay.prepend(closers);
		}

		closers.click(function(e) {
			self.close(e);
		});

		// autoload
		if (conf.load) { self.load(); }

	}

	// jQuery plugin initialization
	$.fn.overlay = function(conf) {

		// already constructed --> return API
		var el = this.data("overlay");
		if (el) { return el; }

		if ($.isFunction(conf)) {
			conf = {onBeforeLoad: conf};
		}

		conf = $.extend(true, {}, $.tools.overlay.conf, conf);

		this.each(function() {
			el = new Overlay($(this), conf);
			instances.push(el);
			$(this).data("overlay", el);
		});

		return conf.api ? el: this;
	};

})(jQuery);

/**
 * @license
 * jQuery Tools @VERSION / Overlay Apple effect.
 *
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 *
 * http://flowplayer.org/tools/overlay/apple.html
 *
 * Since: July 2009
 * Date: @DATE
 */
(function($) {

	// version number
	var t = $.tools.overlay,
		 w = $(window);

	// extend global configuragion with effect specific defaults
	$.extend(t.conf, {
		start: {
			top: null,
			left: null
		},

		fadeInSpeed: 'fast',
		zIndex: 9999
	});

	// utility function
	function getPosition(el) {
		var p = el.offset();
		return {
			top: p.top + el.height() / 2,
			left: p.left + el.width() / 2
		};
	}

//{{{ load

	var loadEffect = function(pos, onLoad) {

		var overlay = this.getOverlay(),
			 conf = this.getConf(),
			 trigger = this.getTrigger(),
			 self = this,
			 oWidth = overlay.outerWidth({margin:true}),
			 img = overlay.data("img"),
			 position = conf.fixed ? 'fixed' : 'absolute';


		// growing image is required.
		if (!img) {
			var bg = overlay.css("backgroundImage");

			if (!bg) {
				throw "background-image CSS property not set for overlay";
			}

			// url("bg.jpg") --> bg.jpg
			bg = bg.slice(bg.indexOf("(") + 1, bg.indexOf(")")).replace(/\"/g, "");
			overlay.css("backgroundImage", "none");

			img = $('<img src="' + bg + '"/>');
			img.css({border:0, display:'none'}).width(oWidth);
			$('body').append(img);
			overlay.data("img", img);
		}

		// initial top & left
		var itop = conf.start.top || Math.round(w.height() / 2),
			 ileft = conf.start.left || Math.round(w.width() / 2);

		if (trigger) {
			var p = getPosition(trigger);
			itop = p.top;
			ileft = p.left;
		}

		// put overlay into final position
		if (conf.fixed) {
			itop -= w.scrollTop();
			ileft -= w.scrollLeft();
		} else {
			pos.top += w.scrollTop();
			pos.left += w.scrollLeft();
		}

		// initialize background image and make it visible

		img.css({
			position: 'absolute',
			top: itop,
			left: ileft,
			width: 0,
			zIndex: conf.zIndex
		}).show();

		pos.position = position;
		overlay.css(pos);
		overlay.css({
		    opacity: 0
		});
		overlay.show();

		// begin growing
		img.animate({
			top: overlay.css("top"),
			left: overlay.css("left"),
			width: oWidth}, conf.speed, function() {

    		overlay.css({
    		    opacity: 1
    		});

			// set close button and content over the image
			overlay.css("zIndex", conf.zIndex + 1).fadeIn(conf.fadeInSpeed, function()  {

				if (self.isOpened() && !$(this).index(overlay)) {
					onLoad.call();
				} else {
					overlay.hide();
				}
			});

		}).css("position", position);

	};
//}}}


	var closeEffect = function(onClose) {

		// variables
		var overlay = this.getOverlay().hide(),
			 conf = this.getConf(),
			 trigger = this.getTrigger(),
			 img = overlay.data("img"),

			 css = {
			 	top: conf.start.top,
			 	left: conf.start.left,
			 	width: 0
			 };

		// trigger position
		if (trigger) { $.extend(css, getPosition(trigger)); }


		// change from fixed to absolute position
		if (conf.fixed) {
			img.css({position: 'absolute'})
				.animate({ top: "+=" + w.scrollTop(), left: "+=" + w.scrollLeft()}, 0);
		}

		// shrink image
		img.animate(css, conf.closeSpeed, onClose);
	};


	// add overlay effect
	t.addEffect("apple", loadEffect, closeEffect);

})(jQuery);


/**
 * Overlay Gallery plugin, version: 1.0.0
 *
 * Copyright (c) 2009 Tero Piirainen
 * http://flowplayer.org/tools/overlay.html#gallery
 *
 * Dual licensed under MIT and GPL 2+ licenses
 * http://www.opensource.org/licenses
 *
 * Since  : July 2009
 * Date: ${date}
 * Revision: ${revision}
 */
(function($) {

	// version number
	var t = $.tools.overlay;
	t.plugins = t.plugins || {};

	t.plugins.gallery = {
		version: '1.0.0',
		conf: {
			imgId: 'img',
			next: '.next',
			prev: '.prev',
			info: '.info',
			progress: '.progress',
			disabledClass: 'disabled',
			activeClass: 'active',
			opacity: 0.8,
			speed: 'slow',
			template: '<strong>${title}</strong> <span>Image ${index} of ${total}</span>',
			autohide: true,
			preload: true,
			api: false
		}
	};

	$.fn.gallery = function(opts) {

		var conf = $.extend({}, t.plugins.gallery.conf), api;
		$.extend(conf, opts);

		// common variables for all gallery images
		api = this.overlay();

		var links = this,
			 overlay = api.getOverlay(),
			 next = overlay.find(conf.next),
			 prev = overlay.find(conf.prev),
			 info = overlay.find(conf.info),
			 progress = overlay.find(conf.progress),
			 els = prev.add(next).add(info).css({opacity: conf.opacity}),
			 close = api.getClosers(),
			 index;


//{{{ load

		function load(el) {

			var timr = setTimeout(function() {
    			progress.fadeIn();
    			timr = null;
			}, 200);
			els.hide(); close.hide();

			var url = el.attr("href");

			// download the image
			var image = new Image();

			image.onload = function() {
			    if (timr) {
			        clearTimeout(timr);
			        timr = null;
			    } else {
				    progress.fadeOut();
			    }

				// find image inside overlay
				var img = $("#" + conf.imgId, overlay);

				// or append it to the overlay
				if (!img.length) {
					img = $("<img/>").attr("id", conf.imgId); // .css("visibility", "hidden");
					overlay.prepend(img);
				}

				// make initially invisible to get it's dimensions
				img.attr("src", url); // .css("visibility", "hidden");

				// animate overlay to fit the image dimensions
				var width = image.width;
				var left = ($(window).width() - width) / 2;

				// calculate index number
				index = links.index(links.filter("[href=" +url+ "]"));

				// activate trigger
				links.removeClass(conf.activeClass).eq(index).addClass(conf.activeClass);

				// enable/disable next/prev links
				var cls = conf.disabledClass;
				els.removeClass(cls);

				if (index === 0) { prev.addClass(cls); }
				if (index == links.length -1) { next.addClass(cls); }


				// set info text & width
				var text = conf.template
					.replace("${title}", el.attr("title") || el.data("title") || "")
					.replace("${index}", index + 1)
					.replace("${total}", links.length);

				//var padd = parseInt(info.css("paddingLeft"), 10) +  parseInt(info.css("paddingRight"), 10);
				info.html(text); //.css({width: width - padd});


                if (!conf.preventResize) {
                    console.log('x');
                    overlay.css({
                        width: width, height: image.height, left: left
                    });
                }

				els.show(); close.show();

                // overlay.animate({
                //  width: width, height: image.height, left: left}, 0 /*conf.speed*/, function() {
                //      els.fadeIn(); close.show();
                //  // gradually show the image
                //                     // img.hide().css("visibility", "visible").fadeIn(0, function() {
                //                      // if (!conf.autohide) {
                //                      //     els.fadeIn(); close.show();
                //                      // }
                //                     // });
                //
                // });
			};

			image.onerror = function() {
				overlay.fadeIn().html("Cannot find image " + url);
			};

			image.src = url;

			if (conf.preload) {
				links.filter(":eq(" +(index-1)+ "), :eq(" +(index+1)+ ")").each(function()  {
					var img = new Image();
					img.src = $(this).attr("href");
				});
			}

		}
//}}}


		// function to add click handlers to next/prev links
		function addClick(el, isNext)  {

			el.click(function() {

				if (el.hasClass(conf.disabledClass)) { return; }

				// find the triggering link
				var trigger = links.eq(i = index + (isNext ? 1 : -1));

				// if found load it's href
				if (trigger.length) { load(trigger); }

			});
		}

		// assign next/prev click handlers
		addClick(next, true);
		addClick(prev);


		// arrow keys
		$(document).keydown(function(evt) {

			if (!overlay.is(":visible") || evt.altKey || evt.ctrlKey) { return; }

			if (evt.keyCode == 37 || evt.keyCode == 39) {
				var btn = evt.keyCode == 37 ? prev : next;
				btn.click();
				return evt.preventDefault();
			}
			return true;
		});

		function showEls() {
			if (!overlay.is(":animated")) {
				els.show(); close.show();
			}
		}

		// autohide functionality
		if (conf.autohide) {
			overlay.hover(showEls, function() { els.fadeOut();	close.hide(); }).mousemove(showEls);
		}

		// load a proper gallery image when overlay trigger is clicked
		var ret;

		this.each(function() {

			var el = $(this), api = $(this).overlay(), ret = api;

			api.onBeforeLoad(function() {
				load(el);
			});

			api.onClose(function() {
				links.removeClass(conf.activeClass);
			});
		});

		return conf.api ? ret : this;

	};

})(jQuery);
