const SuperUser = require("../models/SuperUser")
const jwt = require ("jsonwebtoken");
const config = require("../utils/config")

async function authenticateSuperUser(req,res,next){
    try{
        const token=req.header('Authorization').replace('Bearer','');
        const decoded = jwt.verify(token,config.JWT_SECRET);
        const superUser= await SuperUser.findOne({_id:decoded._id, 'tokens.token':token});

        if(!admin)throw new Error("Please authenticate as admin");
        req.token=token;
        req.admin=superUser;
        next()
    }catch(err){
        res.status(401).send({
            error:err.message
        })
    }
}
module.exports=authenticateSuperUser;