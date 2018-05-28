$(function () {
    $('body')
    .on('click', '.tabs li a', function (event) {
        event.preventDefault();
        var target = $(this).attr("href");
        try{
            $(target).siblings().hide();
            $(target).show()
            $(this).parent('li').addClass('current-tab');
            $(this).parent('li').siblings('li').removeClass('current-tab');
        }catch(e){}
    })
    $('.tabs').each(function(){
        $(this).find('li').first().addClass('current-tab')
    })
})