
//Setup ChartJS
/*Chart.defaults.global.defaultFontColor = 'white';*/
/*Chart.defaults.global.defaultFontSize = 24;*/
Chart.defaults.global.defaultFontFamily = "Poiret One";

$(function() {
    //jQuery for page scrolling feature - requires jQuery Easing plugin
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

    var skillsChart = new Chart($("#skills-chart"), {
        type: 'radar',
        data: {
            labels: ["Gameplay", "Animation", "Tools", "AI"],
            datasets: [{
                data: [30, 15, 20, 27],
                backgroundColor: 'rgba(191, 46, 38, 0.2)',
                borderColor: 'rgba(191, 46, 38,1)'
            }]
        },
        options: {
            responsive: true,
            scale: {
                ticks: {
                    display: false,
                    min: 0,
                    max: 35,
                    stepSize: 5,
                },
                pointLabels: {
                    fontSize:24,
                    fontColor: "white",
                    fontFamily: "Poiret One"
                }
            },
            legend: {
                display: false
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem) {
                            return tooltipItem.yLabel;
                    }
                }
            }
        }
    });

    var techChart = new Chart($("#tech-chart"), {
        type: 'horizontalBar',
        data: {
            labels: ["Unreal Engine 4", "C++", "Unity & C#", "Back-End, NodeJs", "Agile & Git"],
            datasets: [{
                label: "Years of Experience",
                data: [2.5, 3, 2, 4, 3.5],
                backgroundColor: 'rgba(191, 46, 38, 0.2)',
                borderColor: 'rgba(191, 46, 38,1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        fontSize:22,
                        fontColor: "white",
                        fontFamily: "Poiret One"
                    },
                }],
                xAxes: [{
                    ticks: {
                        stepSize: 1,
                        fontSize:16,
                        fontColor: "white",
                        beginAtZero:true
                    }
                }]
            },
            legend: {
                labels: {
                    fontSize:18,
                    fontColor: "white",
                    beginAtZero:true
                }
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem) {
                            return tooltipItem.yLabel;
                    }
                }
            }
        }
    });
});

//jQuery to collapse the navbar on scroll
$(window).scroll(function(event) {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
    
    var scrollPos = $(document).scrollTop();
    $('.nav a').not('.external').each(function () {
        var currLink = $(this);
        var refElement = $(currLink.attr("href"));

        //600 is a height offset
        if (refElement.position().top-500 <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
            $('.nav li').removeClass("active");
            currLink.parent().addClass("active");
        }
        else{
            //currLink.parent().removeClass("active");
        }
    });
});

jQuery(document).ready(function($){
    var dragging = false,
        scrolling = false,
        resizing = false;

    //cache jQuery objects
    var comparisonContainers = $('.comp-container');

    //check if the .comp-container is in the viewport 
    //if yes, animate it
    checkPosition(comparisonContainers);
    $(window).on('scroll', function(){
        if( !scrolling) {
            scrolling =  true;
            ( !window.requestAnimationFrame )
                ? setTimeout(function(){checkPosition(comparisonContainers);}, 100)
                : requestAnimationFrame(function(){checkPosition(comparisonContainers);});
        }
    });
    
    //make the .bar element draggable and modify .left-img width according to its position
    comparisonContainers.each(function(){
        var actual = $(this);
        drags(actual.find('.bar'), actual.find('.left-img'), actual, actual.find('.label[data-type="original"]'), actual.find('.label[data-type="modified"]'));
    });

    //update images label visibility
    $(window).on('resize', function(){
        if( !resizing) {
            resizing =  true;
            ( !window.requestAnimationFrame )
                ? setTimeout(function(){checkLabel(comparisonContainers);}, 100)
                : requestAnimationFrame(function(){checkLabel(comparisonContainers);});
        }
    });

    function checkPosition(container) {
        container.each(function(){
            var actualContainer = $(this);
            if( $(window).scrollTop() + $(window).height()*0.5 > actualContainer.offset().top) {
                actualContainer.addClass('is-visible');
            }
        });

        scrolling = false;
    }

    function checkLabel(container) {
        container.each(function(){
            var actual = $(this);
            updateLabel(actual.find('.label[data-type="modified"]'), actual.find('.left-img'), 'left');
            updateLabel(actual.find('.label[data-type="original"]'), actual.find('.left-img'), 'right');
        });

        resizing = false;
    }

    //draggable funtionality - credits to http://css-tricks.com/snippets/jquery/draggable-without-jquery-ui/
    function drags(dragElement, resizeElement, container, labelContainer, labelResizeElement) {
        dragElement.on("mousedown vmousedown touchstart", function(e) {
            dragElement.addClass('draggable');
            resizeElement.addClass('resizable');

            var x = e.pageX? e.pageX : e.originalEvent.touches[0].clientX;

            var dragWidth = dragElement.outerWidth(),
                xPosition = dragElement.offset().left + dragWidth - x,
                containerOffset = container.offset().left,
                containerWidth = container.outerWidth(),
                minLeft = containerOffset + 10,
                maxLeft = containerOffset + containerWidth - dragWidth - 10;
            
            dragElement.parents().on("mousemove vmousemove touchmove", function(e) {
                if( !dragging) {
                    dragging =  true;
                    ( !window.requestAnimationFrame )
                        ? setTimeout(function(){animateDraggedHandle(e, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, resizeElement, labelContainer, labelResizeElement);}, 100)
                        : requestAnimationFrame(function(){animateDraggedHandle(e, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, resizeElement, labelContainer, labelResizeElement);});
                }
            }).on("mouseup vmouseup touchend", function(e){
                dragElement.removeClass('draggable');
                resizeElement.removeClass('resizable');
            });
            e.preventDefault();
        }).on("mouseup vmouseup touchend", function(e) {
            dragElement.removeClass('draggable');
            resizeElement.removeClass('resizable');
        });
    }

    function animateDraggedHandle(e, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, resizeElement, labelContainer, labelResizeElement) {
        var x = e.pageX? e.pageX : e.originalEvent.touches[0].clientX;
        
        var leftValue = x + xPosition - dragWidth;   
        //constrain the draggable element to move inside his container
        if(leftValue < minLeft ) {
            leftValue = minLeft;
        } else if ( leftValue > maxLeft) {
            leftValue = maxLeft;
        }

        var widthValue = (leftValue + dragWidth/2 - containerOffset)*100/containerWidth+'%';
        
        $('.draggable').css('left', widthValue).on("mouseup vmouseup touchend", function() {
            $(this).removeClass('draggable');
            resizeElement.removeClass('resizable');
        });

        $('.resizable').css('width', widthValue); 

        updateLabel(labelResizeElement, resizeElement, 'left');
        updateLabel(labelContainer, resizeElement, 'right');
        dragging =  false;
    }

    function updateLabel(label, resizeElement, position) {
        if(label.offset() == undefined)
            return;

        if(position == 'left') {
            ( label.offset().left + label.outerWidth() < resizeElement.offset().left + resizeElement.outerWidth() ) ? label.removeClass('is-hidden') : label.addClass('is-hidden') ;
        } else {
            ( label.offset().left > resizeElement.offset().left + resizeElement.outerWidth() ) ? label.removeClass('is-hidden') : label.addClass('is-hidden') ;
        }
    }
});