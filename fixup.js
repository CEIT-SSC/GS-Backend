const User = require("./models/User");
const Question  = require("./models/Question");
const mongoose = require("mongoose");
// const config = require ("../GS-Backend/utils/config")
const {
    getTestCase,
    readOutput,
    saveFile,
    getAnswer
} = require("./utils/utils");
const fs =require("fs");
async function fixTheShit(){
    await mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useFindAndModify:false,
        useCreateIndex:true
    });
    const users= await User.find();
    const questionId = String(process.argv[2]);
    const question = await Question.findOne({
        _id:questionId
    });
    const testGeneratorPath = question.testGeneratorPath;
    const answerPath = question.answerPath;
    for (let user of users){
        let studentNumber=user.studentNumber;
        forChiz(user.studentNumber,testGeneratorPath,answerPath,questionId);
    }
}
async function forChiz(studentNumber,testGeneratorPath,answerPath,questionId){
    console.log("working on" +studentNumber)
    const isSubmitted = user.codes.find(code=>String(code.forQuestion)==questionId);
    if(!isSubmitted){
        //removing from db 
        try{
            user.testCases = user.testCases.filter(testcase=>String(testcase.forQuestion)!=questionId);
            await user.save();
            //removing from filesystem
            if(fs.existsSync(`./data/user-data/${studentNumber}/${questionId}/testCase.txt`))
                fs.unlinkSync(`./data/user-data/${studentNumber}/${questionId}/testCase.txt`);
            if(fs.existsSync(`./data/user-data/${studentNumber}/${questionId}/correctOutput.txt`))
                fs.unlinkSync(`./data/user-data/${studentNumber}/${questionId}/correctOutput.txt`);
            //generating testCase
            const generatedTestCase = await getTestCase(testGeneratorPath,studentNumber);
            const expectedAnswer = await getAnswer(answerPath, generatedTestCase);
            //saving file
            const testCasePath= await saveFile(`./data/user-data/${studentNumber}/${questionId}/`
            ,`testCase.txt`,generatedTestCase.trim());
            const correctOutputPath=await saveFile(`./data/user-data/${studentNumber}/${questionId}/`,
            'correctOutput.txt',expectedAnswer.trim());
            user.testCases = user.testCases.concat({
                forQuestion: questionId,
                input: testCasePath,
                correctOutput: correctOutputPath
            });
            await user.save();  
            console.log(`${studentNumber} done`)
        }catch(err){
            console.log(err);
        }
    }
}
console.log(process.cwd());
fixTheShit();