if(Site){

    Site.Notifications = {}
    Site.Notifications.add = function(notification){
        $('.notifications').not('.clone').remove();
        var wrap = $('.clone.notifications').clone();

        wrap.removeClass('clone');
        wrap.find('.title').text(notification.title);
        wrap.find('.message').text(notification.message);
        wrap.addClass(notification.type);

        wrap.on('click', function(){
            $(this).remove();
        })
        $('body').append(wrap);
        setTimeout(function(){
            wrap.remove();
        }, 7500)
    }
}