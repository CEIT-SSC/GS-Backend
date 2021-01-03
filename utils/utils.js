const { spawn } = require ("child_process");
const { stderr } = require("process");
const config = require ("./config");
const logger = require ('./logger')


function runScript(testGeneratorPath, studentNumber){
    const script= spawn(`sh ${config.SCRIPT_PATH}`,[testGeneratorPath,studentNumber]);
    script.on('error',error=>{
        logger.error(error);
        return 0;
    });
    script.stderr.on('data', data =>{
        logger.error(`stderr:${data}`);
        return 0;
    });
    script.stdout.on('data' , data=>{
        logger.info('test cases generated successfully');
        return data;
    });
    script.on('close' , code =>{
        if(code == 0){
            logger.error("couldn't create test cases for user");
            return 0;
        }
    });
}



module.exports = {
    runScript
}