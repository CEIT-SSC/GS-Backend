const mongoose= require("mongoose")

const questionSchema= new mongoose.Schema({
    forDate:{
        type:Date,
        required: true,
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
questionSchema.methods.toJSON=function(){
    const question = this;
    const questionObj=question.toObject();
    console.log(questionObj)
    delete questionObj._id;
    return questionObj;
}

module.exports=new mongoose.model("Question",questionSchema);