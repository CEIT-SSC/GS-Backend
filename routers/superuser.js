const router = require("express").Router();
const SuperUser= require("../models/SuperUser");
const authenticateSuperUser= require("../middlewares/superUserAuth");




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
router.post("/logout",authenticateSuperUser,async (req,res)=>{
    try{
        req.admin.tokens= req.admin.tokens.filter((token)=>token.token!==req.token);
        await req.admin.save();
        res.send({
            message:"successfully logged out"
        }); 
    }catch(error){
        res.status(500).send();
    }
});



module.exports=router;