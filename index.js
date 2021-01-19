const app = require("./app");
const config = require("./utils/config");
const logger = require("./utils/logger");
//connect to db
require("./db/configureDB");

app.listen(config.PORT ||3000 , ()=>{
    logger.info(`Server is running on port ${config.PORT}`);
});
module.exports= app;
