$(function () {
    window.do_dropzone = function(){
        if($('.dropzone').length){
            $('.dropzone').each(function(i, dz){
                var options = {
                    clickable         : true,
                    parallelUploads   : 1,
                    previewsContainer : $(dz).find('.dropzone-previews').get(0)
                };

                if($(dz).data('maxfiles')) options.maxFiles= $(dz).data('maxfiles');

                if($(dz).find('.dropzone-previews').data("autoprocessqueue") == true) {
                    options.autoProcessQueue = true;
                }else{
                    options.autoProcessQueue = false;
                }
                options.url    = "./upload/";
                options.method = "PUT";
                // options.autoProcessQueue = false;
                var d2 = function(file, dataUrl){
                    $(this.element).trigger("dropzone.success");
                    if (file.previewElement) {
                        return file.previewElement.classList.add("dz-success");
                    }
                }
                var d3 = function(file, message){
                    $(this.element).trigger("dropzone.error");
                    Site.GlobalAjaxFail({responseJSON:message}, $(this.element).parents('form'));
                    var node, _i, _len, _ref, _results;
                    if (file.previewElement) {
                      file.previewElement.classList.add("dz-error");
                      if (typeof message !== "String" && message.error) {
                        message = message.error;
                      }
                      _ref = file.previewElement.querySelectorAll("[data-dz-errormessage]");
                      _results = [];
                      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        node = _ref[_i];
                        _results.push(node.textContent = message);
                      }
                      return _results;
                    }
                }

                var d1 = function(file,dataUrl){
                    $(this.element).trigger("dropzone.drop");
                    $(this.element).find('[type=submit]').removeClass('disabled');

                    var thumbnailElement, _i, _len, _ref;
                    if (file.previewElement) {
                        file.previewElement.classList.remove("dz-file-preview");
                        _ref = file.previewElement.querySelectorAll("[data-dz-thumbnail]");
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            thumbnailElement = _ref[_i];
                            thumbnailElement.alt = file.name;
                            thumbnailElement.src = dataUrl;
                        }
                        return setTimeout(((function(_this) {
                            return function() {
                                return file.previewElement.classList.add("dz-image-preview");
                            };
                        })(this)), 1);
                    }


                }
                // options.addedfile = d;
                options.thumbnail = d1;
                options.success   = d2;
                options.error     = d3;
                var index = "";

                if(i>0){
                    index = i;
                }

                if($(dz).find('.dropzone-previews').data("url")) {
                    options.url = $(dz).find('.dropzone-previews').data("url");
                }

                window['myDropzone'+index] = new Dropzone(dz, options);
            })

        }
    }

    do_dropzone();
})