const multer = require ("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const logger = require("../utils/logger");

const testCaseStorage = multer.diskStorage({
    destination: function( req, file, cb){
        console.log(file)
        cb(null,`./data/questions/${req.objectId}`);
    },
    filename: function( req, file, cb) {
        if(file.fieldname === "testGenerator"){
            cb(null, `testGenerator_${req.objectId}`);
        }
        else if (file.fieldname === "answer"){
            cb(null, `answer_${req.objectId}`);
        }
    }
});

const generateFilter = (req, file, cb)=>{
    // if(file.fieldname ==="input" || file.fieldname==="output"){
    //     if(!file.originalname.match(/\.(txt)$/)){
    //         cb(new Error("please upload a text file"));
    //     }
    //     cb(undefined,true);
    
    if(file.fieldname === "testGenerator"){
        cb(null,true);
    }

}
const uploadTestCase = multer ({
    storage:testCaseStorage,
    fileFilter: generateFilter
});
const generateId = function (req,res,next){
    const id = mongoose.Types.ObjectId();
    req.objectId=id;
    next();
}
const generateDir= function (req,res,next){
    fs.mkdir(`./data/questions/${req.objectId}`,(err)=>{
        if(err){
            logger.error(err.message);
        }else{
            logger.info("directory created successfully");
            next();
        }
    })
}

module.exports={
    uploadTestCase,
    generateId,
    generateDir
};