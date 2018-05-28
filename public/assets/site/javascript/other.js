$(function(){
    window.Currency = function(number, locale, symbol, minimumFractionDigits){
        var formatter = new Intl.NumberFormat(locale || "en-GB", {
          style: 'currency',
          currency: symbol || 'GBP',
          minimumFractionDigits: minimumFractionDigits || 0,
        });

        return (formatter.format(number));
    }

    $('body').find('.ui.rating').rating({interactive:false});
    $('body')
    .on('click',function(e){
        $('.context').hide();
    })
    .on('click', '.context, .contexted',function(e){
        e.stopPropagation();
    })
    .on('click','.menu-icon',function(e){
        e.preventDefault();
        $(this).toggleClass('active-menu-icon');
        $('#main-menu').slideToggle();
    })

    if($('.cycleSection').slick) $('.cycleSection').slick({
        arrows: false,
        dots: false,
        autoplay: true,
        autoplaySpeed: 3000,
        fade: true,
        cssEase: 'linear',
        pauseOnHover: false,
        pauseOnFocus: false
    });
})