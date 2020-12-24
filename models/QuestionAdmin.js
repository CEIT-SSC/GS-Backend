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
    }
});

// TODO toJSON
questionAdminSchema.statics.findByCredentials = async function(username, password){
    const qAdmin= await questionAdminSchema.findOne({username});
    
    if(!qAdmin){
        throw new Error("admin couldn't be found");
    }
    const isPassMatch = bcrypt.compare(password,qAdmin.password);
    
    if(!isPassMatch){
        throw new Error("Entered password wasn't correct");
    }

    return qAdmin;
}

// TODO pre-save hash
questionAdminSchema.pre('save',async function(next){
    const questionAdmin=this;
    if(questionAdmin.isModified('password')){
        questionAdmin.password=await bcrypt.hash(questionAdmin.password,8);
        next();
    }
})
module.exports=new mongoose.model("QuestionAdmin", questionAdminSchema);