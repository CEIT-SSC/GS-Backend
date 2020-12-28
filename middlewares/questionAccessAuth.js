const {authCheckUser} = require("./userAuth");
const {authCheckSuperUser} = require("./superUserAuth");
const {authCheckQuestionAdmin} = require ("./questionAdminAuth");


async function authGetAccess(req,res,next){
    if(await authCheckUser(req) || 
        await authCheckQuestionAdmin(req) || 
            await authCheckSuperUser (req)){
                next();
            }else{
                res.status(401).send({
                    error:"You don't have the premission"
                });
            }
}

module.exports ={
    authGetAccess
}