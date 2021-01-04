const { spawnSync } = require ("child_process");
const { stderr } = require("process");
const config = require ("./config");
const logger = require ('./logger');
const fs = require ("fs");
async function runScript(testGeneratorPath, studentNumber){

    const script= await spawnSync(`sh`,['./testcase.sh',testGeneratorPath,studentNumber]);
    if(!script.status){
        return script.stdout.toString();
    }else{
        logger.error("couldn't create test cases for user");
    }
    // script.stdout.on("data" , data=>{
    //     logger.info('test cases generated successfully');
    //     console.log(data.toString());
    //     return data;
    // });

    // script.stderr.on('data', data =>{
    //     logger.error(`stderr:${data}`);
    //     return 0;
    // });

    // script.on('error',error=>{
    //     logger.error(error);
    //     return 0;
    // });


    // script.on('close' , code =>{
    //     if(code != 0){
    //         logger.error("couldn't create test cases for user");
    //         return 0;
    //     }
    // });
}

async function saveTestCase(questionId,data){
    await fs.writeFileSync(`./data/questions/${questionId}/saveTestCase.txt`,data);
}


module.exports = {
    runScript,
    saveTestCase
}