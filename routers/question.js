const router = require ("express").Router();
const Question = require ("../models/Question");
const {authenticateAdmin } = require("../middlewares/questionAdminAuth");
const { uploadTestCase } = require ("../middlewares/upload")

//create question
router.post("/", authenticateAdmin , uploadTestCase , async (req,res)=>{
    
})
//get questions

//get specific question

//update question

//delete question

//submit questioin

//user login

//user me 

//user logout
module.exports=router;