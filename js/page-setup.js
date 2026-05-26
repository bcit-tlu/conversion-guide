(function ($) {
	var hamburger = "<svg data-name='Capa 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><defs><style>.bars{fill:#000;}</style></defs><title>Hamburger</title><path class='bars' d='M19.3,130.4H492.7a19.3,19.3,0,0,0,0-38.6H19.3a19.3,19.3,0,0,0,0,38.6Z'/><path class='bars' d='M19.3,275.3H492.7a19.3,19.3,0,0,0,0-38.6H19.3a19.3,19.3,0,0,0,0,38.6Z'/><path class='bars' d='M19.3,420.2H492.7a19.3,19.3,0,0,0,0-38.6H19.3a19.3,19.3,0,1,0,0,38.6Z'/></svg>";

	// var siteTitleHead = "Course Production - ";
	// Remove no-js class to indicate JavaScript is enabled
	$('html').removeClass('no-js');
	
	var siteTitleContent = "Conversion Guide";
	var $menuButton = $("<button>")
		.addClass("menu-button")
		.html(hamburger);

	// var $siteTitleHead = $("<span>")
	// 	.addClass("site-title-head")
	// 	.text(siteTitleHead);

	var $siteTitleContent = $("<span>")
		.addClass("site-title-content")
		.text(siteTitleContent);

	var $logo = $("<div>")
		.addClass("bcit-logo");

	var $branding = $("<div>")
		.addClass("branding")
		.prepend($menuButton.clone(), $logo.clone(), $siteTitleContent);

	$(".wrapper").prepend($branding);

	// Content transforms for styling and interaction

	// Adds MS Word flair
	$(".word").each(function () {
		$(this).html("<div class='backing'><div class='ruler'></div><div class='paper'>" + $(this).html() + "</div></div>");
	});

	// Allows preview content to render like the styleguide
	$(".preview").addClass("container");

	// Appends navigation to preview elements
	$(".preview").before("<button class='preview-button' title='preview' data-target='.preview'>PREVIEW</button>");
	$(".word").before("<button class='word-button' title='Markout' data-target='.word'>WORD</button>");
	$(".html").before("<button class='html-button' title='HTML' data-target='.html'>HTML</button>");
	$(".notes").before("<button class='notes-button' title='notes' data-target='.notes'>NOTES</button>");

	$(".html,.word,.notes").hide();
	$(".preview-button").addClass("open");

	$(".element").append("<div class='border-bottom'>");


	$(".html,.word,.notes").on("button-pressed", function () {
		$(this).slideToggle(250);
	});

	$(".element > button").on("click", function () {
		$(this).toggleClass("open");
		var target = $(this).data("target");
		$(this).parents("section").find(target).trigger("button-pressed");
		if (window.otelAnalytics && typeof window.otelAnalytics.trackEvent === "function") {
			var viewMode = (target || "").replace(/^\./, "");
			var elementIndex = $(this).parents("section").index();
			window.otelAnalytics.trackEvent("view_toggle", {
				page_type: (window.location.pathname || "").split("/").filter(Boolean).pop() || "home",
				view_mode: viewMode,
				element_index: String(elementIndex)
			});
		}
	});


	// Scrolling event handler
	$(window).on("scrollTo", function (e, id) {
		$("html,body").stop().animate({
			scrollTop: getOffset(id) - 50
		}, 300);

		function getOffset(id) {
			var $target = $("[id='" + id + "']");
			if ($target.length === 1) {
				return $target.offset().top - 10;
			}
			return 0;
		}
	});


	// Move menu highlighting on scroll
	$(window).on("scroll", function () {
		// TODO: Debounce function to reduce processing cost
		var pos = $(window).scrollTop();
		var crossOver = pos + $(window).height() * 0.5;

		$(".wrapper > section[id]").each(function () {
			var top = $(this).offset().top;
			var bottom = $(this).offset().top + $(this).height();
			var isCurrent = top < crossOver && bottom > crossOver;

			if (isCurrent) {
				var sectionId = $(this).attr("id");
				var $shouldBeCurrent = $(".menu [href*='#" + sectionId + "']").parent("li");
				if ($shouldBeCurrent.hasClass(".current")) {
					// do nothing
					return false;
				}
				$(".menu .current").removeClass("current");
				$shouldBeCurrent.addClass("current");
				updateSectionHash(sectionId);
				return false;
			}
		});
	});

	function updateSectionHash(sectionId) {
		if (!sectionId) {
			return;
		}
		if (window.location.hash === "#" + sectionId) {
			return;
		}
		if (!window.history || typeof window.history.replaceState !== "function") {
			return;
		}
		var newUrl = window.location.pathname + window.location.search + "#" + sectionId;
		window.history.replaceState(null, "", newUrl);
		if (sectionId !== lastTrackedSection) {
			trackEvent("content_section", {
				page_type: pageType,
				content_section: sectionId
			});
			lastTrackedSection = sectionId;
		}
	}

	// Menu
	setMenuPosition();

	function setMenuPosition() {
		var breakPoint = 1100;
		var windowWidth = parseInt($(window).width());

		if (windowWidth > breakPoint) {
			$("body").addClass("menu-open");
		}
	}

	// Navigation is now included at build time, no need to load via AJAX
	// Set current page highlighting
	var location = window.location.href;
	var path = location.substr(location.lastIndexOf('/') + 1);
	$(".menu a[href='" + path +"']").addClass("current");
	addMenuBehaviour();

	function addMenuBehaviour() {
		var $menu = $(".menu");
		var breakPoint = 1100;
		var windX = 0;

		$menu.on("adjust-size", function () {
			$(this).css("height", $(window).height());
		});

        // Open/close menu nav bar
		$menu.on("toggle", function () {
			$(this).find(".scrolling").scrollTop(0);
			$("body").toggleClass("menu-open");
			var windowWidth = $(window).width();

			if (windowWidth < breakPoint) {
				if($(".menu-open").length){
					$(".menu-overlay").css({"visibility": "visible", "opacity": "1"});
				} else {
					$(".menu-overlay").css({"visibility": "hidden", "opacity": "0"});
				}
				
			}
		});

		$menu.on("close", function () {
			$("body").removeClass("menu-open");
		});

		$(".menu-overlay").click(function(){
			$menu.trigger("toggle");
		});

		$menu.on("open", function () {
			$("body").addClass("menu-open");
		});

        // Prevent scrolling the whole page while scrolling the menu nav bar
		$(".scrolling").on("mousewheel DOMMouseScroll", function (e) {
		    var scrollEvent = e.originalEvent;
            var delta = scrollEvent.wheelDelta || -scrollEvent.detail;
            var scrollPos = $(this).scrollTop() + $(this).height() + 1;
            var reachTop = $(this).scrollTop() === 0 && delta > 0;
            var reachBottom =  scrollPos > $(this).prop('scrollHeight') && delta < 0;
            if(reachTop || reachBottom){
                e.preventDefault();
            }
        });

		var lastX;
		var lastY;
		$(".scrolling").bind('touchstart', function (e) {
			lastX = e.originalEvent.touches[0].clientX;
            lastY = e.originalEvent.touches[0].clientY;
		});
        
        // Prevent scrolling the whole page while swiping the menu nav bar
        $(".scrolling").bind('touchmove', function (e) {
            var currentX = e.originalEvent.changedTouches[0].clientX;
            var currentY = e.originalEvent.changedTouches[0].clientY;
            
            var checkY = Math.abs(currentY - lastY);
            // Swipe to close the menu nav bar
			if (lastX > currentX + 20 && checkY < 10) {
				$menu.trigger("toggle");
            }
            
            var scrollBottom = $(this).prop('scrollHeight');
            var scrollPosition = $(this).scrollTop() + $(this).height() + 1;
            
            if(currentY > lastY && $(this).scrollTop() === 0){
                e.preventDefault();
            }else if(currentY < lastY && scrollPosition >= scrollBottom){
                e.preventDefault();
            }

            lastX = currentX;
            lastY = currentY;
		});

		$("#close-menu, .close-menu").on("click", function () {
			$menu.trigger("close");
		});

		$(window).on("resize", function () {
			$menu.trigger("adjust-size");
			var windowWidth = parseInt($(window).width());
			if (windowWidth != windX) {
				if (windowWidth > breakPoint) {
					$menu.trigger("open");
				} else {
					$menu.trigger("close");
				}
				$(".menu-overlay").css({"visibility": "hidden", "opacity": "0"});
				windX = windowWidth;
			}
		});
		$(document).on("click", ".menu-button", function (e) {
			$menu.trigger("adjust-size");
			$menu.trigger("toggle");
			e.stopPropagation();
			return false;
		});

		$(".wrapper").on("click", function () {
			var windowWidth = $(window).width();
			if (windowWidth < breakPoint) {
				$menu.trigger("close");
			}
		});

		// Trigger scrolling
		$("a[href*='#']").on("click", function () {
			var href = $(this).attr("href");
			var pathname = href.split("#").shift();
			var id = href.split("#").pop();

			if (window.location.pathname.indexOf(pathname) !== -1) {
				$(window).trigger("scrollTo", id);
			}
		});

		$menu.trigger("adjust-size");
	}

	var showNavBar = 100;
	var $navBar = $("<nav>");
	$navBar.addClass("nav-bar")
		.append($menuButton.clone(true, true))
		.append("<a class='nav-bar-title' href='/home'></a>")
		.append("<a class='marker-reference' href='marker-reference'>" +
			"<span>#Marker Reference</span>" +
			"<div class='marker'>#</div></a>");
	if ($(window).scrollTop() > showNavBar && !$(".feedback-overlay").is(":visible")) {
		$navBar.addClass("showing");
	}

	$("body").prepend($navBar);
	
	var $menuOverlay = $("<div>").addClass("menu-overlay");
	$("body").append($menuOverlay);

	$(window).on("scroll", function () {
		if ($(window).scrollTop() > showNavBar && !$(".feedback-overlay").is(":visible")) {
			$(".nav-bar").addClass("showing");
		} else {
			$(".nav-bar").removeClass("showing");
		}
	});

	// Analytics tracking
	var pageType = getPageType();
	var lastTrackedSection = null;

	function getPageType() {
		var path = window.location.pathname || "";
		var trimmed = path.replace(/\/+$/, "");
		var last = trimmed.split("/").filter(Boolean).pop() || "";
		var name = last.replace(/\.html$/, "");
		if (!name || name === "index") {
			return "home";
		}
		return name;
	}

	function trackEvent(eventName, attrs) {
		if (window.otelAnalytics && typeof window.otelAnalytics.trackEvent === "function") {
			window.otelAnalytics.trackEvent(eventName, attrs || {});
		}
	}

	function getContentSectionFromHref(href) {
		if (!href || href.indexOf("#") === -1) {
			return null;
		}
		var hash = href.split("#").pop();
		if (!hash) {
			return null;
		}
		return decodeURIComponent(hash);
	}

	function getAssetInfo(href) {
		if (!href) {
			return null;
		}
		var url;
		try {
			url = new URL(href, window.location.href);
		} catch (e) {
			return null;
		}
		var path = url.pathname || "";
		var filename = path.split("/").pop() || "";
		var extMatch = filename.match(/\.([a-z0-9]+)$/i);
		if (!extMatch) {
			return null;
		}
		var extension = extMatch[1].toLowerCase();
		var supported = {
			docx: "docx",
			pdf: "pdf",
			jpg: "jpg",
			jpeg: "jpg",
			png: "png",
			gif: "gif",
			svg: "svg",
			mp4: "mp4",
			mp3: "mp3",
			wav: "wav",
			html: "html"
		};
		if (!supported[extension]) {
			return null;
		}
		return {
			type: supported[extension],
			name: decodeURIComponent(filename)
		};
	}

	function getExternalLinkValue(href) {
		if (!href) {
			return null;
		}
		if (href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) {
			return href;
		}
		var url;
		try {
			url = new URL(href, window.location.href);
		} catch (e) {
			return null;
		}
		if (url.protocol !== "http:" && url.protocol !== "https:") {
			return null;
		}
		if (url.hostname && url.hostname !== window.location.hostname) {
			return url.hostname;
		}
		return null;
	}

	$(document).on("click", ".menu a, .nav-bar a", function () {
		var href = $(this).attr("href") || "";
		var navLabel = $(this).text().trim() || href;
		var section = getContentSectionFromHref(href);
		var props = {
			page_type: pageType,
			nav_link: navLabel
		};
		if (section) {
			props.content_section = section;
		}
		trackEvent("nav_click", props);
	});

	$(document).on("click", "a[href]", function () {
		var href = $(this).attr("href") || "";
		var section = getContentSectionFromHref(href);
		if (section) {
			trackEvent("content_section", {
				page_type: pageType,
				content_section: section
			});
		}

		var assetInfo = getAssetInfo(href);
		if (assetInfo) {
			trackEvent("asset_download", {
				page_type: pageType,
				asset_type: assetInfo.type,
				asset_name: assetInfo.name
			});
		}

		var external = getExternalLinkValue(href);
		if (external) {
			trackEvent("external_click", {
				page_type: pageType,
				external_link: external
			});
		}
	});

	// Feedback form
	// $.get("/partials/feedback.html", function (data) {
	// 	var $div = $("<div>").addClass("feedback-overlay");
    //     var $feedbackButtons = $("<div>").addClass("feedback-btn-group");
    //     $feedbackButtons.append($("<div>").addClass("feedback-mini").html("<i class='fa fa-comments fa-sm'></i>"));
	// 	$feedbackButtons.append($("<div>").addClass("feedback-button").text("Feedback"));
	// 	$div.append(data);
	// 	$("body").append($div);
	// 	$("body").append($feedbackButtons);
	// 	addFeedbackBehaviour();
	// });

	// function addFeedbackBehaviour() {
	// 	$(".feedback-overlay").click(function () {
	// 		$(".close-form").click();
	// 	});

	// 	$(".feedback-form, .feedback-modal").click(function (event) {
	// 		event.stopPropagation();
	// 	});

	// 	$(".feedback-mini").click(function () {
            
    //         if($(".feedback-button").is(":visible")){
    //             $(".feedback-btn-group").animate({
    //                 right: "-=120px"
    //             }, "slow", function() {
    //                 $(".feedback-button").css({"display" : "none"});
    //            });
    //         } else {
    //             $(".feedback-button").css({"display" : "inline-block"});
    //             $(".feedback-btn-group").animate({
    //                 right: "+=120px"
    //             }, "slow")
    //         }
	// 	});

	// 	$(".feedback-button").click(function () {
	// 		$(".feedback-modal").hide();
	// 		$("body").removeClass("menu-open");
	// 		$(".feedback-overlay").show();
	// 		$(".feedback-form").show();
	// 		$(".feedback-form textarea").prop('required', true);
	// 	});

	// 	$(".close-form, .feedback-close-modal").click(function () {
	// 		$(".feedback-form textarea").prop('required', false);
	// 		$(".feedback-modal").hide();
	// 		$(".feedback-overlay").hide();
	// 		$(".feedback-mini").click();
	// 		return false;
	// 	});

	// 	$("#follow-up").on('change', function () {
	// 		if($(this).is(':checked')){
	// 			$(".optional-email").css("visibility", "visible");
	// 			$(".optional-email input").prop({autofocus:true, required:true}).focus();
				

	// 		} else {
	// 			$(".optional-email input").removeAttr("autofocus required");
	// 			$(".optional-email").css("visibility", "hidden");
	// 		}
	// 	});

	// 	$(".feedback-form form").on('submit', function (event) {
	// 		if(!$.trim($('.feedback-form textarea').val())) {
	// 			$(".feedback-form textarea").val('');
	// 			return false;
	// 	   }
    //         var userLocation = $(".current").find("a").attr("href") || window.location.href;
	// 		$(".input-location").attr("value", userLocation);

	// 		var $form = $(this);
	// 		$.ajax({
	// 			type: $form.attr('method'),
	// 			url: $form.attr('action'),
	// 			data: $form.serialize(),
	// 			statusCode: {
	// 				404: function () {
	// 					alert("page not found");
	// 				}
	// 			},
	// 			success: function () {
	// 				$(".feedback-form textarea").val('');
	// 				$(".feedback-form textarea").prop('required', false);
	// 				$(".feedback-form").hide();
	// 				$(".feedback-modal").show();
	// 				return false;
	// 			}
	// 		});
	// 		event.preventDefault();
	// 	});
	// }
}(jQuery));
