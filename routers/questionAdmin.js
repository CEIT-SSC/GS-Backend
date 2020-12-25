const router = require ("express").Router();
const QuestionAdmin =require("../models/QuestionAdmin");
const authenticateSuperUser =require("../middlewares/superUserAuth");
const authenticateAdmin = require("../middlewares/questionAdminAuth");
const logger = require("../utils/logger");
/**
 * creates new questionAdmin and can be done only by superuser
 * takes its parameters in json format
 * @param {String} username the username of question admin
 * @param {String} password the password of question admin
 * notice that weak and too short password can cause error
 */
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
/**
 * gets all the admins and can be done only by super user
 * @return {JSON} json file containing list of admins
 */
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

/**
 * gets specific question admin 
 * can be done only by super user
 * takes its parameter in url as username parameter
 * @return {JSON} returns question admin in json
 */
router.get("/:username",authenticateSuperUser,async (req,res)=>{
    try{
        const questionAdmin = await QuestionAdmin.find({
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

/**
 * deletes specified question admin 
 * can be done only by super user
 * takes its parameter in url named username
 * @return {JSON} json presentation of deleted admin
 */
router.delete("/:username",authenticateSuperUser,async (req,res)=>{
    try{
        await QuestionAdmin
            .findOneAndRemove({
                username:req.params.username
            })
                .then(questionAdmin=>{
                    logger.info("question admin successfully removed")
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
/**
 * patch and updates specified question admin
 * can be done only by super user
 * takes username parameter in url to find the question admin 
 * and takes other paramters which should be updated in json body which 
 * can be username and password
 * @return {JSON} the updated question admin
 */
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

/**
 * log in and can be done by anyone
 * @param {String} username 
 * @param {String} password
 * takes parameter using json body
 * @return {JSON} representing question admin and token generated
 */
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
/**
 * logs out and can be done only by question admin
 * removes the token and send success message
 */
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
