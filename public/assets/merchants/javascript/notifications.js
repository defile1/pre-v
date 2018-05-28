$(function () {
    "use strict";

    var Notifications = function () {
        this.selectors = {
            icon : '#notifications .icon',
            panel : '.notifications.mmSideBar',
        }

        this.events = function () {
            var self = this;
            $('body')
            .on('click', '.clearAll', function(event) {
                var list = $(this).parents('.notifications').find('.list');
                list.empty();
                self.removeAll();
                self.update();
            })
            .on('click', '.message .close', function(event) {
                var list = $(this).closest('.list');
                var id = $(this).parent().data("id");

                if(list.children().length){
                    $(this).closest('.message').transition('fade');
                }


                self.remove(id);
                self.update();
            });
        }
        this.icon = function () {
            var length = (Stores.Collections.Notifications && Stores.Collections.Notifications.stack)?Stores.Collections.Notifications.stack.length : 0;
            $(this.selectors.icon).siblings('span').text(length);
        }

        this.panel = function () {
            var ul = $(this.selectors.panel).find('.list');
            if(!ul.length) throw new Error("panel not found.");
            ul.empty();
            var stack = Stores.Collections.Notifications && Stores.Collections.Notifications.stack;

            if(stack.length){
                $.each(stack, function (i, notification) {
                    var enums     = Stores.Schemas.Notifications.tree.type.enum;
                    var hasClass  = enums.includes(notification.type);
                    var typeClass = hasClass? notification.type : "";

                    var clone = $('.clone.message.simple').clone().removeClass("clone");

                    clone.addClass(typeClass);

                    clone.data('id', notification.id);
                    clone.find('.header').text(notification.title);
                    clone.find('.list').empty();

                    if( $.isPlainObject( notification.message ) ){
                        $.each(notification.message, function (i, item) {
                            var p = $('<p />').text(item.message);
                            clone.find('.list').append(p);
                        })
                    }else{
                        var p = $('<p/>').text(notification.message);
                        clone.find('.list').append(p);
                    }

                    ul.prepend(clone);
                })
            }else{
                ul.append("<span>No notifications</span>")
            }
        }

        this.removeAll = function () {
            Stores.Collections.Notifications.removeAll();
             $.ajax({
                url         : "/notifications/all",
                method      : "DELETE",
                dataType    : "json",
                contentType : "application/json; charset=utf-8",
            })
            .fail(function(){
                throw new Error("Notifications updating have failed");
            })
        }
        this.remove = function (notification) {
            var doc = Stores.Collections.Notifications.removeById( notification );

            var data = {}
            data.id = doc.id;

            $.ajax({
                url         : "/notifications/",
                method      : "DELETE",
                data        : JSON.stringify(data),
                dataType    : "json",
                contentType : "application/json; charset=utf-8",
            })
            .fail(function(){
                throw new Error("Notifications updating have failed");
            })
        }
        this.float = function (notification) {
            $(this.selectors.icon).transition('tada');
            var message = $('<div />', { class: "ui floating message notification"});
            message.text(notification.message);
            message.addClass(notification.type);

            $('body').append(message);
            setTimeout(function(){
                // message.effect( "transfer", { to: $( "#notifications" ) }, 500 );
                message.effect( "transfer", { to: $( "#notifications" ) }, 500 ).queue(function(){
                    $(this).remove();
                });

                // message.fadeOut();
            }, 2500)
        }
        this.add = function (notification) {
            Stores.Collections.Notifications.add(notification);
            if($(this.selectors.panel).parent().hasClass('noNotifications')){
                this.float(notification);
            }
            let last = Stores.Collections.Notifications.last();
            Site.Notifications.update();

            $.ajax({
                url         : "/notifications/",
                method      : "POST",
                data        : JSON.stringify(last),
                dataType    : "json",
                contentType : "application/json; charset=utf-8",
            })
            .fail(function(){
                throw new Error("Notifications updating have failed");
            })

        }
        this.title = function (argument) {
            var stack = Stores.Collections.Notifications && Stores.Collections.Notifications.stack;
            if(stack.length){
                var title     = $('head title');
                var titleText = title.text().replace(/^\(.+\)\s/gi,"");

                title.text("(" + stack.length +") " + titleText);
            }
        }
        this.update = function (argument) {
            this.icon();
            this.panel();
            this.title();
        }
        this.events();
        this.update();
    }

    Site.Notifications = new Notifications();

})


