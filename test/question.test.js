const Question= require ("../models/Question");
const QuestionAdmin = require ("../models/QuestionAdmin");
const fs= require("fs");
const chai =require ('chai');
const chaiHttp = require ('chai-http');
const app = require('../index');
chai.should();
chai.use(chaiHttp);

describe("Question Test" , ()=>{

    let authToken;
    before('creating question admin',(done)=>{
        //creating dummy question admin
        const questionAdmin = new QuestionAdmin({
            username: "dumbAdmin",
            password: "dumbPass1"
        });
        questionAdmin.save().then(()=>{
            chai.request(app)
            .post("/questionadmin/login")
            .send({
                username: "dumbAdmin",
                password: "dumbPass1"
            })
            .end((err,res)=>{
                if(err)done(err)
                res.should.have.status(200);
                res.body.should.have.property("token").not.empty;
                authToken=res.body.token;
                done();
            });
        });
    });
    after('droping dummy question admin',function(done){
        QuestionAdmin.findOneAndRemove({username: 'dumbAdmin'}).then(result=>{
            done();
        }).catch(err=>done(err));
    });

    it("Creating new Qustion /question POST",(done)=>{
        chai.request(app)
            .post("/question/")
            .set('Authorization',`Bearer ${authToken}`)
            .set('content-type', 'multipart/form-data')
            .field("date",Date.now())
            .field("name","dummyName")
            .field("body","dummy body baby")
            .field("examples",'[{"input":"dummyIn","output":"dummyOut"}]')
            .field("score",50)
            .field("isWeb",1)
            .attach("testGenerator",fs.readFileSync("./test/dummyFiles/testGenerator.cpp"),'./test/testG,cpp')
            .attach("answer",fs.readFileSync("./test/dummyFiles/answer.cpp"),'./test/asnwer.cpp')
            .end((err,res)=>{
                if(err)done(err)
                res.should.have.status(201);
                res.body.should.be.a("object");
                res.body.should.have.property("name").equal("dummyName");
                res.body.should.have.property("body").equal("dummy body baby");
                res.body.should.have.property("score").equal(50);
                done();
            });
    });
    let questionId;
    it("Getting all questions /question/ GET",(done)=>{
        chai.request(app)
            .get("/question/")
            .set('Authorization',`Bearer ${authToken}`)
            .end((err,res)=>{
                if(err)done(err);
                res.should.have.status(200);
                res.body.should.be.a('array');
                questionId=res.body[0]._id;
                res.body[0].should.have.property("forDate");
                res.body[0].should.have.property("name");
                res.body[0].should.have.property("body");
                res.body[0].should.have.property("score");
                done();
            });
    });
    it("Get specific questions /question/{id} GET",(done)=>{
        chai.request(app)
            .get(`/question/${questionId}`)
            .set('Authorization',`Bearer ${authToken}`)
            .end((err,res)=>{
                if(err)done(err);
                res.body.should.be.a('object');
                res.body.should.have.property('_id').equal(questionId);
                done();
            });
    });
    
    it("Patching specific question /question/{id} PATCH",(done)=>{
        chai.request(app)
            .patch(`/question/${questionId}`)
            .set('Authorization',`Bearer ${authToken}`)
            .set('content-type', 'multipart/form-data')
            .field('name','newDummy')
            .field('body','new Dummy body')
            .attach('testGenerator',fs.readFileSync('./test/dummyFiles/testGen2.cpp'))
            .end((err,res)=>{
                if(err) done(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').equal("successfully updated");
                res.body.updatedQuestion.should.have.property('name').equal('newDummy');
                res.body.updatedQuestion.should.have.property('body').equal('new Dummy body');
                done();
            });
    });
    it('Deleting specific question /question/{id}',(done)=>{
        chai.request(app)
            .del(`/question/${questionId}`)
            .set('Authorization',`Bearer ${authToken}`)
            .end((err,res)=>{
                if(err)done(err);
                res.should.have.status(200);
                res.body.should.have.property('message').equal("successfully removed");
                done();
            });
    });
});
