const { spawnSync } = require ("child_process");
const { stderr } = require("process");
const config = require ("./config");
const logger = require ('./logger');
const fs = require ("fs");
async function runScript(scriptPath, studentNumber){

    const script= await spawnSync(`sh`,['./testcase.sh',scriptPath,studentNumber]);
    if(!script.status){
        return script.stdout.toString();
    }else{
        logger.error("couldn't create test cases for user");
    }
}

function readOutput(filePath){
    const output =fs.readFileSync(filePath, 'utf-8');
    return output;
}


module.exports = {
    runScript,
    readOutput
}