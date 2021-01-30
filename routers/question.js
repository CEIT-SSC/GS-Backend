const router = require ("express").Router();
const Question = require ("../models/Question");
const del = require("del");
const logger = require("../utils/logger");
const process = require ("process");
const {authenticateAdmin } = require("../middlewares/questionAdminAuth");
const {authGetAccess} = require ("../middlewares/questionAccessAuth");
const {authenticateUser} = require("../middlewares/userAuth");
const { uploadTestCase,
      generateIdAndDir,
      submittion,
        patchHandler} = require ("../middlewares/upload");
const {runScript} = require("../utils/utils");
// const {authGetAccess} = require ("../middlewares/questionAccessAuth");
// const { authenticateUser } = require("../middlewares/userAuth");
const { readOutput ,
        saveFile } = require("../utils/utils");

const fieldstoUpload=[
    {name:'answer', maxCount:1},
    {name:'testGenerator', maxCount:1}
]

const removeDir=async (id,folder)=>{
    const dir= `./data/${folder}/${id}`;
    try {
        await del(dir);

        logger.info(`${dir} is deleted!`);
    } catch (err) {
        logger.error(`Error while deleting ${dir}.`);
    }
}

//create question
router.post("/", authenticateAdmin , generateIdAndDir ,uploadTestCase.fields(fieldstoUpload) , async (req,res)=>{
    try{
        if(!req.body.name || !req.body.body ||! req.body.score || !req.body.date || !req.body.isWeb){
            throw new Error("please complete all fields");
        }   
        if(!req.files.testGenerator || !req.files.answer){
            throw new Error("both testGenerator and answer files should be send")
        }
       
        //TODO :date should be handeled
        const question= new Question({
            _id:req.objectId,
            forDate:new Date(Number(req.body.date)),
            name: req.body.name,
            body: req.body.body,
            examples: JSON.parse(req.body.examples),
            author: req.admin._id,
            testGeneratorPath: req.files.testGenerator[0].path,
            answerPath: req.files.answer[0].path,
            score:Number(req.body.score),
            isWeb:req.body.isWeb
            
        })
        //bug in deleting folders in unexpected fields
        
        await question.save().then(()=>{
            logger.info("question saved successfully");
        })
        delete question.examples[0]._id;
        await question.save();
        res.status(201).send(question);
    }catch(err){
        await removeDir(req.objectId,'questions');
        logger.error(err.message);
        res.status(400).send({error:err.message});
    }

});
//get questions
router.get("/", authenticateAdmin, async(req,res)=>{
    try{
        //forDates should be handled
        const questions = await Question.find({});
        res.status(200).send(questions);
    }catch(err){
        logger.error(err.message);
        res.status(500).send({
            error:err.message
        });
    }
});
//get specific question
router.get("/:id",authenticateAdmin, async(req,res)=>{
    try{
        const question = await Question.findById({
            _id:req.params.id
        });
        if(!question) throw new Error("Couldnt find requested question");
        res.status(200).send(question);
    }catch(err){
        res.status(500).send({
            message:err.message
        })
    }
});
//update question
router.patch("/:id", authenticateAdmin, patchHandler.fields(fieldstoUpload), async(req,res)=>{
    try{
        const question = await Question.findOne({
            _id:req.params.id
        }).catch(err=>{
            //customize errors
            throw new Error("couldn't find the question");
        })
    for(let fieldToUpdate in req.body){
        if(fieldToUpdate=== "examples"){
            const exampleList= JSON.parse(req.body.examples);
            question.examples=[];
            await question.save();
            for(let example of exampleList){
                question.examples.push(example);
            }
        }else{
            question[fieldToUpdate]=req.body[fieldToUpdate];
        }
    }
    await question.save().then(()=>{
        logger.info("question updated successfully");
    })
    res.status(200).send({
        updatedQuestion:question,
        message:"successfully updated"});
    }catch(err){
        logger.error({
            error:err.message
        });
        res.status(500).send({
            error:err.message
        })
    }

});
//delete question
router.delete("/:id",authenticateAdmin,async (req,res)=>{
    try{
        await Question.findOneAndRemove({
            _id:req.params.id
        }).then(removedQuestion=>{
            logger.info("question successfully removed");
            removeDir(removedQuestion._id,"questions");
            res.status(200).send({
                removedQuestion,
                message: "successfully removed"});
        });
    }catch(err){
        logger.error(err.message);
        res.status(500).send({
            message: err.message
        });
    }
});
const submitFields=[
    {name:'code', maxCount:1},
    {name:'output', maxCount:1}
]
//submit question
router.post("/submit",authenticateUser,submittion.fields(submitFields),async(req,res)=>{
    try{
        if(!req.body.questionID || !req.files.output ){
            res.status(400).send({
                message: "please complete all fields"
            });
            return;
        }

        const user= req.user;
        const questionId= req.body.questionID;
        //check if question is type web
        const question = await Question.findById({
            _id:questionId,
        });
        //no need to handle the case if question doesn't exist
        const isWeb= question.isWeb;
        if (!isWeb){
            if(!req.files.code){
                res.status(400).send({
                    message: "please add code file"
                });
                return;
            }
        }
        const isSolved = user.codes.find(obj=> String(obj.forQuestion)===String(questionId));
        if(isSolved){
            res.status(400).send({
                message: "You already solved this question"
            });
            return;
        }

        const codePath = isWeb ? '':`./data/user-submits/${user.studentNumber}/
            ${questionId}/${req.files.code[0].originalname}`;
        const result = readOutput(req.files.output[0].path);
        if(!result) throw new Error("couldn't read uploaded output");

        const questionData = user.testCases.find(obj=> String(obj.forQuestion)===String(questionId));
        if(!questionData){
            throw new Error(" couldn't find question with specified id");
        }
        const correctOutputPath=questionData.correctOutput;
        const correctOutput = readOutput(correctOutputPath);

        if(correctOutput === result){
            user.codes = user.codes.concat({
                forQuestion: questionId,
                codePath: codePath,
                date: Date.now()
            });
            await user.save();
            res.status(200).send({message:"you solved it :)"})
        }else{
            await removeDir(`${req.user.studentNumber}/${req.body.questionID}`,"user-submits");
            res.status(406).send({
                message: "output is wrong . try again "
            })
        }

        // possibly doing other things in here
    }catch(err){
        await removeDir(`${req.user.studentNumber}/${req.body.questionID}`,"user-submits");
        logger.error(err);
        res.status(500).send(
           { message:err.message}
        )
    }
});
router.get('/:id/testcase',authenticateUser,async(req,res)=>{
    try{
        const question = await Question.findOne({
            _id:req.params.id
        });
        if( ! question ) throw new Error(" couldn't find question with specified id");
        let extName = ".txt" ;
        if(question.isWeb){
            extName = ".html"
        }
        const user=req.user;
        const savedTestCase = user.testCases.find(obj => obj.forQuestion == req.params.id);
        let options={
            root:process.cwd()
        }
        if(savedTestCase){
            res.status(200)
                .sendFile(`./data/user-data/${user.studentNumber}/${req.params.id}/testCase${extName}`,options);
        }else{
            const studentNumber = user.studentNumber;
            const testGeneratorPath = question.testGeneratorPath;
            const answerPath = question.answerPath;
            const generatedTestCase = await runScript(testGeneratorPath,studentNumber);
            const expectedAnswer = await runScript(answerPath, studentNumber); // NOT SURE
            if (!generatedTestCase) throw new Error ("couldn't create test case");

            const testCasePath= await saveFile(`./data/user-data/${studentNumber}/${req.params.id}/`
            ,`testCase${extName}`,generatedTestCase.trim());
            const correctOutputPath=await saveFile(`./data/user-data/${studentNumber}/${req.params.id}/`,
            'correctOutput.txt',expectedAnswer.trim());

            user.testCases = user.testCases.concat({
                forQuestion: req.params.id,
                input: testCasePath,
                correctOutput: correctOutputPath
            });
            await user.save();    
            res.status(200).sendFile(`./data/user-data/${studentNumber}/${req.params.id}/testCase${extName}`,options);
        }
    }catch(err){
        logger.error(err);
        res.send({
            message:err.message
        });
    }
});
//getting specific question with specified testcase
module.exports=router;