const { spawnSync } = require ("child_process");
const { stderr } = require("process");
const config = require ("./config");
const logger = require ('./logger');
const fs = require ("fs");
async function getTestCase(scriptPath, studentNumber){

    const script= await spawnSync(`sh`,['./scripts/testcase.sh',scriptPath,studentNumber]);
    if(!script.status){
        return script.stdout.toString().trim();
    }else{
        throw Error("couldn't create test cases for user");
    }
}

async function getAnswer(scriptPath, generatedTestCase){
    const script= await spawnSync(`/bin/bash`,['./scripts/correctOutput.sh',scriptPath],{input: generatedTestCase});
    if(!script.status){
        console.log(script.stdout.toString())
        return script.stdout.toString();
    }else{
        console.log(script.stderr.toString().trim())
        throw Error("can't get the answer");
    }
}

function readOutput(filePath){
    const output =fs.readFileSync(filePath, 'utf-8');
    return output.trim();
}

async function saveFile(directory,name,content){
    if(!fs.existsSync(directory)){
        fs.mkdirSync(directory,{recursive:true});
    }
    const saveDir=directory+name;
    await fs.writeFileSync(saveDir,content);
    console.log(`${name} saved successfully`);
    return saveDir;
}

module.exports = {
    getTestCase,
    readOutput,
    saveFile,
    getAnswer
}