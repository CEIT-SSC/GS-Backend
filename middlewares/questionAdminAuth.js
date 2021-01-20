const QuestionAdmin = require("../models/QuestionAdmin");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");
const {authCheckSuperUser} = require ("../middlewares/superUserAuth");

async function authenticateAdmin( req, res, next){
    if(await authCheckSuperUser(req) || await authCheckQuestionAdmin (req)){
        next();
    }else{
        res.status(401).send({
            error:"You don't have the premission"
        })
    }
};
async function authCheckQuestionAdmin(req){
    try{
        const token=req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token,config.JWT_SECRET);
        const questionAdmin = await QuestionAdmin.findOne({ _id: decoded._id, 'tokens.token': token });

        if(!questionAdmin )return false;
        req.token=token;
        req.admin=questionAdmin;
        return true;
    }catch(err){
        return false;
    }
}
async function authJustQuestionAdmin( req, res, next){
    if(!(await authCheckSuperUser (req ))&& await authCheckQuestionAdmin(req)){
        next();
    }else{
        res.status(401).send({
            error:"You don't have the premission"
        });
    }
}
module.exports = {
    authenticateAdmin,
    authCheckQuestionAdmin,
    authJustQuestionAdmin
};