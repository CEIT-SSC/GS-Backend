require("dotenv").config()

const PORT=process.env.PORT
const MONGODB_URL=process.env.MONGODB_URL
const JWT_SECRET=process.env.JWT_SECRET
const baseURL=process.env.baseURL
const SUPERUSER_NAME = process.env.SUPERUSER_NAME
const SUPERUSER_PASS = process.env.SUPERUSER_PASS

module.exports={
    MONGODB_URL,
    PORT,
    JWT_SECRET,
    baseURL,
    SUPERUSER_PASS,
    SUPERUSER_NAME
}
