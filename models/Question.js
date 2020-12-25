const mongoose= require("mongoose")

const questionSchema= new mongoose.Schema({
    forDate:{
        type:Date,
        required: true,
        default: Date.now
    },
    name:{
        type: String,
        required: true,
    },
    body:{
        type: String,
        required:true,
    },
    examples:[
        {
            input:{
                type: String,
                required:true,
            },
            output:{
                type: String,
                required: true
            }
        }
    ],
    testGeneratorPath:{
        type:String,
        required:true
    },
    answerPath:{
        type: String,
        required:true
    }
});
// TODO toJson 


module.exports=new mongoose.model("Question",questionSchema);