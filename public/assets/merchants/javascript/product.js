$(function () {
    var doSortable = function(){
        var placeholder = $('.tinyImages').eq(0).attr('class') || "ui left centered image bordered tinyImages ui-sortable-handle small"
        $('.rightSegment').sortable({forcePlaceholderSize : true,  forceHelperSize: true, handle: ".ui.label.moveImage"});
    }
    doSortable();
    var do_references =  function (event) {
        event.preventDefault();
        var val = $(".brands").val();
        var models = [];
        $.each(Stores.Collections.Brands.find({id: val}), function (i, brand) {
            if(brand.id === val){
                models = brand.models
                return false;
            }
        });

        $('.reference').empty().append($('<option />',{value: "", text: "Please select"}));
        var modelValue = $('.models').val();
        $.each(models, function (i, model) {
            if(model.name === modelValue){
                $.each(model.references.split(","), function (i, reference) {
                    var reference = reference
                    var option = $('<option />',{value: reference, text: reference});
                    $('.reference').append(option);
                });

                return false;
            }
        })
    }
    var do_models = function (event) {
        event.preventDefault();
        var val    = $(".brands").val();
        var models = [];
        $.each(Stores.Collections.Brands.find({id: val}), function (i, brand) {
            if(brand.id === val){
                models = brand.models
                return false;
            }
        });

        $('.models').empty().append($('<option />',{value: "", text: "Please select"}));
        $('.reference').empty().append($('<option />',{value: "", text: "Please select"}));

        $.each(models, function (i, model) {
            var name   = model.name;
            var option = $('<option />',{value: name, text: name});
            $('.models').append(option);
        })
    }

    $('body')
    .on('dropzone.success', '.dropzone', function(){
        $('.ui.image.tinyImages').find('a.deleteImage').hide();
        $('.ui.image.tinyImages').find('a.moveImage').hide();
        $('.ui.image.tinyImages').find('input[type=hidden]').remove();

        $('.image-segment').addClass('loading');

        $.ajax({
            url : "images",
            resultsTarget: '.image-segment'
        })
        .done(function (response) {
            $('.image-segment')
            .empty()
            .append(response)
        })
        .fail(function(){
            $(this)
        })
        .always(function (event) {
            var segment = $('.image-segment').removeClass('loading');
            var text = segment.find('.manageImages').text();
            if(segment.hasClass('largeSegment')) {
                segment.find('.ui.label').toggleClass('hidden');
                var toggleText = "Done";
                segment.find('.manageImages').text(toggleText).addClass('primary')

                // segment.siblings().not('.updateSegment').stop(true,true).slideToggle(500);
                segment.parent().removeClass('wide');
                segment.parent().removeClass('five');
                segment.parent().addClass('sixteen');
                segment.parent().addClass('wide');
                // segment.parent().siblings().stop(true,true).slideToggle(500);
                segment.find('.tinyImages').removeClass('tiny small');
                segment.find('.tinyImages').addClass('small');
                segment.find('.theImageSegments').addClass('horizontal segments');
            }
            doSortable();
        })
    })
    .on('ajax.done', 'form.ajax', function(){
        $('.tinyImages.disabled').remove();
    })
    .on('click', '.deleteProduct', function(){
        $('input.deleteProductInput').val(true);
        $('form.ajax.productForm').trigger('submit');
        $('form.ajax.productForm').on('ajax.done', function(){
            window.location.href = "../";
        })
    })
    .on('click', '.deleteImage', function(){
        var val = $(this).siblings('input.deleteImageInput').val() == "true";
        $(this).siblings('input.deleteImageInput').val(!val);
        $(this).parent().toggleClass('disabled').remove();
    })
    .on('click', '.manageImages', function(){
        var toggleText = $(this).text().toLowerCase() == "manage"? "Done" : "Manage";
        $(this).text(toggleText).toggleClass('primary')
        var segment = $(this).closest('.ui.segment');
        segment.toggleClass('largeSegment');
        segment.find('.ui.label').toggleClass('hidden');
        segment.siblings().not('.updateSegment').stop(true,true).slideToggle(500);
        segment.parent().removeClass('wide');
        segment.parent().toggleClass('five sixteen');
        segment.parent().addClass('wide');
        segment.parent().siblings().stop(true,true).slideToggle(500);
        segment.find('.tinyImages').toggleClass('tiny small');
        segment.find('.theImageSegments').toggleClass('horizontal segments');
    })
    .on('click', '.ui.image.tinyImages', function(){
        var src = $(this).find('img').attr("src");
        $('.ui.image.mainImage').find('img').attr("src",src);
    })
    .on('change', '.brands', do_models)
    .on('change', '.models', do_references)
    .on('change init', '.status input', function(){
        var status = $(this).val().toLowerCase();
        var colour = "grey"
        switch(status){
            case "published":
                colour = "green"
                break;
            case "draft":
                colour = "red"
                break;
            default:
                colour = "grey"
                break;
        }

        $(this).closest(".ui.segment")
        .removeClass('grey red green')
        .addClass(colour);
    })
    .on('click', '.poa', function(){
        var checked = $(this).find('input[type=checkbox]').is(':checked');
        if(checked){
            $('.price input').val(0);
            $('.price').slideUp();
        }else{
            $('.price').slideDown();
        }
    })
    ;

    $('.brands').change();
    $('.models').change();
    $('.status input').trigger('init');
});