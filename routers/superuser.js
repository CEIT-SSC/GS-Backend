const router = require("express").Router();
const SuperUser= require("../models/SuperUser");
const User = require("../models/User");

const {checkPremission}= require("../utils/utils");




// login
router.post("/login", async (req, res )=>{
    try{

        const admin = await SuperUser.findByCredentials(req.body.username, req.body.password);
        const token = await admin.generateAuthToken();
        res.send({admin , token});
    }catch(err){
        res.status(400).send({error:err.message});
    }
});

// logout secure




module.exports=router;