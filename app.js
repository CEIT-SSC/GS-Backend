const { baseURL}= require("./utils/config")
const unknownEndpointHandler =require("./middlewares/unknownEndpoint");
const errorHandler= require("./middlewares/errorHandler");
const express= require("express");
const app=express()

const cors= require("cors");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended:false}));


// const swaggerJSDoc= require('swagger-jsdoc');
const yaml =require("yamljs");
const swaggerSetUp=yaml.load("./swagger.yaml");
const swaggerUI= require('swagger-ui-express');

//route handlers
app.use(`/superarea`,require("./routers/superuser"));
app.use('/questionadmin',require("./routers/questionAdmin"));
app.use('/user',require("./routers/user"));
app.use('/question', require("./routers/question"));
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerSetUp));
app.use('/scoreboard', require("./routers/scoreboard"));
app.use(unknownEndpointHandler);
app.use(errorHandler);
module.exports = app;