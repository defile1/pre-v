$(function () {
    function Collections(){
    }
    Collections.prototype.value = function(str){
        return jsonpath.value(this.stack);
    }
    function Collection(name, doc){
        this.stack = [];
        this.name = name;
        if(doc) {
            this.add(doc);
        }
    }
    Collection.prototype.last = function(doc){
        return this.stack[this.stack.length-1];
    }
    Collection.prototype.add = function(doc){
        if(!doc || !doc.schema){
            doc = new mongoose.Document(doc||{} , Stores.Schemas[this.name])
        }

        this.stack.push(doc)
    }
    Collection.prototype.get = function(index){
        return this.stack[index];
    }
    Collection.prototype.value = function(str){
        return jsonpath.value(this.stack)
    }
    Collection.prototype.removeAll = function(){
        this.stack = [];
    }
    Collection.prototype.removeById = function(id){
        var self = this;
        let out = {};

        self.stack.forEach(function(item, index, all){
            if(item.id === id){
                var last = self.stack.splice(index, 1);
                out = last[0];
                return false;
            }
        })

        return out;
    }
    Collection.prototype.find = function(queries){
        return this.stack.filter(function(doc){
            var out = false;
            $.each(queries, function(i, query){
                out = doc[i] == query
            })
            return out;
        })
    }
    if(!window['Stores']){
        Stores = {
                Descriptors : {},
                Schemas     : {},
                Collections : new Collections,
                Data        : {},
            }
    }
    $.each(Stores.Descriptors, function(name, descriptor){
        var options = {
            validateBeforeSave : true,
            timestamps         : true,
        }
        var schema;
        schema = Stores.Schemas[name]     =  new mongoose.Schema(descriptor, options);
        var dbg = function(doc) {
            var paths = doc.modifiedPaths();

            if(paths.length){
                $.each(paths, function(i, path){
                    var element = $('[name="'+path+'"]');
                    var what = element.attr("transform");

                    if(what == "text"){
                        // todo: fix this part for labels
                        // element.text(doc.get(path));
                    }

                })
            }
        }

        // schema.post('update', dbg);
        // schema.post('init', dbg);
        // schema.post('validate', dbg);
    });

    $.each(Stores.Data, function(name, doc){
        if(!doc.data || doc.data.constructor.name !== "Array") throw new Error("Wrong object found")

        Stores.Collections[name] = new Collection(doc.schemaName);
        // new Collections( newitem );

        for(index in Stores.Data[name].data){
            let item = Stores.Data[name].data[index];
            isNew = Object.keys(item).length == 0;
            let fields = {
                validateBeforeSave  : false,
                timestamps          : true,
                strictMode          : false,
                setDefaultsOnInsert : true
            }

            // console.log(item , Stores.Schemas[doc.schemaName], fields)
            if(!Stores.Schemas[doc.schemaName]) throw new Error("doc.schemaName: is missing for " + doc.schemaName);

            var newitem = new mongoose.Document(item , Stores.Schemas[doc.schemaName], fields);

            if(isNew){
                newitem.isNew = true;
            }
            Stores.Collections[name].add(newitem);
        }
    });

})