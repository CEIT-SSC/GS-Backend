const router = require ("express").Router();
const QuestionAdmin =require("../models/QuestionAdmin");
const authenticateSuperUser =require("../middlewares/superUserAuth");
const authenticateAdmin = require("../middlewares/questionAdminAuth");
const logger = require("../utils/logger");

router.post('/',authenticateSuperUser,async (req,res)=>{
    try{
        if(!req.body.username ||!req.body.password){
            throw new Error("Enter username and password");
        }
        const newAdmin= new QuestionAdmin({
            username:req.body.username,
            password:req.body.password});
        const token= await newAdmin.generateAuthToken();
        //sending welcome email or sth;

        res.status(201).send({
            newAdmin,
            token
        })
    }catch(err){
        res.status(400).send({error:err.message});
    }
});


//getting all admins
//TODO: check with postman
router.get("/",authenticateAdmin,async (req,res)=>{
    try{
        const questionAdmins = await QuestionAdmin.find();
        res.send(questionAdmins);
    }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
})
//getting specific admin 
router.get("/:username",authenticateAdmin,async (req,res)=>{
    try{
        const questionAdmin = await QuestionAdmin.find({
            username:req.params.username});
        if(!questionAdmin) throw new Error("Couldn't find admin");

        //send questions made by admin


        res.send({questionAdmin});
        }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
})

//deleting admins; //TODO: test with postman
router.delete("/:username",authenticateSuperUser,async (req,res)=>{
    try{
        await QuestionAdmin
            .findOneAndRemove({username})
                .then(response=>{
                    logger.info(response)
                });
    }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
})


//admin log in ; //TODO : TEST WITH POSTMAN
router.post('/login',async (req,res)=>{
    try{
        const questionAdmin = await QuestionAdmin.findByCredentials(req.body.username,req.body.password);
        const token = questionAdmin.generateAuthToken();

        res.send({questionAdmin,token});
    }catch(err){
        res.status(400).send({
                error:err.message
            }
        )
    }
})
//admin log out; //TODO: TEST WITH POSTMAN
router.post('/me/logout', authenticateAdmin, async(req , res)=>{
    try{
        req.admin.tokens=req.admin.tokens.filter((token)=>token.token!==req.token);
        await req.admin.save();
        res.send({
            message:"logged out successfully"
        })
    }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
})
// me path

module.exports=router;
