const router = require ("express").Router()
const QuestionAdmin =require("../models/QuestionAdmin");
const authenticateSuperUser =require("../middlewares/superUserAuth");
const authenticateAdmin = require("../middlewares/questionAdminAuth");

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
router.get("/:id",authenticateAdmin,async (req,res)=>{
    try{
        const questionAdmin = await QuestionAdmin.find(req.params.id);
        if(!questionAdmin) throw new Error("Couldn't find admin");
        res.send({questionAdmin});
        }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
})
//deleting admins;

//updating admin;

//admin log in ;

//admin log out;
 // me path

module.exports=router;
