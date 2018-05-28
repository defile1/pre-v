var Site = {}
Site.events={}
Site.events.rating={}

Site.delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();
Site.noPhoto = "/public/images/photo_not_available.jpg";
Site.reloadUI = function (target) {
    if(!target) {
        console.warn("Please provide, $.ajax({`resultsTarget: '#selector'})` for ajax request");
    }else{
        $(target).find('.ui.rating').each(function(index, rating){
            var interactive = $(rating).data('interactive') == "true" || $(rating).data('interactive') == void 0;
            $(rating).rating({ onRate: Site.events.rating.onRate,fireOnInit:false, interactive: interactive });
        })
        $(target).find('.ui.checkbox').checkbox({
            onChange: function(){
                var checked = $(this).is(':checked');
                $(this).siblings('input[type=hidden]').val(checked);
            }
        });
        $(target).find('.ui.selection.dropdown').each(function(i, dropdown){
            var addition = $(dropdown).hasClass("addition") || $(dropdown).parent().hasClass("addition");

            $(dropdown).dropdown({
                hideAdditions: false,
                allowAdditions: addition,
                allowReselection: true
            });
        })

    $('textarea.autogrow').trigger('input');

    $('.ui.countries.dropdown.multiple').dropdown({maxSelections: 3 })
    $('.ui.countries.dropdown').not('.multiple').dropdown({})

    $('.combo.dropdown').dropdown({action: 'combo'});
    // $(target).find('.ui.sidebar').sidebar({dimPage: false, closable: false, exclusive: false, context: $('#layout .bottom.segment') });
    // setTimeout(function(){
        $(target).find('.form.bind').trigger('init');
    // }, 100);
    }
}

Site.pathJoin = function ($element) {
    var pathFinder = $element.parents("[path]").not('.bind');
    var paths      = [];
    var form       = $element.parents('.bind').add($element).filter('.bind');
    var formPath   = form.attr("path");
    var collection = form.attr("name");
    var isElement  = $element.filter('.bind').length == 0

    if(!isElement){
        paths.push(collection);
        paths.push(formPath);
    }else{
        pathFinder.each(function (i, item) {//find all elements with [path] attribute
            paths.push($(item).attr('path'));
        });
        paths.push($element.attr("name"));
    }

    var str = "";
    $.each(paths, function (index, item) {
        if(item){
            str += (item.charAt(0) !== "[" && index > 0 ? "." : "" ) + item
        }
    })
    return str;
}


Site.events.rating.onRate=function (event) {

    var value = $(this).rating('get rating');
    var input = $(this).siblings('input');

    if(!input.length) throw "Input is a must for ratings.";

    input.val(value)
    if(typeof event == "number") input.trigger('bind.change', event);
}
Site.GlobalAjaxError = function(response, $form){
    var message     = (response && response.responseJSON && response.responseJSON.error) || "Unexpected error.";
    var validations = (response && response.responseJSON && response.responseJSON.validation) || null;
    if(Site && Site.Notifications && Site.Notifications.add) Site.Notifications.add({title: "Error:", message: message, type: "error"});

    if(!$form) console.warn("$form is not set for ajax, please investigate.");

    if(validations){
        $.each(validations, function(index, validation){
            var key = validation.path.replace(/\./g,'][');
            var name = '[name="'+response.responseJSON.prefix+'['+key+']"]'
            var input = $form.find(':input').filter(name);
            input.closest('.field').addClass('error');
        });
        $form.trigger('validation.error');
    }else{
        $form.trigger('validation.success');
    }
}
Site.GlobalAjaxFail = Site.GlobalAjaxError;








