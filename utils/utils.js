const logger = require("./logger")

async function checkPremission(admin, adminPrem,res){
    const filteredPrems=admin.premissions.filter(premission=>premission.premission===adminPrem);
    logger.info(filteredPrems);
    if(!filteredPrems.length){
        res.statue(401).send({error: "You don't have the premission dude"});
        return false;
    }else{
        return true;
    }
}