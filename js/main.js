//jQuery to collapse the navbar on scroll
$(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
});

//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        var top = 0;
        if($anchor.attr('href') != "#") {
        	top = $($anchor.attr('href')).offset().top;
        }
        
        $('html, body').stop().animate({
            scrollTop: top-75
        }, 700);
        event.preventDefault();
    });
});

$(function() {
    $('a.page-fast-scroll').bind('click', function(event) {
        var $anchor = $(this);
        var top = 0;
        if($anchor.attr('href') != "#") {
        	top = $($anchor.attr('href')).offset().top;
        }

        $('html, body').stop().animate({
            scrollTop: top-75
        }, 500);
        event.preventDefault();
    });
});