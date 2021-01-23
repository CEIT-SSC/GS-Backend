const SuperUser = require("./models/SuperUser");
const mongoose= require ("mongoose");
const config= require("./utils/config");
const del = require ('del');
const fs= require('fs')
// const { delete } = require("./app");
// if(process.argv.length<3) console.log("enter username and password");
async function dropDB(){
    const connection=mongoose.createConnection(config.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useFindAndModify:false,
        useCreateIndex:true
    });
    connection.dropDatabase().then(async()=>{
        console.log("db droped");
        await deleteData();
        createSuperUser();
    });
}
async function createSuperUser(){
    mongoose.connect(config.MONGODB_URL,{
                useNewUrlParser:true,
                useUnifiedTopology:true,
                useFindAndModify:false,
                useCreateIndex:true
            });
    const username=process.env.SUPER_NAME;
    const password=process.env.SUPER_PASS;
    const newSuper= new SuperUser({
        username:username,
        password:password,
    });
    newSuper.save().then(result=>{
        console.log("superuser created");
        mongoose.disconnect();
    }).catch(error=> console.log(error));
}
async function deleteData(){
    
    const directories = await fs.readdirSync('./data/questions', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
    directories.forEach(directory=>{
         del('./data/questions/'+directory);
    });
    const submits = fs.readdirSync('./data/user-submits', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
    submits.forEach(submit=>{
         del('./data/user-submits/'+submit);
    });
}
dropDB();




