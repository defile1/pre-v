$(document).ready(function () {

    $('body')
    .on('input', 'textarea.autogrow', function () {
        var input = this
        $(input).outerHeight(38).outerHeight($(input).get(0).scrollHeight + 20 ); // 38 or '1em' -min-height
    });
});