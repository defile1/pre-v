$(function () {
    $('.drop-down').on('click',function(){
        $(this).siblings('ul').toggle();
        $(this).children('i').toggleClass('icon-down-open icon-up-open')
    })
});