var Render;
$(function(){
    Render = new nunjucks.Environment(new nunjucks.WebLoader('/public/static'));

    Render.addFilter('NumberFormat', function(str) {
        return new Intl.NumberFormat("en-GB").format(str);
    });
})