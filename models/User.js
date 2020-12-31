const mongoose = require("mongoose");
const {default : validator }= require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require ("../utils/config");
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
            },
            state:{
                type: String, 
                enum: ['finished' , 'workingOn' , 'notTouched'],
                default: 'notTouched',
                require: true
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

//TODO : add toJSON method
userSchema.methods.toJSON=function(){
    const user= this;
    const userObj=user.toObject();
    delete userObj.tokens;
    delete userObj.password;
    delete userObj._id;
    delete userObj.__v;
    return userObj;
}
//TODO : add jwt authentication
userSchema.methods.generateAuthToken=async function(){
    const user=this;
    const token =jwt.sign({_id:user._id.toString()}, config.JWT_SECRET);

    user.tokens= user.tokens.concat({token});
    await user.save();

    return token;
}
userSchema.statics.findByCredentials = async (studentNumber, password)=>{
    const user= await User.findOne({studentNumber});

    if(!user){
        throw new Error("failded to identify user");
    }
    const isPassMatch = await bcrypt.compare(password,user.password);
    // console.log(isPassMatch)
    if(!isPassMatch){
        throw new Error("failded to identify user");
    }
    return user;
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


