/**
 * jQuery lightbox plugin
 * This jQuery plugin was inspired and based on 
 *  Lightbox 2 by Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox2/)
 *  jQuery LightBox by Leandro Vieira Pinho (http://leandrovieira.com/projects/jquery/lightbox/)
 */

(function($) {
	$.lightbox = {
		// Event to bind
		bindEvent:				'click',

		// Configuration related to overlay
		overlayBgColor: 		'#000',		// (string) Background color to overlay; inform a hexadecimal value like: #RRGGBB. Where RR, GG, and BB are the hexadecimal values for the red, green, and blue values of the color.
		overlayOpacity:			0.8,		// (integer) Opacity value to overlay; inform: 0.X. Where X are number from 0 to 9

		// Configuration related to navigation
		fixedNavigation:		false,		// (boolean) Boolean that informs if the navigation (next and prev button) will be fixed or not in the interface.

		// Configuration related to images
		textBtnPrev:			'&lsaquo;',			// (string) the text of prev button
		textBtnNext:			'&rsaquo;',			// (string) the text of next button
		textBtnClose:			'&times;',		// (string) the text of close button

		// Configuration related to container image box
		containerBorderSize:	10,			// (integer) If you adjust the padding in the CSS for the container, #lightbox-imagebox, you will need to update this value
		containerResizeSpeed:	400,		// (integer) Specify the resize duration of container image. These number are miliseconds. 400 is default.

		// Configuration related to texts in caption. For example: Image 2 of 8. You can alter either "Image" and "of" texts.
		txtImage:				'Image',	// (string) Specify text "Image"
		txtOf:					'of',		// (string) Specify text "of"

		// Configuration related to keyboard navigation
		keyToClose:				'c',		// (string) (c = close) Letter to close the jQuery lightbox interface. Beyond this letter, the letter X and the SCAPE key is used to.
		keyToPrev:				'p',		// (string) (p = previous) Letter to show the previous image
		keyToNext:				'n',		// (string) (n = next) Letter to show the next image.
	};
	
	/**
	 * $ is an alias to jQuery object
	 *
	 */
	$.fn.lightbox = function(settings) {
		// Settings to configure the jQuery lightbox plugin how you like
		settings = $.extend({}, $.lightbox, settings);

		// Caching the jQuery object with all elements matched
		var $jos = this; // This, in this context, refer to jQuery object
		
		/**
		 * Initializing the plugin calling the start function
		 *
		 * @return boolean false
		 */
		function _initialize() {
			_start(this, $jos); // This, in this context, refer to object (link) which the user have clicked
			return false; // Avoid the browser following the link
		}

		/**
		 * Start the jQuery lightbox plugin
		 *
		 * @param object objClicked The object (link) whick the user have clicked
		 * @param object $jos The jQuery object with all elements matched
		 */
		function _start(objClicked, $jos) {
			$('body').addClass('lightbox-open');
			
			// Hime some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			$('embed, object, select').css({ 'visibility' : 'hidden' });

			// Call the function to create the markup structure; style some elements; assign events in some elements.
			_set_interface();

			// Unset image active information
			settings.images = [];
			settings.active = 0;

			// Add an Array (as many as we have), with href and title atributes, inside the Array that storage the images references		
			for (var i = 0; i < $jos.length; i++) {
				var el = $jos[i];
				if (el.tagName == 'A') {
					settings.images.push([ el.getAttribute('href'), el.getAttribute('title') ]);
				}
				else if (el.tagName == 'IMG') {
					settings.images.push([ el.getAttribute('src'), el.getAttribute('alt') ]);
				}
				if (el == objClicked) {
					settings.active = i;
				}
			}

			// Call the function that prepares image exibition
			_set_image_to_view();
		}

		/**
		 * Create the jQuery lightbox plugin interface
		 */
		function _set_interface() {
			// Apply the HTML markup into body tag
			$('body').append('<div id="lightbox-overlay"></div>'
					+ '<div id="lightbox-lightbox">'
						+ '<div id="lightbox-imagebox">'
							+ '<img id="lightbox-image">'
							+ '<div style="" id="lightbox-nav">'
								+ '<a href="#" id="lightbox-btn-prev"></a>'
								+ '<a href="#" id="lightbox-btn-next"></a>'
							+ '</div>'
							+ '<a href="#" id="lightbox-loading"></a>'
						+ '</div>'
						+ '<div id="lightbox-statusbox">'
							+ '<div id="lightbox-image-caption"></div>'
							+ '<div id="lightbox-image-number"></div>'
							+ '<a href="#" id="lightbox-btn-close">' + settings.textBtnClose + '</a>'
						+ '</div>'
					+ '</div>');

			// Style overlay and show it
			$('#lightbox-overlay').css({
				backgroundColor:	settings.overlayBgColor,
				opacity:			settings.overlayOpacity,
			}).fadeIn();

			// set lightbox-imagebox line-height to center image
			_on_resize();

			// Assigning click events in elements to close overlay
			$('#lightbox-overlay,#lightbox-lightbox').click(function() {
				_finish();
			});

			// Assign the _finish function to lightbox-loading and lightbox-btn-close objects
			$('#lightbox-loading,#lightbox-btn-close').click(function() {
				_finish();
				return false;
			});

			// If window was resized, calculate the new overlay dimensions
			$(window).bind('resize', _on_resize);
		}
		
		/**
		 * set lightbox-imagebox line-height to center image
		 */
		function _on_resize() {
			$('#lightbox-imagebox').css('line-height', ($('#lightbox-imagebox').innerHeight() - 2) + 'px');
		}
		
		/**
		 * Prepares image exibition; doing a image's preloader to calculate it's size
		 */
		function _set_image_to_view() { // show the loading
			// Show the loading
			$('#lightbox-loading').show();
			if (settings.fixedNavigation) {
				$('#lightbox-image,#lightbox-statusbox').hide();
			}
			else {
				// Hide some elements
				$('#lightbox-image,#lightbox-nav,#lightbox-btn-prev,#lightbox-btn-next,#lightbox-statusbox').hide();
			}
			
			// Image preload process
			var img = new Image();
			img.onload = function() {
				$('#lightbox-image').attr('src', settings.images[settings.active][0]);

				// Perfomance an effect in the image container resizing it
				_show_image();

				//	clear onLoad, IE behaves irratically with animated gifs otherwise
				img.onload = function(){};
			};
			img.src = settings.images[settings.active][0];
		};
		

		/**
		 * Show the prepared image
		 */
		function _show_image() {
			$('#lightbox-loading').hide();
			$('#lightbox-image').fadeIn(function() {
				_show_image_data();
				_set_navigation();
			});
			_preload_neighbor_images();
		};

		/**
		 * Show the image information
		 */
		function _show_image_data() {
			if (settings.images.length > 1) {
				$('#lightbox-image-caption').html(settings.images[settings.active][1]);
				$('#lightbox-image-number').html(settings.txtImage + ' ' + ( settings.active + 1 ) + ' ' + settings.txtOf + ' ' + settings.images.length);
			}
			$('#lightbox-statusbox').slideDown('fast');
		}

		/**
		 * Display the button navigations
		 */
		function _set_navigation() {
			$('#lightbox-nav').show();

			$('#lightbox-btn-prev,#lightbox-btn-next').empty();
			
			// Show the prev button, if not the first image in set
			if (settings.active > 0) {
				var $p = $('#lightbox-btn-prev')
					.html('<span id="lightbox-txt-prev">' + settings.textBtnPrev + '</span>')
					.unbind()
					.bind('click', function() {
						settings.active--;
						_set_image_to_view();
						return false;
					});

				if (!settings.fixedNavigation) {
					// Show the images button for Next buttons
					$p.show()
						.mouseenter(function() {
							$(this).html('<span id="lightbox-txt-prev">' + settings.textBtnPrev + '</span>');
						})
						.mouseleave(function() {
							$(this).empty();
						});
				}
			}
			
			// Show the next button, if not the last image in set
			if (settings.active < settings.images.length - 1) {
				var $n = $('#lightbox-btn-next')
					.html('<span id="lightbox-txt-next">' + settings.textBtnNext + '</span>')
					.unbind()
					.bind('click',function() {
						settings.active++;
						_set_image_to_view();
						return false;
					});
				if (!settings.fixedNavigation) {
					// Show the images button for Next buttons
					$n.show()
						.mouseenter(function() {
							$(this).html('<span id="lightbox-txt-next">' + settings.textBtnNext + '</span>');
						})
						.mouseleave(function() {
							$(this).empty();
						});
				}
			}

			// Enable keyboard navigation
			_enable_keyboard_navigation();
		}

		/**
		 * Enable a support to keyboard navigation
		 */
		function _enable_keyboard_navigation() {
			$(document).keydown(function(objEvent) {
				_keyboard_action(objEvent);
			});
		}

		/**
		 * Disable the support to keyboard navigation
		 */
		function _disable_keyboard_navigation() {
			$(document).unbind();
		}

		/**
		 * Perform the keyboard actions
		 */
		function _keyboard_action(objEvent) {
			// To ie
			if (objEvent == null) {
				keycode = event.keyCode;
				escapeKey = 27;
			// To Mozilla
			}
			else {
				keycode = objEvent.keyCode;
				escapeKey = objEvent.DOM_VK_ESCAPE;
			}

			// Get the key in lower case form
			key = String.fromCharCode(keycode).toLowerCase();

			// Verify the keys to close the ligthBox
			if (( key == settings.keyToClose ) || ( key == 'x' ) || ( keycode == escapeKey )) {
				_finish();
			}

			// Verify the key to show the previous image
			if (( key == settings.keyToPrev ) || ( keycode == 37 )) {
				// If we're not showing the first image, call the previous
				if (settings.active != 0) {
					settings.active = settings.active - 1;
					_set_image_to_view();
					_disable_keyboard_navigation();
				}
			}

			// Verify the key to show the next image
			if (( key == settings.keyToNext ) || ( keycode == 39 )) {
				// If we're not showing the last image, call the next
				if (settings.active != ( settings.images.length - 1 )) {
					settings.active = settings.active + 1;
					_set_image_to_view();
					_disable_keyboard_navigation();
				}
			}
		}

		/**
		 * Preload prev and next images being showed
		 */
		function _preload_neighbor_images() {
			if (settings.images.length) {
				var i = settings.active - 1;
				(new Image()).src = settings.images[i < 0 ? settings.images.length - 1 : i][0];
				
				i = settings.active + 1;
				(new Image()).src = settings.images[i >= settings.images.length ? 0 : i][0];
			}
		}

		/**
		 * Remove jQuery lightbox plugin HTML markup
		 */
		function _finish() {
			$(window).unbind('resize', _on_resize);

			$('#lightbox-lightbox').remove();
			$('#lightbox-overlay').fadeOut(function() { $('#lightbox-overlay').remove(); });

			// Show some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			$('embed, object, select').css({ 'visibility' : 'visible' });

			$('body').removeClass('lightbox-open');
		}

		// Return the jQuery object for chaining. The unbind method is used to avoid click conflict when the plugin is called more than once
		return this.unbind(settings.bindEvent).bind(settings.bindEvent, _initialize);
	};
})(jQuery);
