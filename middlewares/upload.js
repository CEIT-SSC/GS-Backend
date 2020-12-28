const multer = require ("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const logger = require("../utils/logger");
const path= require ("path");

const testCaseStorage = multer.diskStorage({
    destination: function( req, file, cb){
        cb(null,`./data/questions/${req.objectId}`);
    },
    filename: function( req, file, cb) {
        const ext=path.extname(file.originalname);
        if(file.fieldname === "testGenerator"){
            cb(null, `testGenerator_${req.objectId}`+ext);
        }
        else if (file.fieldname === "answer"){
            cb(null, `answer_${req.objectId}`+ext);
        }
    }
});

// const generateFilter = (req, file, cb)=>{
    // if(file.fieldname ==="input" || file.fieldname==="output"){
    //     if(!file.originalname.match(/\.(txt)$/)){
    //         cb(new Error("please upload a text file"));
    //     }
    //     cb(undefined,true);
    
//     if(file.fieldname === "testGenerator"){
//         cb(null,true);
//     }

// }
const uploadTestCase = multer ({
    storage:testCaseStorage,
    // fileFilter: generateFilter
});
const generateIdAndDir = function (req,res,next){
    const id = mongoose.Types.ObjectId();
    req.objectId=id;
    if(!fs.existsSync(`./data/questions/${id}`)){
        fs.mkdir(`./data/questions/${id}`,{recursive:true},(err)=>{
            if(err){
                logger.error(err.message);
            }else{
                logger.info("directory created successfully");
                next();
            }
        });
    }
}
const submitStorage= multer.diskStorage({
    destination: function( req, file, cb){
        const id =req.user.studentNumber;
        const questionId = req.body.questionID;
        if(!fs.existsSync(`./data/user-submits/${id}/${questionId}`)){
            fs.mkdir(`./data/user-submits/${id}/${questionId}`,{recursive:true},(err)=>{
                if(err){
                    logger.error(err);
                    cb(new Error(err.message));
                }else{
                    logger.info("directory created successfully");
                }
            });
        }
        cb(null,`./data/user-submits/${id}/${questionId}`);
    },
    filename: function( req, file, cb) {
        const ext=path.extname(file.originalname);
        cb(null, file.originalname+ext);
    }
});

const submittion= multer({
    storage:submitStorage
})
module.exports={
    uploadTestCase,
    generateIdAndDir,
    submittion
};