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
    after('droping dummy superusers',function(done){
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
});
