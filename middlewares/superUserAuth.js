const SuperUser = require("../models/SuperUser")
const jwt = require ("jsonwebtoken");
const config = require("../utils/config")
async function authCheckSuperUser(req){
    try{
        const token=req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token,config.JWT_SECRET);
        const superUser= await SuperUser.findOne({_id:decoded._id, 'tokens.token':token});
        
        if(!superUser)return false;
        req.token=token;
        req.admin=superUser;
        return true;
    }catch(err){
        return false
    }
}
async function authenticateSuperUser(req,res,next){
    if(await authCheckSuperUser(req)){
        next();
    }else{
        res.status(401).send({
            error:" you don't have premission "
        });
    }
}
module.exports={
    authenticateSuperUser,
    authCheckSuperUser
};