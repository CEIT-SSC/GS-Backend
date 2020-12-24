const SuperUser = require("./models/SuperUser");
const mongoose= require ("mongoose");
const config= require("./utils/config");
if(process.argv.length<3) console.log("enter username and password");
async function dropDB(){
    const connection=mongoose.createConnection(config.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useFindAndModify:false,
        useCreateIndex:true
    });
    await connection.dropDatabase().then(()=>{
        console.log("db droped");
        createSuperUser();
    })
}
async function createSuperUser(){
    mongoose.connect(config.MONGODB_URL,{
                useNewUrlParser:true,
                useUnifiedTopology:true,
                useFindAndModify:false,
                useCreateIndex:true
            });
    const username=process.argv[2];
    const password=process.argv[3];
    const newSuper= new SuperUser({
        username:username,
        password:password,
    });
    await newSuper.save().then(result=>{
        console.log("superuser created");
        mongoose.disconnect();
    }).catch(error=> console.log(error));
}

dropDB();




