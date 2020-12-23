require("dotenv").config()

const PORT=process.env.PORT
const MONGODB_URL=process.env.MONGODB_URL
const JWT_SECRET=process.env.JWT_SECRET
const baseURL=process.env.baseURL
module.exports={
    MONGODB_URL,
    PORT,
    JWT_SECRET,
    baseURL
}
