const router = require("express").Router();
const User = require("../models/User");
const authenticateSuperUser = require("../middlewares/superUserAuth");
const logger = require("../utils/logger");
// const errorHandler= require("../middlewares/errorHandler");
//get user //TODO test with postman
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

//get user by id //TODO test with postman
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
})
//delete user

//patch user 


module.exports=router;