const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const jwt = require ("jsonwebtoken")

const superSchema= new mongoose.Schema({
    username:{
        type:String,
        required: true,
        trim: true,
        unique: true,
        toLower:true,
        minlength: true
    },
    password:{
        type:String,
        required: true
    },
    permissions:[
        {
            permission:{
                type:String,
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

superSchema.statics.findByCredentials= async(username,password)=>{
    const admin= await SuperUser.findOne({username});
    
    if(!admin){
        throw new Error("User couldn't be found\n enable to login");
    
    }
    
    const isPassMatch = await bcrypt.compare(password, admin.password);
    if(!isPassMatch) {
        throw new Error("password didn't match \n enable to login")
    };
    return admin
}

