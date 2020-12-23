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
    console.log("connection established");
    await connection.dropDatabase();
}


function createSuperUser(){
    const username=process.argv[2];
    const password=process.argv[3];
    const newSuper= new SuperUser({
        username:username,
        password:password,
    });
    newSuper.save().then(result=>{
        console.log("superuser created");
        mongoose.connection.close();
    }).catch(error=> console.log(error));
}

dropDB();
createSuperUser();



