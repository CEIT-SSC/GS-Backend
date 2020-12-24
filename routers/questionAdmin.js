const router = require ("express").Router()
const QuestionAdmin =require("../models/QuestionAdmin");
const authenticateSuperUser =require("../middlewares/superUserAuth");


router.post('/',authenticateSuperUser,async (req,res)=>{
    try{
        if(!req.body.username ||!req.body.password){
            throw new Error("Enter username and password");
        }
        const newAdmin= new QuestionAdmin(req.body.username,req.body.password);
        
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

//deleting admins;

//updating admin;

//admin log in ;

//admin log out;


module.exports=router;
