const router = require("express").Router();
const User = require("../models/User");
const {authenticateSuperUser} = require("../middlewares/superUserAuth");
const logger = require("../utils/logger");
const { authenticateAdmin } = require("../middlewares/questionAdminAuth");
const { authenticateUser } = require("../middlewares/userAuth");
const { runScript , saveTestCase } = require ("../utils/utils");
const Question = require("../models/Question");

router.get("/",authenticateSuperUser,async(req,res)=>{
    try{
        const users = await User.find({});
        res.send(users);
    }catch(error){
        res.status(500).send({
            message:error.message
        })
    }
});

router.get("/:studentNumber",authenticateSuperUser,async(req,res)=>{
    try{
        const user = await User.findOne({
            studentNumber:req.params.studentNumber
        });
        if(!user) throw new Error("couldn't find user with entered student number");
        res.send(user);
    }catch(error) {
        res.status(500).send({
            message:error.message
        })
    }
});

router.post("/",authenticateAdmin,async(req,res)=>{
    try{
        if(!req.body.studentNumber ||!req.body.password){
            throw new Error("Enter student number and password")
        }
        const user= new User({
            studentNumber: req.body.studentNumber,
            password: req.body.password
        });

        //sending welcome email or sth?
        //generating auth and redirect to me user/me page
        
        await user.save().then(()=>{
            logger.info("new user created");
        })
        
        const token = await user.generateAuthToken();
        if(!token) throw new Error("token couldn't be generated");
        res.status(201).send({user,token});
    }catch(error){
        res.status(500).send({
            message:error.message
        })
    }
});


router.delete("/:studentNumber",authenticateSuperUser,async(req,res)=>{
    try{
        await User.findOneAndRemove({
            studentNumber:req.params.studentNumber
        }).then(removedUser=>{
            logger.info("user successfully removed");
            res.send({
                removedUser,
                message:"user successfully removed"});
        });
    }catch(err){
        res.status(500).send({
            message:err.message
        });
    }
})


router.patch("/:studentNumber",authenticateSuperUser,async(req,res)=>{
    try{
        const user = await User.findOne({
            studentNumber:req.params.studentNumber
        })
        if(!user){
            res.status(404).send({
                message:"couldn't find user with entered student number"
            });
            return;
        }
        Object.keys(req.body).forEach((fieldToUpdate)=>{
            user[fieldToUpdate] = req.body[fieldToUpdate];
        });
        await user.save().then(()=>{
            logger.info("user updated successfully")
        })
        res.send(user);
    }catch(err){
        res.status(500).send({
            message:err.message,
            result:"unable to patch user"
        })
    }
});
//login 
router.post("/login",async(req,res)=>{
    try{
        if(!req.body.studentNumber || !req.body.password) throw new Error("You should complete all fields");
        const user = await User.findByCredentials(req.body.studentNumber,req.body.password);
        const token = await user.generateAuthToken();

        res.status(200).send({user,token});
    }catch(err){
        logger.error(err);
        res.status(400).send({
                error:err.message
            }
        )
    }
});

//logoutroutes  
router.post("/me/logout",authenticateUser, async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>token.token!==req.token);
        await req.user.save();
        res.send({
            message:"logged out successfully"
        })
    }catch(err){
        res.status(500).send({
            error:err.message
        });
    }
});

router.post("/me/changepass",authenticateUser,async (req,res)=>{
    try{
        const user= req.user;
        user.password = req.body.password;
        await user.save();
        res.send({user,
            message: "password updated successfully"
        })
    }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
});

router.get("/me/getquestion/", authenticateUser, async(req,res)=>{
    try{
        const questions= await Question.find({
            forDate: {
                $lte: new Date()
            }
        })
        .sort({forDate:'descending'}).then(questions=>{
            for(const question of questions){
                question.set('state','notTouched',{strict:false});
                for( let code of req.user.codes){
                    if (String(code.forQuestion) === String(question._id)){
                        question.set('state','finished',{strict:false});
                    }
                }
            }
            return questions;
        });

        res.status(200).send(questions);
    }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
});
router.get("/me/getquestion/:id", authenticateUser,async (req,res)=>{
    try{
        const question = await Question.findOne({
            _id:req.params.id
        });
        if( ! question ) throw new Error(" couldn't find question with entered id");


        const user = req.user;
        const savedTestCase = user.testCases.find(obj => obj.forQuestion == req.params.id);
        if(savedTestCase){
            res.status(200).send({
                question,
                testCases: saveTestCase.input
            });

        }else{

            const studentNumber = user.studentNumber;
            const testGeneratorPath = question.testGeneratorPath;
            const answerPath = question.answerPath;
            const generatedTestCase = await runScript(testGeneratorPath,studentNumber);
            const excpectedAnswer = await runScript(answerPath, studentNumber); // NOT SURE
            if (!generatedTestCase) throw new Error ("couldn't create test case");
            user.testCases = user.testCases.concat({
                forQuestion: req.params.id,
                input: generatedTestCase,
                // the output should be changed
                correctOutput: excpectedAnswer
            });
            await user.save();
    
            // await saveTestCase(req.params.id,generatedTestCase); //QUSTION ? IS IT NEEDED??
    
            res.status(200).send({
                question,
                testCases: generatedTestCase
            });
        }


    }catch(err){
        logger.error(err);
        res.send({
            error :err
        })
    }
})
module.exports=router;