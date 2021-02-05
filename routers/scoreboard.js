
const router = require ("express").Router();
const User = require ("../models/User");

router.get("/",async(req,res)=>{
    try{
        const allUsers= await User.find()
            .populate('codes.forQuestion')
            .then(allUsers => {
                return allUsers;
            });
        if(!allUsers){
            res.status(200).send({
                newbies:[],
                notNoob:[]
            });
            return ;
        }
        let allUserData = allUsers.map(user=>{
            let penalty=0;
            let userScore=0;
            if(user.codes){
                for(let code of user.codes){
                    const forDate= code.forQuestion.forDate;
                    const submittedDate = code.date;
                    penalty = submittedDate-forDate;
                    userScore+=code.forQuestion.score;
                }
            }
            return {
                studentNumber: user.studentNumber,
                penalty: penalty,
                score: userScore
            }
        });
        allUserData = allUserData.sort((fisrtUser,secondUser)=>{
            if(fisrtUser.score > secondUser.score) return -1;
            else if(fisrtUser.score == secondUser.score){
                return fisrtUser.penalty<=secondUser.penalty?-1:1;
            }else return 1;
        });
        let newbies =[];
        let notNoob =[];
        allUserData.forEach(user=>{
            if(user.studentNumber.startsWith('99')) newbies.push(user);
            else notNoob.push(user);
        })
        res.status(200).send({newbies, notNoob})
    }catch(error){
        res.status(500).send({
            error:error.message
        });
    }
});



module.exports = router;