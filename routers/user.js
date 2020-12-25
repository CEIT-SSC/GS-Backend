const router = require("express").Router();
const User = require("../models/User");
const authenticateSuperUser = require("../middlewares/superUserAuth");
const logger = require("../utils/logger");
// const errorHandler= require("../middlewares/errorHandler");
//get user 
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

//get user by id 
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

//create user
//TODO handle some how so that only admin and mr hashemi could create user
router.post("/",async(req,res)=>{
    try{
        if(!req.body.studentNumber ||!req.body.password){
            throw new Error("Enter student number and password")
        }
        console.log(req.body.password);
        const user= new User({
            studentNumber: req.body.studentNumber,
            password: req.body.password
        });

        //sending welcome email or sth?
        //generating auth and redirect to me user/me page

        await user.save().then(()=>{
            logger.info("new user created");
        })
        

        res.status(201).send(user);
    }catch(error){
        res.status(500).send({
            message:error.message
        })
    }
});
//delete user
router.delete("/:studentNumber",authenticateSuperUser,async(req,res)=>{
    try{
        await User.findOneAndRemove({
            studentNumber:req.params.studentNumber
        }).then(removedUser=>{
            logger.info("user successfully removed");
            res.send({
                message:"user successfully removed",
                removedUser
            });
        });
    }catch(err){
        res.status(500).send({
            message:err.message
        });
    }
})
//patch user 
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
        })
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

//logoutroutes  
module.exports=router;