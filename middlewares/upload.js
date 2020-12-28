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

module.exports={
    uploadTestCase,
    generateIdAndDir
};