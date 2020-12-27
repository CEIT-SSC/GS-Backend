const User = require ("../models/User");
const config = require("../utils/config");
const jwt = require ("jsonwebtoken");


async function authCheckUser (req){
    try{
        const token=req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token,config.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if(!user)return false;;
        req.token=token;
        req.user=user;
        return true;
    }catch(err){
        return false;
    }
}

async function authenticateUser(req,res,next){

    if(await authCheckUser(req)){
        next();
    }else{
        res.status(401).send({
            error:"user couldn't be authenticated"
        });
    }
}

module.exports={
    authCheckUser,
    authenticateUser
}