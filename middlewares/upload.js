const multer = require ("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const logger = require("../utils/logger");
const path= require ("path");
const glob = require ("glob");
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

        cb(null, file.originalname);
    }
});
const patchStorage= multer.diskStorage({
    destination:async function (req,file,cb){

        const files=glob.sync(`./data/questions/${req.params.id}/${file.fieldname}*`,
        );
        files.forEach(file=>{
            fs.unlink(file,err=>{
                if(err) cb(new Error(err));
            });
        });
        // removeFiles(req.params.id,file.fieldname);
        cb(null,`./data/questions/${req.params.id}/`);
    },
    filename: function ( req, file, cb){
        const ext=path.extname(file.originalname);
        cb(null, `${file.fieldname}_${req.params.id}`+ext);
    }
})
const submittion= multer({
    storage:submitStorage
})
const patchHandler = multer({
    storage:patchStorage
})
module.exports={
    uploadTestCase,
    generateIdAndDir,
    submittion,
    patchHandler
};