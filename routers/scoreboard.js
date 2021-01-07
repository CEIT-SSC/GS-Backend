
const router = require ("express").Router();
const User = require ("../models/User");

router.get("/",async(req,res)=>{
    try{
        const allUsers= await User.find()
            .populate('codes.forQuestion')
            .then(allUsers => {
                return allUsers;
            });
        


        let allUserData = allUsers.map(user=>{
            let penalty=0;
            let userScore=0;
            for(let code of user.codes){
                console.log(code)
                const forDate= code.forQuestion.forDate;
                const submittedDate = code.date;
                penalty = submittedDate-forDate;
                userScore+=code.forQuestion.score;
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
        // console.log(allUsers);
        res.status(200).send(allUserData)
    }catch(error){
        res.status(500).send({
            message:error.message
        });
    }
});



module.exports = router;