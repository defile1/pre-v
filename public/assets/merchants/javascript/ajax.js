
$(document)
.ajaxError(function (event, response) {
    switch(response.status){
        case 409:

            break;
        case 404:
            console.info("404 error: todo: fix")
            break;
        case 401:
            $('.ui.modal.login').find('.error').text(response.responseJSON.error)
            $('.ui.modal.login').find('[name=username]')
                .val(Stores.Collections.CurrentUser[0].get("username"))
                .show();

            $('.ui.modal.login')
            .modal({blurring: true, onApprove: function () {
                $('.ui.modal.login').find('.error').hide();
                return false;
            }})
            .modal('show')
            ;
            break;
        case 302:
            if(response.responseJSON["refresh"] == true){
                window.location.href = window.location.href;
            }else{
                window.location.href = response.responseJSON.redirect;
            }
            break;
        default:
            throw "Ajax error: run out of options "+response.status+" ?"
    }
})
.ajaxComplete(function (event, response, request) {
    var isHTML = response.getResponseHeader("content-type").startsWith("text/html");
    if(isHTML){
        Site.reloadUI(request.resultsTarget);
        // $('form.bind').trigger('init')
    }
})
$(function (argument) {
    $('body')
    .on('click','a.removeProduct', function a_ajax_click(event) {
        event.preventDefault();
        $('.removeProduct.modal').modal('show');
    })
    .on('ajax-done','div.removeProduct .approve', function a_ajax_click(event) {
        window.location.href = ($(this).attr("redirect") || "../");
    })
    .on('click','a.ajax', function a_ajax_click(event) {
        event.preventDefault();
        var self   = $(this);
        var url    = $(this).prop("href");
        var method = ($(this).attr("method") ||  $(this).prop("method") || "").toUpperCase();

        $.ajax({
            url : url,
            method: method,
        })
        .done(function a_ajax_click_done(response) {
            // todo:
            console.log(response)
            self.trigger('ajax-done');
        })
        .fail(Site.GlobalAjaxFail)
        .always(function a_ajax_click_always(){
            // todo:
            throw new Error("Fix always.")
        })
    })
    .on('ajax.done', 'form.ajax.login',function(event){
        $('.ui.modal.login').modal('hide');
    })
    .on('ajax.validation', 'form.ajax',function(event){
        debugger
    })
    .on('submit', 'form.ajax',function(event){
        event.preventDefault();

        $('.field').removeClass('error')

        var form     = this;
        var $form    = $(form);
        var formData = $form.serializeArray();
        var url      = $form.prop("action");
        var method   = ($form.attr("method")+"").toUpperCase();
        var skipfalsyvaluesfortypes = $form.data('skipfalsyvaluesfortypes') || ["number"];

        $(form).addClass('loading');

        var data     = $form.serializeJSON({skipFalsyValuesForTypes: skipfalsyvaluesfortypes});

        if($( "#notifications" ).length) $form.find('[type=submit]').effect( "transfer", { to: $( "#notifications" ) }, 500 );

        $.ajax({
            url         : url,
            method      : method,
            data        : JSON.stringify(data),
            dataType    : "json",
            contentType : "application/json; charset=utf-8",
        })
        .done(function (response) {
            $form.trigger("ajax.done", response);
            if(Site && Site.Notifications && Site.Notifications.add) Site.Notifications.add({title: "Success:", message: response.message || "Saved successfully.", type: "success"})
            if(response.isNew===true){
                window.location.href = "../"+response.id+"/";
            }
        })
        .fail(function(response){
            Site.GlobalAjaxFail(response, $form);
        })
        .always(function (response) {
            $form.find('[type=submit] i').removeClass('fa-spinner fa-spin');

            $(form).removeClass('loading');
        })
    })
})