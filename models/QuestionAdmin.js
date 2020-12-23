const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt =require("jsonwebtoken");
const { default: validator } = require("validator");


const questionAdminSchema= new mongoose.Schema({
    username:{
        type: String,
        unique:true,
        required: true
    },
    password:{
        type: String,
        required:true,
        validate(value){
            if(validator.isNumeric(value)||validator.isAlpha){
                throw new Error("رمز عبور ضعیف می باشد")
            }
        }
    },
    permissions:[
        {
            permission:{
                type:String,
                required:true
            }
        }
    ]
});

// TODO toJSON

// TODO pre-save hash
module.exports=new mongoose.model("QuestionAdmin", questionAdminSchema);