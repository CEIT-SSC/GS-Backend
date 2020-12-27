const router = require ("express").Router();
const Question = require ("../models/Question");
const {authenticateAdmin } = require("../middlewares/questionAdminAuth");
const { 
    uploadTestCase,
    generateId,
    generateDir } = require ("../middlewares/upload")
const uploadFields=[
    {name:'answercase'},
    {name:'testGenerator'}
]
//create question
router.post("/", authenticateAdmin , generateId ,generateDir ,uploadTestCase.fields(uploadFields) , async (req,res)=>{
    try{
        console.log(req.files)
        if(!req.body.name || !req.body.body){
            throw new Error("please complete all fields");
        }   
        console.log(JSON.stringify(req.body))
        const question= new Question({
            _id:req.objectId,
            forDate:new Date(),
            name: req.body.name,
            body: req.body.body,
            examples: req.body.examples,
            testGeneratorPath: req.files.testGenerator.path,
            answerPath: req.files.answer[0].path
        })

        await question.save().then(()=>{
            logger.info("question saved successfully");
        })

        res.status(201).send({question});
    }catch(err){
        res.status(400).send({error:err.message});
    }

});
//get questions

//get specific question

//update question

//delete question

//submit questioin

//user login

//user me 

//user logout
module.exports=router;