


module.exports = function(req, res, next){
    let method = `${req.method}         `.slice(0, 10)
    // console.info(method, req.url)
    next()
}