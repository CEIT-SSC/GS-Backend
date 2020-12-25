const router = require("express").Router();
const User = require("../models/User");
const authenticateSuperUser = require("../middlewares/superUserAuth");
const logger = require("../utils/logger");

//get user //TODO test with postman
router.get("/",authenticateSuperUser,async(req,res)=>{
    try{
        const users = await User.find({});
        res.send(users);
    }catch(error){
        next(error);
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
        next(error);
    }
});

//create user

//delete user

//patch user 
