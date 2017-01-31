//jQuery to collapse the navbar on scroll
$(window).scroll(function(event) {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
    
    var scrollPos = $(document).scrollTop();
    $('.nav a').each(function () {
        var currLink = $(this);
        var refElement = $(currLink.attr("href"));

        //600 is a height offset
        if (refElement.position().top-600 <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
            $('.nav li').removeClass("active");
            currLink.parent().addClass("active");
        }
        else{
            //currLink.parent().removeClass("active");
        }
    });
});

//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        var top = 0;
        if($anchor.attr('href') != "#") {
            var offset = $($anchor.attr('href')).offset(); 
        	top = offset? offset.top : 0;
        }
        $("ul.nav.navbar-nav").children('li').each(function () {
            //$(this).removeClass("active");
        });
        //$anchor.parent().addClass("active");
        
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
