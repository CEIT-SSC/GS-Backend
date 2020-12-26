const router = require("express").Router();
const User = require("../models/User");
const {authenticateSuperUser} = require("../middlewares/superUserAuth");
const logger = require("../utils/logger");

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

router.post("/",async(req,res)=>{
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
        
        const token = user.generateAuthToken();
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
                removedUser
            });
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