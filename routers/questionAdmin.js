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
        const questionAdmin= new QuestionAdmin({
            username:req.body.username,
            password:req.body.password});
        //sending welcome email or sth;

        await questionAdmin.save().then(()=>{
            logger.info("new question admin created")
        }).catch(err=>{
            throw new Error("a question admin with this username already exists.");
        })
        res.status(201).send(questionAdmin);
    }catch(err){
        res.status(400).send({error:err.message});
    }
});


//getting all admins
router.get("/",authenticateSuperUser,async (req,res)=>{
    try{
        const questionAdmins = await QuestionAdmin.find();
        res.send(questionAdmins);
    }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
});

//getting specific admin 
router.get("/:username",authenticateSuperUser,async (req,res)=>{
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
});

//deleting admins; 
router.delete("/:username",authenticateSuperUser,async (req,res)=>{
    try{
        await QuestionAdmin
            .findOneAndRemove({
                username:req.params.username
            })
                .then(questionAdmin=>{
                    logger.info("response")
                    res.send({
                        questionAdmin,
                        message:"successfully removed"
                    })
                });
    }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
});

router.patch("/:username", authenticateSuperUser,async(req,res)=>{
    try{
        const questionAdmin= await QuestionAdmin.findOne({
            username:req.params.username
        });
        if(!questionAdmin){
            res.status(404).send({
                message:"couldn't find admin with entered username"
            });
            return;
        }

        Object.keys(req.body).forEach((fieldToUpdate)=>{
            questionAdmin[fieldToUpdate] = req.body[fieldToUpdate];
        })
        await questionAdmin.save().then(()=>{
            logger.info("updated successfully")
        })

        res.send(questionAdmin);

    }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
})

//admin log in ; 
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
});
//admin log out; 
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
