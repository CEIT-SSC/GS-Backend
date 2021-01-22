const Question= require ("../models/Question");
const QuestionAdmin = require ("../models/QuestionAdmin");

const chai =require ('chai');
const chaiHttp = require ('chai-http');
const app = require('../index');
chai.should();
chai.use(chaiHttp);

describe("Question Test" , ()=>{

    let authToken;
    before('creating questioadmin',(done)=>{
        const questionAdmin = new QuestionAdmin({
            username: "dumbAdmin",
            password: "dumbPass"
        });
        questionAdmin.save()
            .then(()=>{
                chai.request(app)
                    .post("/questionadmin/login")
                    .send({
                        username: "dumbAdmin",
                        password: "dumbPass"
                    })
                    .end((err,req)=>{
                        if(err)done(err)
                        req.should.have.status(200);
                        req.body.should.have.property("token").not.empty;
                        authToken=req.body.token;
                        done();
                    })
            });
    });
    after('droping dummy superusers',function(done){
        QuestionAdmin.findOneAndRemove({username: 'dumbAdmin'}).then(result=>{
            done();
        }).catch(err=>done(err));
    });

    
});
