const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt =require("jsonwebtoken");
const config = require ("../utils/config");
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
            if(validator.isNumeric(value)||validator.isAlpha(value)){
                throw new Error("رمز عبور ضعیف می باشد")
            }
        }
    },
    questions:[
        {
            question:{
                type:mongoose.Types.ObjectId,
                ref:'Question',
                required:true

            }
        }
    ],
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});

questionAdminSchema.methods.generateAuthToken=async function(){
    const admin=this;
    const token =jwt.sign({_id:admin._id.toString()}, config.JWT_SECRET);

    admin.tokens= admin.tokens.concat({token});
    await admin.save();

    return token;
}


questionAdminSchema.statics.findByCredentials = async (username, password)=>{
    console.log("Tss")

    const qAdmin= await QuestionAdmin.findOne({username});
    console.log("Tss")
    if(!qAdmin){
        throw new Error("admin couldn't be found");
    }
    const isPassMatch = bcrypt.compare(password,qAdmin.password);
    
    if(!isPassMatch){
        throw new Error("Entered password wasn't correct");
    }
    return qAdmin;
}


questionAdminSchema.pre('save',async function(next){
    const questionAdmin=this;
    if(questionAdmin.isModified('password')){
        questionAdmin.password=await bcrypt.hash(questionAdmin.password,8);
        next();
    }
})
const QuestionAdmin=new mongoose.model("QuestionAdmin", questionAdminSchema);
module.exports=QuestionAdmin;