const router = require ("express").Router();
const QuestionAdmin =require("../models/QuestionAdmin");
const {authenticateSuperUser} =require("../middlewares/superUserAuth");
const {authenticateAdmin,
        authJustQuestionAdmin} = require("../middlewares/questionAdminAuth");
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
            // u can generate auth and redirect to me url
        await questionAdmin.save();
        res.status(201).send({questionAdmin,
            message: "question admin created successfully"});
    }catch(err){
        res.status(400).send({error:err.message});
    }
});



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


router.get("/:username",authenticateSuperUser,async (req,res)=>{
    try{
        const questionAdmin = await QuestionAdmin.findOne({
            username:req.params.username});
        if(!questionAdmin) throw new Error("Couldn't find admin");

        //send questions made by admin


        res.send(questionAdmin);
        }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
});



router.delete("/:username",authenticateSuperUser,async (req,res)=>{
    try{
        await QuestionAdmin
            .findOneAndRemove({
                username:req.params.username
            })
                .then(questionAdmin=>{
                    res.status(200).send({
                        questionAdmin,
                        message: "admin successfully deleted"
                    });
                });
    }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
});
//TODO a bug in authentication : the question admin it self should be able to update its self
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
        await questionAdmin.save();

        res.send({
            message: "question admin updated successfully"
        });

    }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
})

router.post('/login',async (req,res)=>{
    try{
        const questionAdmin = await QuestionAdmin.findByCredentials(req.body.username,req.body.password);
        const token = await questionAdmin.generateAuthToken();

        res.status(200).send({questionAdmin,token});
    }catch(err){
        res.status(400).send({
                error:err.message
            }
        )
    }
});

router.post('/me/logout', authJustQuestionAdmin, async(req , res)=>{
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
