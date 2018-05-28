$(function () {
    $('body')
    .on('ajax.done', 'form.sendMessage', function(response){
        // the callback if successful
        try{
            $( "a[href='" +  $(this).attr('action') + "']").trigger("click");
        }catch(e){}

        $(this).empty();
        $(this).text("Message sent.");
    })
    .on('click', '#list-message-senders .item', function(event){
        event.preventDefault();
        var href    = $(this).attr('href');
        var message = $('#messages');

        $.ajax({
            url: href,
            resultsTarget: message
        })
        .done(function (response) {
            message.empty().html(response);
        })
        .fail(Site.GlobalAjaxFail)
        .always(function () {
            $('.list-message').hide();
            message.show();
        });

        $(this).parent('li').parent('ul').children('li').removeClass('selected-message');
        $(this).parent('li').addClass('selected-message');
    })

    $('#list-message-senders li a').first().click()
})