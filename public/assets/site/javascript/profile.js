$(function () {
    var todayYear = new Date().getFullYear();
    $('#dob').datepicker({
        dateFormat: "dd/mm/yy",
        changeMonth: true,
        changeYear: true,
        yearRange: "1900:"+todayYear
    });
    $('body')
    .on('validation.success ajax.done', 'form.ajax.profile', function(event){
        $('.completeProfile').slideUp(function(){$(this).remove();});
    })
    .on('dropzone.drop', '.dropzone', function(event){
        $(this).find('.user.icon').hide();
        $(this).find('.dz-default.dz-message').remove();
    })
})