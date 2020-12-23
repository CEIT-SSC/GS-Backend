const { baseURL}= require("./utils/config")

const express= require("express");
const app=express()

const cors= require("cors");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended:false}));

//route handlers
app.use(`${baseURL}/superarea`,require("./routers/superuser"));




module.exports = app;