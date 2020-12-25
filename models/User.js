const mongoose = require("mongoose");
const {default : validator }= require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema= new mongoose.Schema({
    studentNumber:{
        type:String,
        unique:true,
        sparse:true,
        required:true,
        validate(value){
            if(!validator.isNumeric(value)||(value.length<7 && value.length>8)){
                throw new Error ("شماره دانشجویی نامعتبر است");
            }
        }
        
    },
    password:{
        type: String,
        required: true,
        validate(value){
            if(validator.isNumeric(value) || validator.isAlpha(value)){
                throw new Error("رمز عبور ضعیف می باشد")
            }
            if(value.length<8){
                throw new Error("رمز عبور باید بیشتر از ۸ کاراکتر باشد");
            }
        }
    }, 
    
    testCases:[
        {
            forQuestion:
            {
                type:mongoose.Types.ObjectId,
                ref:"Question",
                required:true
            },
            input:{
                type: String,
                require:true,
            },
            correctOutput:{
                type:String
            }
        }
    ],
    
    codes:[
        {
            forQuestion:{
                type: mongoose.Types.ObjectId,
                ref:"Question",
                required: true
            },
            code:{
                type: String,
                require:true
            }
        }
    ]
});

//TODO : add toJSON method

//TODO : add jwt authentication
userSchema.methods.generateAuthToken=async function(){
    const user=this;
    const token =jwt.sign({_id:admin._id.toString()}, config.JWT_SECRET);

    user.tokens= user.tokens.concat({token});
    await user.save();

    return token;
}

userSchema.pre('save',async function(next){
    const user=this;

    if(user.isModified("password")){
        user.password=await bcrypt.hash(user.password,10);
    }
    next();
});
const User= new mongoose.model("User", userSchema);
module.exports = User;


