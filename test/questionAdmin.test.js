const SuperUser = require ("../models/SuperUser");
const QuestionAdmin = require ("../models/QuestionAdmin");
const mongoose= require("mongoose");
const chai =require ('chai');
const chaiHttp = require ('chai-http');
const app = require('../index');
chai.should();
chai.use(chaiHttp);

describe("Quesition Admin Test",()=>{

    let authToken;
    before('creating superuser',(done)=>{
        const superDummy= new SuperUser({
            username:"dumbass",
            password: "dumbpass"
        })
        superDummy.save().then(()=>{
            chai.request(app)
            .post("/superarea/login")
            .send({
                username: 'dumbass',
                password: 'dumbpass'
            })
            .end((err,res)=>{
                if(err)done(err)
                authToken=res.body.token;
                done();
            });
        });
    });
    after('droping dummy superusers',function(done){
        SuperUser.findOneAndRemove({username: 'dumbass'}).then(result=>{
            done();
        }).catch(err=>done(err));
    });




    it("Creating new Question Admin /questionadmin/ POST",function(done){
        QuestionAdmin.findOneAndDelete({username:"dummyQadmin"}).then(()=>{
            chai.request(app)
            .post('/questionadmin/')
            .set('Authorization',`Bearer ${authToken}`)
            .send({
                username: "dummyQadmin",
                password: "dummpyQpass12"
            })
            .end((err,res)=>{
                if(err) done(err);
                res.should.have.status(201);
                res.body.should.have.property("questionAdmin");
                res.body.questionAdmin.should.have.property("username").equal("dummyQadmin");
                res.body.should.have.property("message").equal("question admin created successfully");
                done();
            });
        });
    });

    it("getting all question admins /questionadmin/ GET",function(done){
        chai.request(app)
            .get("/questionadmin/")
            .set('Authorization',`Bearer ${authToken}`)
            .end((err,res)=>{
                if(err) done(err)
                res.body.should.be.a("array");
                res.should.have.status(200);
                res.body[0].should.have.property("_id");
                res.body[0].should.have.property("username");
                done();
            });
    });

    it("getting specified question admin /questionadmin/{username} GET",function(done){
        chai.request(app)
            .get("/questionadmin/dummyQadmin")
            .set('Authorization',`Bearer ${authToken}`)
            .end((err,res)=>{
                if(err) done(err)
                res.body.should.be.a("object");
                res.should.have.status(200);
                res.body.should.have.property("_id");
                res.body.should.have.property("username").equal("dummyQadmin");
                done();
            });
    });
    it("patching specified question admin /questionadmin/{username} GET",function(done){
        QuestionAdmin.findOneAndDelete({username:"newDummyQadmin"}).then(()=>{
            chai.request(app)
            .patch("/questionadmin/dummyQadmin")
            .set('Authorization',`Bearer ${authToken}`)
            .send({
                username: "newDummyQadmin"
            })
            .end((err,res)=>{
                if(err) done(err);
                res.should.have.status(200);
                res.body.should.have.property("message").equal("question admin updated successfully");
                done();
            });
        });
    });
    it("getting patched question admin",function(done){
        chai.request(app)
            .get("/questionadmin/newDummyQadmin")
            .set('Authorization',`Bearer ${authToken}`)
            .end((err,res)=>{
                if(err) done(err)
                res.body.should.be.a("object");
                res.should.have.status(200);
                res.body.should.have.property("_id");
                res.body.should.have.property("username").equal("newDummyQadmin");
                done();
            });
    });
    describe("testing login and logout",()=>{
        let adminAuth;
        it("testing question admin login /questionadmin/login",function(done){
            chai.request(app)
                .post("/questionadmin/login")
                .send({
                    username: "newDummyQadmin",
                    password: "dummpyQpass12"
                })
                .end((err,res)=>{
                    if(err)done(err);
                    res.should.have.status(200);
                    res.body.should.have.property("questionAdmin");
                    res.body.should.have.property("token");
                    adminAuth=res.body.token;
                    done();
                });
        });
    });
});