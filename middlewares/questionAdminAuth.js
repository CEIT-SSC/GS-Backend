const QuestionAdmin = require("../models/QuestionAdmin");
const SuperUser = require("../models/SuperUser");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");
async function authenticateAdmin( req, res, next){
    try{
        const token=req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token,config.JWT_SECRET);
        const superUser= await SuperUser.findOne({_id:decoded._id, 'tokens.token':token});
        const questionAdmin = await QuestionAdmin.findOne({ _id: decoded._id, 'tokens.token': token });

        if(!superUser && !questionAdmin )throw new Error("You don't have the premission");
        req.token=token;
        req.admin=superUser?superUser:questionAdmin;
        next()
    }catch(err){
        res.status(401).send({
            error:err.message
        })
    }
};
module.exports = authenticateAdmin;