$(function () {
    var resetNames = function(){

        $('.bind [type=submit]').removeClass('disabled');
    }

    $('body')
    .on('dropzone.drop', 'form.brands', function(event){
        $(this).find('.ui.image').hide();
        $(this).find('.dz-preview.dz-image-preview').hide();
    })
    .on('submit', 'form.brands', function(event){
        myDropzone.processQueue();
    })
    .on('click', '.removeModel', function(event){
        if( $('.removeModel').length === 1) {
            $('.removeModel').hide();
            return false;
        }

        var $element = $(this);
        var models   = $element.parents('.modelsWrapper').find('.models');
        var model    = $element.parents('.model');
        var index    = model.index();

        model.remove();

        if( $('.removeModel').length === 1) {
            $('.removeModel').hide();
        }
        resetNames();
    })
    .on('click', '.addModel', function(event){
        event.preventDefault();
        $('.removeModel').show();
        var $element = $(this);
        var $form    = $element.parents("form.brands");
        var models   = $element.parents('.modelsWrapper').find('.models');
        var target   = models.children().eq(0);
        var clone    = target.clone();

        var index = models.children().length;
        models.append(clone);

        clone.find(':input').val("");

        Site.reloadUI($('form.brands'));
        clone.find('.delete').click();

        Stores.Collections.Brands.get(0).models.addToSet({});
        resetNames();
    })
    ;
});