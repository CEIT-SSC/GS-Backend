const mongoose= require("mongoose");
const logger= require("../utils/logger");
const config= require("../utils/config");

async function dbConnect(){
    logger.info("connecting to ",config.MONGODB_URL);
    await mongoose.connect(config.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useFindAndModify:false,
        useCreateIndex:true
    }).then(()=>{
        logger.info("connected to MongoDB");
    }).catch((error)=>{
        logger.error("ran into error while connecting to MongoDB:",error.message);
    })
}
module.exports = dbConnect;