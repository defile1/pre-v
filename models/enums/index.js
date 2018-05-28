let Products  = require('./Products.json');
let Services  = require('./Servicer.json');
let Users     = require('./Users.json');
let Countries = require('./Countries.json');


for (product in Products){
    Products[product] = Products[product].filter?Products[product].filter((obj, key)=>{
        let isActive = obj.active !== false;
        return isActive
    }):Products[product];
}

for (service in Services){
    Services[service] = Services[service].filter?Services[service].filter((obj, key)=>{
        let isActive = obj.active !== false;
        return isActive
    }):Services[service];
}



module.exports = {
    Products,
    Services,
    Users,
    Countries,
}