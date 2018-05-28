$(document).ready(function(){



    // year slider
    $( ".rangeSlider" ).each(function(index, slider){
        var data = $(slider).data();
        var step = data.step;
        $(slider).slider({
            range  : true,
            min    : data.min,
            max    : data.max,
            values : data.values.split(","),
            step   : 1,
            create: function(event, ui){
                var data = $(slider).data("values").split(",");
                var isCurrency = $(this).data('currency');
                var gte = data[0];
                var lte = data[1];
                if(isCurrency) gte = Currency(gte);
                if(isCurrency) lte = Currency(lte);
                $(slider).siblings('.display').find('.gte').text(gte);
                $(slider).siblings('.display').find('.lte').text(lte);
            },
            stop: function( event, ui ) {
                $(this).siblings('.lte').change();
            },
            slide: function( event, ui ) {
                var isCurrency = $(this).data('currency');
                $(this).siblings('.gte').val(ui.values[0]).prop("checked", true);
                $(this).siblings('.lte').val(ui.values[1]).prop("checked", true);
                var gte = ui.values[0];
                var lte = ui.values[1];
                if(data.format) lte = new Intl.NumberFormat(data.format || "en-GB").format(lte);
                if(data.format) gte = new Intl.NumberFormat(data.format || "en-GB").format(gte);
                if(isCurrency) gte = Currency(gte);
                if(isCurrency) lte = Currency(lte);
                $(slider).siblings('.display').find('.gte').text(gte);
                $(slider).siblings('.display').find('.lte').text(lte);
            }
        });
    });

    $('body')
    .on('change keyup', '#searchFilter', function(event){
        if($(this).val().length)
            $(this).parents('.sidebar-search-fields').find(':checkbox').val($(this).val()).prop('checked',true);
        else
            $(this).parents('.sidebar-search-fields').find(':checkbox').val("").prop('checked',false);
    })
    .on('change keyup', '#year', function(event){
        $('#yearHidden').val($(this).val()).prop("checked", true);
    })
    .on('infinate', 'form.products', function(event){
        var form = $(this);
        var page = form.find('[name=page]')
        var data = form.serialize();

        history.pushState({}, null, "?"+data);

        $('#productsList').addClass('ui basic segment loading');
        $('#productsList').find('.no-results').remove();

        $.ajax({
            url           : "/products/",
            method        : "GET",
            data          : ( data ),
            resultsTarget : "#productsList",
            dataType      : "html",
            headers : {
                infinate : true
            }
        })
        .done(function(response){
            var products = $(response).html();
            $('#productsList').append(products);
        })
        .fail(function(){
            $('#productsList').empty().append($('<li class="watch grid-33 tablet-grid-50 mobile-grid-50">No results</li>'));
        })
        .always(function(){
            $('#productsList').removeClass('ui basic segment loading');
        });
    })
    .on('change', 'form.products', function(event){
        $('form.products').find('[name=page]').val(1);
        $('body').addClass('ui basic segment loading');
        $(this).submit();
    })

    $(window).scroll(function(){
        Site.delay(function(){
            var totals     = parseInt($('.totals').val());
            var perPage    = parseInt($('.perPage').val());
            var currPage   = parseInt($('form.products').find('[name=page]').val());
            var isLastPage = Math.ceil(totals/perPage) - currPage == 0;

            console.log(Math.ceil(totals/perPage) - currPage, isLastPage);

            if($(window).scrollTop() == $(document).height() - $(window).height() && isLastPage == false){

                $(window).scrollTop($(document).height() - $(window).height() -10)
                $('form.products').find('[name=page]').val(currPage + 1);
                $('form.products').find('.infinate').val(true);
                $('form.products').trigger('infinate');
            }
        }, 100);
    });

    Site.reloadUI('body');
});