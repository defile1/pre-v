$(document).ready(function () {
    Site.reloadUI($('body'));

    $("body")
    .on('click', '#sidebar,#notifications',function() {
        if($(window).width()<=1024){
            $('#layout > .mainWrapper').addClass('isMobile');
        }
        $('#layout > .mainWrapper.isMobile .mmSideBar').css({'opacity':1});
    })
    .on('click', '#sidebar',function() {
        $('#layout > .mainWrapper').toggleClass("noSidebar");
        $('#layout > .mainWrapper.isMobile').addClass("noNotifications");
    })
    .on('click', '#notifications',function() {
        $('#layout > .mainWrapper').toggleClass("noNotifications");
        $('#layout > .mainWrapper.isMobile').addClass("noSidebar");
    })
    .on('click', '.list .item',function() {
        var item = $(this)
        var list = item.parent();

        list.children('.item').removeClass("active");
        item.addClass("active");

    })
    .on('click', '#sidebar',function() {
        $('.mainer.menu.ui.sidebar').sidebar('toggle');
    })
    .on('click', '#notifications',function() {
        $('.notifications.ui.sidebar').sidebar('toggle');
    })
    ;

    if($(window).width()<=1024){
        $('#layout > .mainWrapper').addClass('noNotifications noSidebar isMobile');
    }

})