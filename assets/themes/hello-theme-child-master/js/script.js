(function($) {
	$(document).ready(function() {
		
		// SMOOTH SCROLL
		$("a.smooth").on('click', function(event) {

			if (this.hash !== "") {
				event.preventDefault();

				var hash = this.hash;
				var offset = 120
				
				$('html, body').animate({
					scrollTop: $(hash).offset().top - offset
					}, 800, function(){

					window.location.hash = hash;
				});
			}
		});
				
		// HEADER SCROLL
		$(window).scroll(function(){
			if ($(window).scrollTop() > 40){
				$("#header-main").addClass("scrolled");
				$("section.mega-menu").addClass("scrolled");
				$("#logo").addClass("scrolled");
				$("#logo-alt").addClass("scrolled"); 
				$("#menu-mobile").addClass("scrolled");
				
			} else {
				$("#header-main").removeClass("scrolled");
				$("section.mega-menu").removeClass("scrolled");
				$("#logo").removeClass("scrolled");
				$("#logo-alt").removeClass("scrolled");
				$("#menu-mobile").removeClass("scrolled");
				
			}
		});
		
		// MEGA MENU
		//// Used classes for better structure instead of fadeToggle
		$("li.mega-menu").each(function(){
			//// Variable the menu label as selector
			var menuClass = $(this).find("a")[0].childNodes[0].nodeValue.trim();
			menuClass = menuClass.replace(/\s+/g, '-').toLowerCase();
			
			$(this).on("mouseenter click", function() {
				// Add active to menu trigger to preserved hovered state
				$(this).find("a").addClass("active");
				$("#"+menuClass).addClass("active");
				$("#header-main").addClass("remove-shadow");
			});
			$(this).on("mouseleave", function() {
				$(this).find("a").removeClass("active");
				$("#"+menuClass).removeClass("active");
				$("#header-main").removeClass("remove-shadow");
			});
			//// Preserve the hover on mega menu container
			$("#"+menuClass).on("mouseenter click", function() {
				$(this).addClass("active");
				$("li.mega-menu a:contains("+menuClass+")").addClass("active");
				$("#header-main").addClass("remove-shadow");
			});
			$("#"+menuClass).on("mouseleave", function() {
				$(this).removeClass("active");
				$("li.mega-menu a:contains("+menuClass+")").removeClass("active");
				$("#header-main").removeClass("remove-shadow");
			});
			
			//// Prevent going to URL on first click on Touch Devices
			$(this).on("touch", function(e) {
				if($(this).hasClass("prevented")) {
					event.preventDefault();
					$(this).removeClass("prevented");
				} else {
					$(this).addClass("prevented");
					$(this).unbind("click");
				}
			});
			
			//// Additional Icon
			$(this).find("a").append('<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><g id="group-menu-icon" data-name="Group Menu Icon" transform="translate(-1006 -46)"><rect id="rect-box" data-name="Rect Box" width="12" height="12" transform="translate(1006 46)" fill="none"/><path id="Path" data-name="Path" d="M815.429,45.332l3.712,3.712,3.712-3.712" transform="translate(193 5.168)" fill="none" stroke="#666" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></g></svg>');
		});
		
		// MOBILE MENU TOGGLE
		//// I used Fade Toggle for simpler coding
		$("#toggle-menu").click(function() {
			$(this).toggleClass("active");
			$("#menu-mobile").fadeToggle(300);
			$("#header-main").toggleClass("remove-shadow");
			$("#header-main").toggleClass("add-bg");
		});
		//// Made the mobile menu similar to accordion.
		$("li.submenu-title").each(function(){
			$(this).find(">a").on("click", function() {
				$(this).parent("li.submenu-title").siblings().find(">ul").slideUp("fast");
			});
		});
		
		// PARENT MENU ICON
		$(".elementor-nav-menu > li.menu-item-has-children > a").each(function(){
			$(this).append('<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><g id="group-menu-icon" data-name="Group Menu Icon" transform="translate(-1006 -46)"><rect id="rect-box" data-name="Rect Box" width="12" height="12" transform="translate(1006 46)" fill="none"/><path id="Path" data-name="Path" d="M815.429,45.332l3.712,3.712,3.712-3.712" transform="translate(193 5.168)" fill="none" stroke="#666" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></g></svg>');
		});
		
		// ELEMENTOR CUSTOM ACCORDION
		$(".active-hover .elementor-accordion-item").on("mouseenter click touch", function() {
			$(this).find(".elementor-tab-title").addClass("elementor-active");
			$(this).find(".elementor-tab-content").addClass("elementor-active");
			$(this).find(".elementor-tab-content").stop().slideDown("slow");
			// Slide off on others
			$(this).siblings().find(".elementor-tab-title").removeClass("elementor-active");
			$(this).siblings().find(".elementor-tab-content").removeClass("elementor-active");
			$(this).siblings().find(".elementor-tab-content").stop().slideUp("slow");
		});
		
		//// Reset to first child active
		$(".active-hover .elementor-accordion").on("mouseleave", function() {
			$(this).find(".elementor-accordion-item:first-child .elementor-tab-title").addClass("elementor-active");
			$(this).find(".elementor-accordion-item:first-child .elementor-tab-content").addClass("elementor-active");
			$(this).find(".elementor-accordion-item:first-child .elementor-tab-content").stop().slideDown("slow");
			// Slide off on others
			$(this).find(".elementor-accordion-item:first-child").siblings().find(".elementor-tab-title").removeClass("elementor-active");
			$(this).find(".elementor-accordion-item:first-child").siblings().find(".elementor-tab-content").removeClass("elementor-active");
			$(this).find(".elementor-accordion-item:first-child").siblings().find(".elementor-tab-content").stop().slideUp("slow");
		});
		
		// GFORM VALIDATION
		$(document).on("gform_post_render", function() {
			$(".gform_wrapper .gfield").each(function(){
				$(this).on("mouseenter click touch", function() {
					$(this).find(".gfield_validation_message").fadeOut();
				});
			});
		});
		
		
		// UNCACHEABLE VIDEOS
		var ver = Date.now();
		$(".process-image-container video source").each(function(){
			var videoLink = $(this).attr("src");
			$(this).attr("src", videoLink+'?'+ver)
		});
		
		/****************************************************************************************/
		/************* END LOCAL STORAGE POPUP **************************************************/
		/****************************************************************************************/
		
		$(".agency .description").each(function() {
		  	$(this).find(".read-more").click(function() {
				$(this).siblings('.more-content').slideToggle('fast');
				var text = $(this).text();
				var ellipsis = $(this).siblings(".ellipsis").text();
				
				$(this).text(text == " Read Less" ? " Read More" : " Read Less");
				$(this).siblings(".ellipsis").text(ellipsis == "" ? " ..." : "");
			  return false;
			});
		});
	
		// Remove the not-necessary p tag in the custom embed
		$('.custom-thumbnail p').not('#primary.default .content p').not('.content p:first').each(function() {
            // Detach the p tag from the DOM while keeping its children intact
            $(this).children().appendTo($(this).parent());
            $(this).remove();
        });
	
		// 	$('#job-form .gform_wrapper.gravity-theme .elementor-button').on("click", function(){
		// 		$('#job-form .gform_wrapper.gravity-theme input[type=submit]').click();
		// 	});
		$(document).on('gform_post_render', function(event, form_id, current_page){
			var triggerTimeout;
			$('#job-form .gform_wrapper.gravity-theme .elementor-button').on('click', function() {
				clearTimeout(triggerTimeout);
						triggerTimeout = setTimeout(function() {
							$('#gform_submit_button_12').click();
						}, 100);
					});
		});
	
		$('.hide-button').on('click', function(event) {
			event.preventDefault();
			$('.hide-items').fadeIn(300);
			$('.hide-button').fadeOut(300);
		});
	
		$('#banner.portfolio .elementor-widget-image img, .web-screens img, .parent-pageid-56 .elementor-widget-image img').attr('srcset','');
	
		//Removing the #primary.pricing in the classic editor
		$('#post-module #primary.pricing').children('div').unwrap();
	
		$('.trigger-show, .trigger-hide').click(function () {
			// Handles the toggle HIDE/SHOW
			$('.hide-text').slideToggle();
			$('.hide-text').parent().prev().toggleClass('expanded');
			$('.trigger-show').toggleClass('clicked');
		});
		$('.hide-text').hide();

		//Slide In 
		const today = new Date();	

		setTimeout(function(){
			var hasSetupTime = localStorage.getItem('timeSetup');
			var alreadySubmitted = localStorage.getItem('submitted');
			if(alreadySubmitted == null &&  hasSetupTime == null){
				$('#newsletter-slide-in').addClass('show');
			}else{
				const dateSetup = new Date(hasSetupTime);
				if(hasSetupTime != null && dateSetup.getTime() < today.getTime()){
					$('#newsletter-slide-in').addClass('show');	
				}
			}
		}, 10000);
	
		$('.close-trigger .elementor-icon').click(function(){
			$('#newsletter-slide-in').removeClass('show');
			const futureDate = new Date(today);
			futureDate.setDate(futureDate.getDate() + 14); // Add 14 days
			localStorage.setItem('timeSetup', futureDate);
		});
	
		jQuery(document).on('gform_confirmation_loaded', function(event, formId){
			if(formId === 4){ // Change 3 to your form ID
				const futureDate = new Date(today);
				futureDate.setDate(futureDate.getDate() + 9999); // Add 14 days
				localStorage.setItem('timeSetup', futureDate);
				window.location.href = "/contact/client-review/confirm-subscription";
			}
		});
	
	
		//Move the table of contents (TOC) when the screen is in tablet/mobile mode. This is for the new services template.
		const originalParent = $('.custom-menu ');

		function moveTOC() {
			if ($(window).width() <= 1024) {
				$('.toc-main').prependTo('.services-alt-1 > .e-con-inner');
			} else {
				$('.toc-main').prependTo(originalParent);
			}
		}

		moveTOC();

		$(window).on('resize', moveTOC);
		
		
		$('.carousel .elementor-widget-image').clone(true).appendTo('.carousel');

		
		
		$(document).on('click', '.read-more-btn', function (e) {
			e.preventDefault();

			var $btn = $(this);
			var $content = $btn
				.closest('p')
				.prev('.read-more-content');

			var isSeeMore = $.trim($btn.text()) === 'See More';

			$content.slideToggle();

			$btn
				.text(isSeeMore ? 'See Less' : 'See More')
				.toggleClass('active', isSeeMore);
		});
		
	});			 
})(jQuery);