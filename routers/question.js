const router = require ("express").Router();
const Question = require ("../models/Question");
const User= require("../models/User");
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

const {
    getTestCase,
    getAnswer
    } = require("../utils/utils");

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


router.post("/", authenticateAdmin , generateIdAndDir ,uploadTestCase.fields(fieldstoUpload) , async (req,res)=>{
    try{
        //checking request fields
        if(!req.body.name || !req.body.body ||! req.body.score || !req.body.date || !req.body.isWeb
           || !req.files.testGenerator || !req.files.answer){
            res.status(400).send({
                error:"please complete all fields"
            })
            return;
        }   

        //create and save question 
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
            
        });
        await question.save();
        
        //sending question 
        res.status(201).send(question);
    }catch(err){
        await removeDir(req.objectId,'questions');
        logger.error(err.message);
        res.status(500).send({
            error:"couldn't save question",
        });
    }

});

router.get("/", authenticateAdmin, async(req,res)=>{
    try{
        //getting all questions and sending them 
        const questions = await Question.find({});
        res.status(200).send(questions);
    }catch(err){
        logger.error(err.message);
        res.status(500).send({
            error:err.message
        });
    }
});

router.get("/:id",authenticateAdmin, async(req,res)=>{
    try{
        const question = await Question.findById({
            _id:req.params.id
        });
        if(!question){
            res.status(404).send({
                error:"Couldnt find requested question"
            });
            return;
        } 
        res.status(200).send(question);
    }catch(err){
        res.status(500).send({
            error:err.message
        })
    }
});

router.patch("/:id", authenticateAdmin, patchHandler.fields(fieldstoUpload), async(req,res)=>{
    try{
        const question = await Question.findOne({
            _id:req.params.id
        });
        if(!question){
            res.status(404).send({
                error:"Couldnt find requested question"
            });
            return;
        } 
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
        if (req.files.testGenerator) {
            question.testGeneratorPath = req.files.testGenerator[0].path;
          }
        
        if (req.files.answer) {
            question.answerPath = req.files.answer[0].path;
        }
    await question.save()
    logger.info("question updated successfully");
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

router.delete("/:id",authenticateAdmin,async (req,res)=>{
    try{
        Question.findOneAndRemove({
            _id:req.params.id
        },(err,removedQuestion)=>{
            if(err){
                throw err;
            }else if(!removedQuestion){
                res.status(404).send({
                    error: "couldn't find requested question"
                });
                return;
            }
            logger.info("question successfully removed");
            removeDir(removedQuestion._id,"questions");
            res.status(200).send({
                removedQuestion,
                message: "successfully removed"});
        });
    }catch(err){
        logger.error(err.message);
        res.status(500).send({
            error: err.message
        });
    }
});
const submitFields=[
    {name:'code', maxCount:1},
    {name:'output', maxCount:1}
]

router.post("/submit",authenticateUser,submittion.fields(submitFields),async(req,res)=>{
    try{
        if(!req.body.questionID || !req.files.output ){
            res.status(400).send({
                error: "please complete all fields"
            });
            await removeDir(`${req.user.studentNumber}/${req.body.questionID}`,"user-submits");
            return;
        }

        const user= req.user;
        const questionId= req.body.questionID;
        //check if question is type web
        const question = await Question.findById({
            _id:questionId,
        });
        //no need to handle the case if question doesn't exist
        if(!question){
            res.status(404).send({
                error: "couldn't find a question with specified id"
            });
            await removeDir(`${req.user.studentNumber}/${req.body.questionID}`,"user-submits");
            return;
        }
        const isWeb= question.isWeb;
        if (!isWeb){
            if(!req.files.code){
                res.status(400).send({
                    error: "please add code file"
                });
                await removeDir(`${req.user.studentNumber}/${req.body.questionID}`,"user-submits");
                return;
            }
        }
        const isSolved = user.codes.find(obj=> String(obj.forQuestion)===String(questionId));
        if(isSolved){
            res.status(400).send({
                error: "You already solved this question"
            });
            await removeDir(`${req.user.studentNumber}/${req.body.questionID}`,"user-submits");
            return;
        }

        const codePath = isWeb ? '':`./data/user-submits/${user.studentNumber}/
            ${questionId}/${req.files.code[0].originalname}`;
        const result = readOutput(req.files.output[0].path);
        if(!result) throw new Error("couldn't read uploaded output");

        const questionData = user.testCases.find(obj=> String(obj.forQuestion)===String(questionId));
        if(!questionData){
            throw new Error("You should get testcase before submitting");
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
                error: "output is wrong. try again "
            })
        }
    }catch(err){
        await removeDir(`${req.user.studentNumber}/${req.body.questionID}`,"user-submits");
        logger.error(err);
        res.status(500).send(
           { error:err.message}
        )
    }
});
router.get('/:id/testcase',authenticateUser,async(req,res)=>{
    try{
        const question = await Question.findOne({
            _id:req.params.id
        });
        if( ! question ) {
            res.status(404).send({
                error: "Couldn't find question with specified id"
            });
            return;
        }

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
            //
            const studentNumber = user.studentNumber;
            const testGeneratorPath = question.testGeneratorPath;
            const answerPath = question.answerPath;
            //generating testcase and correctoutput
            const generatedTestCase = await getTestCase(testGeneratorPath,studentNumber);
            const expectedAnswer = await getAnswer(answerPath, generatedTestCase); //correctOutput == expected answer

            // error in testcase and answer generation should be handles by their functions
            // if (!generatedTestCase || !expectedAnswer) throw new Error ("couldn't create test case");

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
            error:err.message
        });
    }
});
router.get('/:id/whosolved',async (req,res)=>{
    try{
        const question = await Question.findOne({
            _id:req.params.id
        });
        let goodBoys=[]
        const allUsers= await User.find();
        for(let user of allUsers){
            const didSolved = user.codes.find(obj=> String(obj.forQuestion)==String(req.params.id));
            if(didSolved){
                goodBoys.push({
                    studentNumber:user.studentNumber,
                    penalty: didSolved.date - question.forDate
                });
            }
        }
        res.status(200).send(goodBoys);
    }catch(err){
        res.status(500).send({
            error:err.message
        });
    }
});
module.exports=router;