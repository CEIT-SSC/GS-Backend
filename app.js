const { baseURL}= require("./utils/config")
const unknownEndpointHandler =require("./middlewares/unknownEndpoint");
const errorHandler= require("./middlewares/errorHandler");
const express= require("express");
const app=express()

const cors= require("cors");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended:false}));

//route handlers
app.use(`/superarea`,require("./routers/superuser"));
app.use('/questionadmin',require("./routers/questionAdmin"));
app.use('/user',require("./routers/user"));

app.use(unknownEndpointHandler);
app.use(errorHandler);
module.exports = app;