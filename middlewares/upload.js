const mutler = require ("mutler");
const mongoose = require("mongoose");
const fs = require("fs");
const logger = require("../utils/logger");

const testCaseStorage = mutler.diskStorage({
    destination: function( req, file, cb){
        cb(null,'./data/questions');
    },
    filename: function( req, file, cb) {
    
    }
});
const uploadTestCase = multer ({
    storage:testCaseStorage,
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(txt)$/)){
            cb(new Error("please upload a text file"));
        }
        cb(undefined,true);
    }
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
        }
    })
}

module.exports={
    uploadTestCase
};