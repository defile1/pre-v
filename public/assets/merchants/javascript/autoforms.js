$(document).ready(function () {
    var pathJoin = Site.pathJoin;
    $('body')
    .on('autoform.validate', '.bind',function(event, options){
        var bindder     = $(event.target).hasClass('bind')? $(event.target) : $(event.target).parents('.bind');
        var options     = options || {};

        var doc = bindder.data("doc");
        console.log(bindder, doc, event)
        try{
            doc
            .validate(function(error){
                if(error){
                    bindder.find('[type=submit]').addClass("disabled");
                    if(options.notifications){
                        $.each(error.errors, function (index, item) {
                            try{
                                var input = $('[name='+item.path+']');

                                input.closest('.field').addClass('error');

                            }catch(e){}
                            Site.Notifications.add({title: "Error:", message: item.message, type :"error"})
                        });
                    }

                    if(options.fail) options.fail.call(bindder);
                }else{
                    if(doc.isModified()) bindder.find('[type=submit]').removeClass("disabled");
                    if(options.success) options.success.call(bindder);
                }
            });
        }catch(e){
            debugger
        }
    })
    .on('submit', '.bind',function(event){
        event.preventDefault();

        var bindder     = $(this);
        var bindderName = bindder.attr('name');
        var doc         = bindder.data('doc');
        var url         = bindder.prop("action");
        var method      = (bindder.attr("method")+"").toUpperCase();
        var schema      = bindder.attr("schema") || bindderName;

        bindder.find('[type=submit]').addClass('disabled')

        if(!bindderName) throw new Error("bindderName is missing");
        if(!jsonpath.value(Stores.Schemas, schema)) throw "Schema: `"+ schema +"` is missing";

        if ( doc.isModified() === false ) return false;

        var success = function(){
            $.ajax({
                url         : url,
                method      : method,
                data        : JSON.stringify(doc.toJSON()),
                dataType    : "json",
                contentType : "application/json; charset=utf-8",
            })
            .done(function (response) {
                if(!response["id"]){
                    console.warn("Response `id` is missing. Dev: this is product id.");
                }

                Site.Notifications.add({title: "Success:", message: response.message || "Successfully updated.", type :"success"})
                bindder.trigger("autoform.done",[response]);

                window.history.pushState(null,null, window.location.href.replace("/new/", "/"+response.id+"/"));
                doc.set("id", response.id);
            })
            .fail(function(error){
                bindder.trigger("autoform.fail",[error]);
                Site.GlobalAjaxFail(arguments[0]);
            })
            .always(function (response) {
                bindder.find('[type=submit]').addClass('disabled');
                bindder.trigger("autoform.always");
            });
        }
        bindder.trigger("autoform.validate", {
            notifications : true,
            success       : success,
        });
    })
    .on('change bind.change', '.bind', function (event, skipper) {

        if(skipper == "skip" || ( event.type != "bind" && event.eventPhase === void 0) ) {
            return true;
        }

        var bindder    = $(event.target).hasClass('bind')?$(event.target): $(event.target).parents('.bind');
        var bindderName = bindder.attr('name');
        var bindderPath = bindder.attr('path');
        var formSchema = bindder.prop("schema") || bindder.prop("name");
        var $element   = $(event.target);
        var transform  = $element.attr("transform");
        var value      = $element.val();
        var tempname   = $element.prop("name");
        var name       = pathJoin($element);

        var doc = Stores.Collections[bindderName].get(bindderPath);

        bindder.find('[type=submit]').addClass("disabled");
        $element.closest('.field').removeClass("error");

        if(!tempname) return true;

        switch(transform){
            case "label":
                break
            case "boolean":
                value = $element.is(':checked');
                break;
            case "rating":
                var rating = $element.siblings('.ui.rating');
                if(!rating) throw "rating is required.";
                if(!skipper) rating.rating('set rating', value);
                break;
            case "comma":
            case "tags":
                value = $.map(value.split(","), $.trim);
                break;
        }

        if($element.attr("label")){
            switch($element.attr("label")){
                case "text":
                    $element.text(value);
                    break;
                default:
                    throw "dont know what to do."
                    $element.text()
                    break;
            }
        }

        doc.set(name, value);
        doc.updatedAt = new Date();

        // doc.markModified(true);
        $element.trigger("autoform.change", [doc]);
        bindder.trigger("autoform.validate");


    })
    .on('init', '.bind', function (event, once) {
        var bindder     = $(event.target).hasClass('bind')? $(event.target) : $(event.target).parents('.bind');
        var bindderName = bindder.attr('name');
        var bindderPath = bindder.attr('path');

        var elements = bindder.find('[name]').filter(function(i, input){ return $(input).parents(".ignore").length == 0; });
        var doc = Stores.Collections[bindderName].get(bindderPath);
        bindder.data('doc', doc);
        $.each(elements, function (e, element) {
            var $element  = $(element);
            var transform = $element.attr("transform");
            var name      = $element.prop("name");

            if(!name) return true;

            var name     = pathJoin($element);
            var jp       = doc.get(name);

            switch(transform){
                case "date":

                    break;
                case "boolean":
                    $element.prop("checked", jp);
                    break;
                case "rating":
                    var rating = $element.siblings('.ui.rating');
                    if(!rating) throw "rating is required.";
                    rating.rating('set rating', jp);
                    rating.data('rating', jp);
                    rating.attr('data-rating', jp);
                    break;
                case "selects":
                    var text =  $element.siblings('.menu')
                                .children()
                                .removeClass("active selected")
                                .filter(function(){
                                    return $(this).data('value')===jp
                                })
                                // .eq(0)
                                .addClass('active selected')
                    $element.siblings('.text')
                    .removeClass("default")
                    .text(text.text());
                    break;
                case "tags":
                    var menu = $element.siblings('.menu');

                    menu.children().not("[data-value='']").remove();

                    $.each(jp, function (index, item) {
                        var option = $('<div/>')
                        option.addClass("item");
                        option.data("value", item);
                        option.attr("data-value", item);
                        option.text(item);
                        menu.append(option);

                    });

                    break;
            }

            var skip = "skip";

            $element.val(jp);
            Site.reloadUI($('.bind'));
            // $element.trigger("autoform.init",[doc]);
        });

        bindder.trigger("autoform.init");
        bindder.find('[type=submit]').addClass('disabled');
        // bindder.trigger("autoform.validate");
        bindder.data('doc', doc);
    })
    .on('autoform.init autoform.change', '.bind :input,.bind [name],.bind', function(event){
        // event.stopPropagation();
        // event.stopImmediatePropagation();
    })
    .on('click', '.delete[method=delete][name]', function (event) {
        var $element    = $(this);
        var defaultBind = $element.attr('bind') ? $($element.attr('bind')) : $('.bind');
        var bindder     = $element.closest('.bind').length?$element.closest('.bind') : defaultBind;
        var doc         = bindder.data("doc");
        var name        = pathJoin($element);

        $element.val(true);
        doc.set(name, true);

        $element.trigger("autoform.change");
        bindder.find('[type=submit]').removeClass("disabled");
    })
    .on('click', '.control-boolean', function (event) {
        var $element = $(this);
        var $input   = $element.children("input");
        var checked  = $input.prop("checked");
        $input.val(checked);
    })
});